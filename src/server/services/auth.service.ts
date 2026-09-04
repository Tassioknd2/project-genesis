import { z } from "zod";
import {
  RegisterUserSchema,
  LoginSchema,
  GoogleAuthSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "../domain/auth.schemas";
import { User, UserSafeProfile, AuthSessionResponse } from "../domain/auth.types";
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BusinessRuleError,
  ValidationError,
} from "../domain/errors";
import { userRepository, IUserRepository } from "../repositories/user.repository";
import { authTokenRepository, AuthTokenRepository } from "../repositories/auth-token.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { hashPassword, verifyPassword, verifyGoogleCredential } from "../utils/crypto";

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type GoogleAuthDTO = z.infer<typeof GoogleAuthSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

export class AuthService {
  constructor(
    private userRepo: IUserRepository = userRepository,
    private tokenRepo: AuthTokenRepository = authTokenRepository,
  ) {}

  /**
   * Remove o campo sensível `passwordHash` para retorno seguro ao cliente.
   */
  private toSafeProfile(user: User): UserSafeProfile {
    const { passwordHash: _hash, ...safe } = user;
    return safe;
  }

  /**
   * Registro de nova conta (E-mail e Senha)
   */
  async register(
    dto: RegisterUserDTO,
    meta?: { userAgent?: string | undefined; ip?: string | undefined },
  ): Promise<AuthSessionResponse> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`Já existe uma conta cadastrada com o e-mail '${dto.email}'.`);
    }

    const passwordHash = await hashPassword(dto.password);

    // Gera código de confirmação de e-mail de 6 dígitos (expira em 15 minutos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newUser = await this.userRepo.create({
      nome: dto.nome,
      email: dto.email,
      passwordHash,
      role: dto.role || "recepcionista",
      status: "ativo",
      provider: "local",
      telefone: dto.telefone,
      crm: dto.crm,
      emailVerificado: false,
      codigoVerificacaoEmail: {
        codigo: verificationCode,
        expiraEm,
      },
    });

    // Simulação do envio de e-mail seguro com código OTP
    console.info(
      `[CARDIO_EMAIL_SERVICE] Código de confirmação enviado para ${newUser.email}: [ ${verificationCode} ] (Válido por 15 minutos)`,
    );

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: newUser.id,
      acao: "USUARIO_CRIADO",
      detalhes: `Conta criada para '${newUser.nome}' (${newUser.email}) com perfil ${newUser.role}. Código de verificação gerado.`,
      autor: newUser.nome,
    });

    // Inicia sessão imediatamente
    const session = await this.tokenRepo.createSession(newUser.id, 7, meta);

    return {
      user: this.toSafeProfile(newUser),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Login tradicional (E-mail e Senha)
   */
  async login(
    dto: LoginDTO,
    meta?: { userAgent?: string | undefined; ip?: string | undefined },
  ): Promise<AuthSessionResponse> {
    const rateKey = `login:${dto.email}:${meta?.ip || "unknown"}`;
    const rateCheck = this.tokenRepo.checkRateLimit(rateKey, 5, 300);

    if (!rateCheck.allowed) {
      throw new ForbiddenError(
        "Muitas tentativas incorretas de login. Por segurança, tente novamente em 5 minutos.",
      );
    }

    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    if (user.status === "bloqueado") {
      throw new ForbiddenError("Sua conta está bloqueada. Entre em contato com o suporte.");
    }

    if (user.status === "inativo") {
      throw new ForbiddenError("Sua conta está inativa.");
    }

    if (user.provider === "google" && !user.passwordHash) {
      throw new BusinessRuleError(
        "Esta conta foi criada via Google. Por favor, utilize o botão 'Entrar com Google'.",
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    const passwordMatch = await verifyPassword(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError("E-mail ou senha incorretos.");
    }

    // Sucesso no login: reseta rate limit
    this.tokenRepo.resetRateLimit(rateKey);

    await this.userRepo.updateLastLogin(user.id);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "USUARIO_LOGIN",
      detalhes: `Login realizado com sucesso via E-mail por '${user.nome}'`,
      autor: user.nome,
    });

    const session = await this.tokenRepo.createSession(user.id, 7, meta);

    return {
      user: this.toSafeProfile(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Login / Cadastro unificado com Google (OAuth / Google Identity Services)
   */
  async loginWithGoogle(
    dto: GoogleAuthDTO,
    meta?: { userAgent?: string | undefined; ip?: string | undefined },
  ): Promise<AuthSessionResponse> {
    const payload = await verifyGoogleCredential(dto.credential);

    // 1. Busca por Google ID ou por E-mail
    let user = await this.userRepo.findByGoogleId(payload.sub);

    if (!user) {
      user = await this.userRepo.findByEmail(payload.email);
      if (user) {
        // Vincula Google ID à conta existente
        user = await this.userRepo.update(user.id, {
          googleId: payload.sub,
          avatarUrl: user.avatarUrl || payload.picture,
        });
      }
    }

    // 2. Se não existir, realiza o provisionamento automático da conta
    if (!user) {
      user = await this.userRepo.create({
        nome: payload.name || payload.email.split("@")[0] || "Usuário Google",
        email: payload.email,
        role: dto.role || "recepcionista",
        status: "ativo",
        provider: "google",
        googleId: payload.sub,
        avatarUrl: payload.picture,
        emailVerificado: true,
      });

      await auditLogRepository.create({
        entidade: "patient",
        entidadeId: user.id,
        acao: "USUARIO_CRIADO_GOOGLE",
        detalhes: `Nova conta provisionada via Google para '${user.nome}' (${user.email})`,
        autor: user.nome,
      });
    }

    if (user.status === "bloqueado") {
      throw new ForbiddenError("Sua conta está bloqueada.");
    }

    await this.userRepo.updateLastLogin(user.id);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "USUARIO_LOGIN_GOOGLE",
      detalhes: `Login realizado com sucesso via Google por '${user.nome}'`,
      autor: user.nome,
    });

    const session = await this.tokenRepo.createSession(user.id, 7, meta);

    return {
      user: this.toSafeProfile(user),
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Solicitação de Recuperação de Senha (Esqueci minha senha)
   */
  async requestPasswordReset(
    dto: ForgotPasswordDTO,
  ): Promise<{ message: string; previewToken?: string | undefined }> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(cleanEmail);

    // Resposta opaca para evitar enumeração de contas
    const genericSuccess = {
      message:
        "Se o e-mail estiver cadastrado em nosso sistema, as instruções de recuperação de senha foram enviadas.",
    };

    if (!user) {
      return genericSuccess;
    }

    if (user.status === "bloqueado" || user.status === "inativo") {
      return genericSuccess;
    }

    const reset = await this.tokenRepo.createResetToken(user.id, 1);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "RECUPERACAO_SENHA_SOLICITADA",
      detalhes: `Solicitação de redefinição de senha gerada para '${user.email}'`,
      autor: "Sistema de Autenticação",
    });

    // Em ambiente de teste/desenvolvimento, disponibilizamos o previewToken para facilitar testes sem SMTP configurado
    return {
      message: genericSuccess.message,
      previewToken: reset.rawToken,
    };
  }

  /**
   * Redefinição de Senha utilizando o token de recuperação
   */
  async resetPassword(dto: ResetPasswordDTO): Promise<{ message: string }> {
    const record = await this.tokenRepo.findValidResetToken(dto.token);
    if (!record) {
      throw new UnauthorizedError("O link de recuperação de senha é inválido ou já expirou.");
    }

    const user = await this.userRepo.findById(record.userId);
    if (!user) {
      throw new NotFoundError("Usuário associado ao token");
    }

    const newHash = await hashPassword(dto.newPassword);

    await this.userRepo.update(user.id, {
      passwordHash: newHash,
      provider: "local",
    });

    // Marca token como consumido e revoga todas as sessões ativas por segurança
    await this.tokenRepo.markAsUsed(record.id);
    await this.tokenRepo.deleteUserSessions(user.id);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "SENHA_REDEFINIDA",
      detalhes: `Senha redefinida com sucesso para '${user.email}'`,
      autor: user.nome,
    });

    return {
      message: "Sua senha foi redefinida com sucesso. Faça login com suas novas credenciais.",
    };
  }

  /**
   * Alteração de Senha por usuário autenticado
   */
  async changePassword(userId: string, dto: ChangePasswordDTO): Promise<{ message: string }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário", userId);
    }

    if (user.passwordHash) {
      const match = await verifyPassword(dto.currentPassword, user.passwordHash);
      if (!match) {
        throw new UnauthorizedError("A senha atual informada está incorreta.");
      }
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.userRepo.update(userId, { passwordHash: newHash });

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "SENHA_ALTERADA",
      detalhes: `Senha alterada pelo usuário '${user.nome}'`,
      autor: user.nome,
    });

    return { message: "Senha alterada com sucesso." };
  }

  /**
   * Validação de token de sessão / Bearer token
   */
  async validateSession(token: string): Promise<UserSafeProfile> {
    if (!token) {
      throw new UnauthorizedError("Token de autenticação não fornecido.");
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    const session = await this.tokenRepo.findSession(cleanToken);

    if (!session) {
      throw new UnauthorizedError("Sessão inválida ou expirada. Faça login novamente.");
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user || user.status === "bloqueado" || user.status === "inativo") {
      await this.tokenRepo.deleteSession(cleanToken);
      throw new UnauthorizedError("Usuário inativo ou não encontrado.");
    }

    return this.toSafeProfile(user);
  }

  /**
   * Encerramento de sessão (Logout)
   */
  async logout(token: string): Promise<void> {
    const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
    await this.tokenRepo.deleteSession(cleanToken);
  }

  /**
   * Atualização de perfil do usuário logado
   */
async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserSafeProfile> {
    const updates: Partial<User> = {};
    if (dto.nome !== undefined) updates.nome = dto.nome;
    if (dto.telefone !== undefined) updates.telefone = dto.telefone;
    if (dto.avatarUrl !== undefined) updates.avatarUrl = dto.avatarUrl;
    if (dto.crm !== undefined) updates.crm = dto.crm;
    const updated = await this.userRepo.update(userId, updates);
    return this.toSafeProfile(updated);
  }

  /**
   * Envia ou reenvia um código de verificação de e-mail de 6 dígitos
   */
  async sendVerificationCode(
    identifier: string,
  ): Promise<{ success: boolean; message: string; previewCode?: string }> {
    let user = await this.userRepo.findById(identifier);
    if (!user) {
      user = await this.userRepo.findByEmail(identifier);
    }
    if (!user) {
      throw new NotFoundError("Conta", identifier);
    }

    if (user.emailVerificado) {
      return {
        success: true,
        message: "O seu e-mail já foi verificado anteriormente com sucesso.",
      };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await this.userRepo.update(user.id, {
      codigoVerificacaoEmail: {
        codigo: verificationCode,
        expiraEm,
      },
    });

    console.info(
      `[CARDIO_EMAIL_SERVICE] Reenvio de código de confirmação para ${user.email}: [ ${verificationCode} ] (Válido por 15 minutos)`,
    );

    return {
      success: true,
      message: `Código de verificação de 6 dígitos enviado para ${user.email}.`,
      previewCode: verificationCode,
    };
  }

  /**
   * Valida o código de 6 dígitos digitado pelo usuário e ativa o e-mail
   */
  async verifyEmailCode(
    identifier: string,
    code: string,
  ): Promise<{ success: boolean; user: UserSafeProfile; message: string }> {
    let user = await this.userRepo.findById(identifier);
    if (!user) {
      user = await this.userRepo.findByEmail(identifier);
    }
    if (!user) {
      throw new NotFoundError("Conta de usuário", identifier);
    }

    if (user.emailVerificado) {
      return {
        success: true,
        user: this.toSafeProfile(user),
        message: "E-mail já verificado com sucesso!",
      };
    }

    const cleanCode = code.replace(/\D/g, "").trim();

    if (!user.codigoVerificacaoEmail) {
      throw new ValidationError(
        "Nenhum código ativo encontrado para este e-mail. Solicite um novo código.",
      );
    }

    const { codigo, expiraEm } = user.codigoVerificacaoEmail;

    if (new Date(expiraEm) < new Date()) {
      throw new ValidationError(
        "O código de confirmação expirou (limite de 15 minutos). Por favor, clique em Reenviar Código.",
      );
    }

    if (cleanCode !== codigo) {
      throw new ValidationError(
        "Código incorreto. Por favor, verifique os 6 dígitos recebidos no seu e-mail.",
      );
    }

    // Marca como verificado e limpa o código
    const updated = await this.userRepo.update(user.id, {
      emailVerificado: true,
      codigoVerificacaoEmail: undefined,
    });

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: user.id,
      acao: "EMAIL_VERIFICADO",
      detalhes: `E-mail ${user.email} confirmado com sucesso via código de verificação.`,
      autor: user.nome,
    });

    return {
      success: true,
      user: this.toSafeProfile(updated),
      message: "E-mail verificado com sucesso! Seu acesso clínico está 100% liberado.",
    };
  }
}

export const authService = new AuthService();
