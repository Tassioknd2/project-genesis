import { UnauthorizedError, ForbiddenError } from "../domain/errors";
import { UserRole, UserSafeProfile } from "../domain/auth.types";
import { authService } from "../services/auth.service";
import { auditLogRepository } from "../repositories/audit-log.repository";

/**
 * Extrai o token Bearer do cabeçalho 'Authorization' da requisição HTTP.
 */
export function extractBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader) {
    throw new UnauthorizedError(
      "Acesso não autorizado. É necessário fornecer um token de autenticação válido no cabeçalho 'Authorization: Bearer <token>'.",
    );
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    throw new UnauthorizedError(
      "Formato de token inválido. O cabeçalho de autorização deve estar no formato 'Bearer <token>'.",
    );
  }

  const token = match[1].trim();
  if (!token) {
    throw new UnauthorizedError("Token de autenticação vazio.");
  }

  return token;
}

/**
 * Verifica se a requisição possui uma sessão ativa válida.
 * Retorna o perfil seguro do usuário autenticado ou lança UnauthorizedError.
 */
export async function requireAuth(request: Request): Promise<UserSafeProfile> {
  const token = extractBearerToken(request);
  const user = await authService.validateSession(token);

  if (user.status !== "ativo") {
    throw new UnauthorizedError(
      "Conta de usuário inativa ou bloqueada. Entre em contato com a administração da clínica.",
    );
  }

  return user;
}

/**
 * Valida se o usuário autenticado possui o papel (role) necessário para a operação.
 */
export function requireRole(user: UserSafeProfile, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Acesso restrito. Esta operação requer um dos seguintes perfis clínicos: ${allowedRoles.join(", ")}. Seu perfil atual é: ${user.role}.`,
    );
  }
}

/**
 * Lista explícita de rotas públicas da API que não exigem autenticação prévia.
 * Todas as demais rotas são estritamente protegidas por padrão (Fail-Safe / Zero Trust).
 */
export function isPublicApiRoute(pathname: string, method: string): boolean {
  const upperMethod = method.toUpperCase();

  // 1. Healthcheck operacional
  if (pathname === "/api/health" && upperMethod === "GET") {
    return true;
  }

  // 2. Fluxos públicos de autenticação e recuperação de acesso
  const publicAuthEndpoints = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ];

  if (publicAuthEndpoints.includes(pathname) && upperMethod === "POST") {
    return true;
  }

  // 3. Catálogo público de planos e webhook de gateway de pagamento
  if (pathname === "/api/plans" && upperMethod === "GET") {
    return true;
  }
  if (pathname === "/api/subscriptions/webhook" && upperMethod === "POST") {
    return true;
  }

  return false;
}

/**
 * Valida se a conta assinante possui uma assinatura ativa ou em período de testes válido.
 * Bloqueia o acesso a funções do sistema caso a assinatura esteja cancelada, vencida ou inativa.
 */
export async function requireActiveSubscription(userId: string): Promise<void> {
  const { subscriptionRepository } = await import("../repositories/subscription.repository");
  const sub = await subscriptionRepository.findByUserId(userId);

  if (!sub) {
    throw new ForbiddenError(
      "Nenhuma assinatura ativa encontrada para esta conta. Selecione um dos nossos planos para acessar o sistema.",
    );
  }

  if (sub.status === "cancelada" || sub.status === "atrasada") {
    throw new ForbiddenError(
      `Sua assinatura encontra-se com status '${sub.status}'. Regularize sua fatura ou selecione um novo plano para continuar utilizando os recursos da clínica.`,
    );
  }
}

/**
 * Valida se o plano atual da assinatura inclui uma determinada funcionalidade (ex: 'crm').
 */
export async function requireFeature(userId: string, feature: string): Promise<void> {
  const { subscriptionRepository } = await import("../repositories/subscription.repository");
  const { AVAILABLE_PLANS } = await import("../domain/plans");

  const sub = await subscriptionRepository.findByUserId(userId);
  if (!sub) {
    throw new ForbiddenError("Assinatura não encontrada.");
  }

  const plan = AVAILABLE_PLANS[sub.planId];
  if (!plan || !plan.features.includes(feature)) {
    throw new ForbiddenError(
      `A funcionalidade '${feature}' não está inclusa no seu plano atual (${plan?.nome || "Desconhecido"}). Faça upgrade para o Plano Avançado.`,
    );
  }
}

/**
 * Helper para registrar acessos e ações a dados sensíveis de pacientes e prontuários
 */
export async function logSensitiveDataAccess(
  user: UserSafeProfile,
  acao: string,
  detalhes: string,
  entidade: "patient" | "appointment" = "patient",
  entidadeId?: string,
): Promise<void> {
await auditLogRepository.create({
    entidade,
    entidadeId: entidadeId ?? "",
    acao,
    detalhes,
    autor: `${user.nome} (${user.role}${user.crm ? ` - CRM ${user.crm}` : ""})`,
  });
}
