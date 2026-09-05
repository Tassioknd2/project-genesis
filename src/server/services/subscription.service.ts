import { AVAILABLE_PLANS } from "../domain/plans";
import {
  CheckoutRequestDTO,
  CreateProfileDTO,
  Invoice,
  PlanDefinition,
  Profile,
  Subscription,
  SubscriptionSummaryResponse,
  UpdateProfileDTO,
} from "../domain/subscription.types";
import { ForbiddenError, NotFoundError, ValidationError } from "../domain/errors";
import {
  ISubscriptionRepository,
  subscriptionRepository,
} from "../repositories/subscription.repository";
import { IProfileRepository, profileRepository } from "../repositories/profile.repository";
import { IUserRepository, userRepository } from "../repositories/user.repository";
import { IInvoiceRepository, invoiceRepository } from "../repositories/invoice.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { IPaymentGateway, NormalizedWebhookEvent } from "../gateways/payment-gateway.interface";
import { paymentGateway } from "../gateways/gateway.factory";

export class SubscriptionService {
  constructor(
    private subRepo: ISubscriptionRepository = subscriptionRepository,
    private profRepo: IProfileRepository = profileRepository,
    private userRepo: IUserRepository = userRepository,
    private invoiceRepo: IInvoiceRepository = invoiceRepository,
    private gateway: IPaymentGateway = paymentGateway,
  ) {}

  /**
   * Retorna os planos e tabelas de preços disponíveis na plataforma
   */
  getAvailablePlans(): PlanDefinition[] {
    return Object.values(AVAILABLE_PLANS);
  }

  /**
   * Retorna o resumo da assinatura atual da conta titular
   */
  async getSubscriptionSummary(userId: string): Promise<SubscriptionSummaryResponse> {
    let sub = await this.subRepo.findByUserId(userId);

    // Se o usuário não tiver assinatura ainda (ex: novo cadastro),
    // provisionamos automaticamente 1 mês grátis (30 dias) sem necessidade de cartão de crédito
    if (!sub) {
      const now = new Date();
      const fimPeriodo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias de degustação gratuita

      sub = await this.subRepo.create({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        planId: "plano_essencial",
        status: "trial",
        billingCycle: "mensal",
        perfisUsuarioContratados: 2, // 1 Médico Titular + 1 Atendente
        perfisCrmContratados: 0,
        totalPerfisPermitidos: 2,
        precoMensal: 0, // 100% gratuito no 1º mês
        inicioPeriodo: now.toISOString(),
        fimPeriodo: fimPeriodo.toISOString(),
        cancelarAoFimDoPeriodo: false,
        criadoEm: now.toISOString(),
        atualizadoEm: now.toISOString(),
      });
    }

    const plan = AVAILABLE_PLANS[sub.planId] || null;
    const count = await this.profRepo.countByUserId(userId);

    const perfisUsados = count.total;
    const perfisDisponiveis = Math.max(0, sub.totalPerfisPermitidos - perfisUsados);
    const podeAdicionarPerfil =
      (sub.status === "ativa" || sub.status === "trial") && perfisDisponiveis > 0;
    const crmLiberado = plan?.temCrm ?? false;

    return {
      subscription: sub,
      plan,
      perfisUsados,
      perfisDisponiveis,
      podeAdicionarPerfil,
      crmLiberado,
    };
  }

  /**
   * Processamento de contratação ou alteração de plano de assinatura
   */
  async checkout(
    userId: string,
    data: CheckoutRequestDTO,
  ): Promise<{
    subscription: Subscription;
    message: string;
    transacaoId: string;
  }> {
    const plan = AVAILABLE_PLANS[data.planId];
    if (!plan) {
      throw new ValidationError("Plano selecionado inválido ou inexistente.");
    }

    const perfisUsuarioContratados = plan.perfisUsuarioInclusos; // 2 (1 Médico Titular + 1 Atendente)
    const perfisCrmContratados = plan.perfisCrmInclusos; // 0 para Essencial, 1 para Avançado
    const precoMensal = plan.precoBaseMensal;
    const totalPerfisPermitidos = perfisUsuarioContratados + perfisCrmContratados;

    const user = await this.userRepo.findById(userId);
    const userNome = user?.nome || "Titular da Conta";
    const userEmail = user?.email || "clinica@cardioagenda.com.br";

    // 1. Processamento no Gateway de Pagamento (Sandbox / Stripe / Asaas / Mercado Pago)
    const gatewayResult = await this.gateway.createSubscription({
      customer: {
        userId,
        nome: userNome,
        email: userEmail,
        cpfCnpj: data.cpfCnpj,
      },
      planId: data.planId,
      planNome: plan.nome,
      valorMensal: precoMensal,
      billingCycle: data.billingCycle || "mensal",
      metodoPagamento: data.metodoPagamento,
      cartao: data.cartao,
      paymentToken: data.paymentToken,
    });

    const now = new Date();
    const fimPeriodo = new Date(
      now.getTime() + (data.billingCycle === "anual" ? 365 : 30) * 24 * 60 * 60 * 1000,
    );

    const existingSub = await this.subRepo.findByUserId(userId);
    let updatedSub: Subscription;

    if (existingSub) {
      updatedSub = await this.subRepo.update(existingSub.id, {
        planId: data.planId,
        status: gatewayResult.status,
        billingCycle: data.billingCycle || "mensal",
        perfisUsuarioContratados,
        perfisCrmContratados,
        totalPerfisPermitidos,
        precoMensal,
        inicioPeriodo: now.toISOString(),
        fimPeriodo: fimPeriodo.toISOString(),
        metodoPagamento: data.metodoPagamento,
        cartaoUltimosDigitos: gatewayResult.cartaoUltimosDigitos,
        cancelarAoFimDoPeriodo: false,
        gatewayProvider: gatewayResult.gatewayProvider,
        gatewayCustomerId: gatewayResult.gatewayCustomerId,
        gatewaySubscriptionId: gatewayResult.gatewaySubscriptionId,
        pixCopiaECola: gatewayResult.pixCopiaECola,
        pixQrCodeUrl: gatewayResult.pixQrCodeUrl,
        ultimaTransacaoId: gatewayResult.transacaoId,
      });
    } else {
      updatedSub = await this.subRepo.create({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        planId: data.planId,
        status: gatewayResult.status,
        billingCycle: data.billingCycle || "mensal",
        perfisUsuarioContratados,
        perfisCrmContratados,
        totalPerfisPermitidos,
        precoMensal,
        inicioPeriodo: now.toISOString(),
        fimPeriodo: fimPeriodo.toISOString(),
        metodoPagamento: data.metodoPagamento,
        cartaoUltimosDigitos: gatewayResult.cartaoUltimosDigitos,
        cancelarAoFimDoPeriodo: false,
        criadoEm: now.toISOString(),
        atualizadoEm: now.toISOString(),
        gatewayProvider: gatewayResult.gatewayProvider,
        gatewayCustomerId: gatewayResult.gatewayCustomerId,
        gatewaySubscriptionId: gatewayResult.gatewaySubscriptionId,
        pixCopiaECola: gatewayResult.pixCopiaECola,
        pixQrCodeUrl: gatewayResult.pixQrCodeUrl,
        ultimaTransacaoId: gatewayResult.transacaoId,
      });
    }

    // 2. Registro da Fatura Inicial no Repositório de Faturas
    const mesFormatado = String(now.getMonth() + 1).padStart(2, "0");
    const faturaNumero = `FAT-${now.getFullYear()}-${mesFormatado}`;
    await this.invoiceRepo.create({
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subscriptionId: updatedSub.id,
      userId,
      numeroFatura: faturaNumero,
      valor: precoMensal,
      status: "paga",
      metodoPagamento: data.metodoPagamento,
      dataEmissao: now.toISOString(),
      dataVencimento: now.toISOString(),
      dataPagamento: now.toISOString(),
      cartaoUltimosDigitos: gatewayResult.cartaoUltimosDigitos,
      pixCopiaECola: gatewayResult.pixCopiaECola,
      gatewayInvoiceId: gatewayResult.transacaoId,
    });

    // 3. Auditoria do Evento
    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: updatedSub.id,
      acao: "ASSINATURA_CHECKOUT",
      detalhes: `Assinatura ativada no gateway (${gatewayResult.gatewayProvider}): ${plan.nome} (${perfisUsuarioContratados} perfis). Valor: R$ ${precoMensal.toFixed(2)}/mês. Sub ID: ${gatewayResult.gatewaySubscriptionId}`,
      autor: `Gateway (${gatewayResult.gatewayProvider})`,
    });

    // 4. Se contratou o Plano Avançado, garante que o perfil de CRM esteja criado e vinculado à mesma conta (sem necessidade de novo cadastro)
    if (data.planId === "plano_avancado") {
      const existingProfiles = await this.profRepo.findByUserId(userId);
      const hasCrm = existingProfiles.some((p) => p.tipo === "crm" || p.role === "crm_admin");
      if (!hasCrm) {
        await this.profRepo.create({
          id: `prf_crm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          nome: "Gestão CRM & Comercial",
          email: userEmail,
          role: "crm_admin",
          tipo: "crm",
          avatarColor: "#8B5CF6", // Roxo executivo
          avatarIcon: "shield",
          isPrimary: false,
          criadoEm: now.toISOString(),
          atualizadoEm: now.toISOString(),
        });
      }
    }

    return {
      subscription: updatedSub,
      message: `Assinatura do ${plan.nome} processada com sucesso! Limite de ${totalPerfisPermitidos} perfis liberado.`,
      transacaoId: gatewayResult.transacaoId,
    };
  }

  /**
   * Cancelamento de assinatura
   */
  async cancelSubscription(userId: string): Promise<Subscription> {
    const sub = await this.subRepo.findByUserId(userId);
    if (!sub) {
      throw new NotFoundError("Assinatura não encontrada para este usuário.");
    }

    // Comunica ao gateway se houver ID de assinatura externa
    if (sub.gatewaySubscriptionId) {
      await this.gateway.cancelSubscription(sub.gatewaySubscriptionId).catch(() => {});
    }

    const updated = await this.subRepo.update(sub.id, {
      cancelarAoFimDoPeriodo: true,
      status: "cancelada",
    });

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: sub.id,
      acao: "ASSINATURA_CANCELADA",
      detalhes: `Assinatura ${sub.planId} cancelada pelo usuário (Gateway ID: ${sub.gatewaySubscriptionId || "N/A"}).`,
      autor: `Usuário (${userId})`,
    });

    return updated;
  }

  /**
   * Lista todos os perfis cadastrados para a conta assinante.
   * Se a conta não possuir nenhum perfil, cria o perfil primário automaticamente.
   */
  async listProfiles(userId: string): Promise<Profile[]> {
    let profiles = await this.profRepo.findByUserId(userId);

    if (profiles.length === 0) {
      const user = await this.userRepo.findById(userId);
      const isMedico = user?.role === "medico";

      const defaultProfile: Profile = {
        id: `prf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        nome: user?.nome || "Profissional Titular",
        email: user?.email || "clinica@cardioagenda.com.br",
        role:
          user?.role === "medico" ? "medico" : "recepcionista",
        tipo: "usuario",
        crm: user?.crm || (isMedico ? "SP-123456" : undefined),
        avatarColor: isMedico ? "#2563EB" : "#10B981",
        avatarIcon: isMedico ? "stethoscope" : "user",
        isPrimary: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      await this.profRepo.create(defaultProfile);
      profiles = [defaultProfile];
    }

    return profiles;
  }

  /**
   * Cria um novo perfil na conta titular, validando rigorosamente os limites do plano
   */
  async createProfile(userId: string, data: CreateProfileDTO): Promise<Profile> {
    const summary = await this.getSubscriptionSummary(userId);
    const sub = summary.subscription;

    if (!sub || (sub.status !== "ativa" && sub.status !== "trial")) {
      throw new ForbiddenError(
        "É necessário possuir uma assinatura ativa para cadastrar novos perfis. Acesse os planos para regularizar.",
      );
    }

    const counts = await this.profRepo.countByUserId(userId);

    // Validação de tipo CRM
    const perfilTipo = data.tipo || (data.role === "crm_admin" ? "crm" : "usuario");
    if (perfilTipo === "crm") {
      if (!summary.crmLiberado) {
        throw new ForbiddenError(
          "O perfil de CRM não está disponível no Plano Essencial. Faça upgrade para o Plano Avançado.",
        );
      }
      if (counts.crm >= sub.perfisCrmContratados) {
        throw new ForbiddenError(
          `Limite de perfis de CRM atingido (${sub.perfisCrmContratados} perfil CRM permitido no seu plano).`,
        );
      }
    } else {
      // Validação de perfil clínico/usuário
      if (counts.usuarios >= sub.perfisUsuarioContratados) {
        throw new ForbiddenError(
          `Limite de perfis de equipe atingido (${sub.perfisUsuarioContratados} permitidos no ${summary.plan?.nome}).`,
        );
      }
    }

    // Validação de e-mail por perfil (o perfil de CRM pode usar o mesmo e-mail da conta do titular sem precisar criar nova conta)
    const existingWithEmail = await this.profRepo.findByEmail(data.email);
    if (existingWithEmail) {
      if (existingWithEmail.userId !== userId) {
        throw new ValidationError(
          `O e-mail '${data.email}' já está em uso por outro profissional ou clínica.`,
        );
      }
      if (existingWithEmail.tipo === perfilTipo) {
        throw new ValidationError(
          `Já existe um perfil cadastrado com o e-mail '${data.email}' nesta função.`,
        );
      }
    }

    const newProfile: Profile = {
      id: `prf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      tipo: data.tipo || (data.role === "crm_admin" ? "crm" : "usuario"),
      crm: data.crm?.trim(),
      avatarColor: data.avatarColor || "#2563EB",
      avatarIcon: data.avatarIcon || (data.role === "medico" ? "stethoscope" : "user"),
      avatarUrl: data.avatarUrl || undefined,
      pin: data.pin || undefined,
      isPrimary: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    const created = await this.profRepo.create(newProfile);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: created.id,
      acao: "PERFIL_CRIADO",
      detalhes: `Novo perfil '${created.nome}' (${created.role} - ${created.email}) adicionado à conta.`,
      autor: `Assinante (${userId})`,
    });

    return created;
  }

  /**
   * Atualiza dados de um perfil existente
   */
  async updateProfile(userId: string, profileId: string, data: UpdateProfileDTO): Promise<Profile> {
    const profile = await this.profRepo.findById(profileId);
    if (!profile || profile.userId !== userId) {
      throw new NotFoundError("Perfil não encontrado ou não pertence a esta conta.");
    }

    if (data.email && data.email.toLowerCase() !== profile.email.toLowerCase()) {
      const existing = await this.profRepo.findByEmail(data.email);
      if (existing && existing.id !== profileId) {
        throw new ValidationError(`O e-mail '${data.email}' já está em uso por outro perfil.`);
      }
    }

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Partial<Profile>;

    const updated = await this.profRepo.update(profileId, {
      ...cleanData,
      nome: data.nome ? data.nome.trim() : profile.nome,
      email: data.email ? data.email.trim().toLowerCase() : profile.email,
    });

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: profileId,
      acao: "PERFIL_ATUALIZADO",
      detalhes: `Perfil '${updated.nome}' atualizado.`,
      autor: `Assinante (${userId})`,
    });

    return updated;
  }

  /**
   * Exclui um perfil (respeitando que o perfil primário não pode ser deletado)
   */
  async deleteProfile(userId: string, profileId: string): Promise<void> {
    const profile = await this.profRepo.findById(profileId);
    if (!profile || profile.userId !== userId) {
      throw new NotFoundError("Perfil não encontrado ou não pertence a esta conta.");
    }

    if (profile.isPrimary) {
      throw new ForbiddenError("O perfil primário do titular da conta não pode ser excluído.");
    }

    const profiles = await this.profRepo.findByUserId(userId);
    if (profiles.length <= 1) {
      throw new ForbiddenError("A conta precisa manter pelo menos 1 perfil ativo.");
    }

    await this.profRepo.delete(profileId);

    await auditLogRepository.create({
      entidade: "patient",
      entidadeId: profileId,
      acao: "PERFIL_EXCLUIDO",
      detalhes: `Perfil '${profile.nome}' (${profile.email}) removido da conta.`,
      autor: `Assinante (${userId})`,
    });
  }

  /**
   * Seleção de perfil ativo estilo Netflix (com checagem opcional de PIN)
   */
  async selectProfile(userId: string, profileId: string, pin?: string): Promise<Profile> {
    const profile = await this.profRepo.findById(profileId);
    if (!profile || profile.userId !== userId) {
      throw new NotFoundError("Perfil não encontrado nesta conta.");
    }

    if (profile.pin) {
      if (!pin) {
        throw new ForbiddenError("PIN de segurança obrigatório para acessar este perfil.");
      }
      if (profile.pin !== pin) {
        throw new ForbiddenError("PIN de segurança incorreto.");
      }
    }

    return profile;
  }

  /**
   * Lista o histórico de faturas e recibos do usuário
   */
  async listInvoices(userId: string): Promise<Invoice[]> {
    return this.invoiceRepo.findByUserId(userId);
  }

  /**
   * Processa eventos de webhook disparados pelo Gateway de Pagamento
   */
  async handleWebhook(
    headers: Headers,
    payload: unknown,
    rawText?: string,
  ): Promise<{
    processed: boolean;
    event: NormalizedWebhookEvent | null;
    message: string;
  }> {
    const event = await this.gateway.parseWebhook(headers, payload, rawText);
    if (!event) {
      return {
        processed: false,
        event: null,
        message: "Assinatura ou formato de webhook inválido.",
      };
    }

    // Busca a assinatura correspondente no banco
    let sub: Subscription | null = null;
    if (event.gatewaySubscriptionId) {
      sub = await this.subRepo.findByGatewaySubscriptionId(event.gatewaySubscriptionId);
    }
    if (!sub && event.gatewayCustomerId) {
      sub = await this.subRepo.findByGatewayCustomerId(event.gatewayCustomerId);
    }

    if (sub) {
      const now = new Date();

      if (event.eventType === "PAYMENT_CONFIRMED") {
        const novoFim = new Date(
          now.getTime() + (sub.billingCycle === "anual" ? 365 : 30) * 24 * 60 * 60 * 1000,
        );
        await this.subRepo.update(sub.id, {
          status: "ativa",
          inicioPeriodo: now.toISOString(),
          fimPeriodo: novoFim.toISOString(),
        });

        // Registra a fatura correspondente
        const mesStr = String(now.getMonth() + 1).padStart(2, "0");
        await this.invoiceRepo.create({
          id: `inv_wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          subscriptionId: sub.id,
          userId: sub.userId,
          numeroFatura: `FAT-${now.getFullYear()}-${mesStr}`,
          valor: event.valor || sub.precoMensal,
          status: "paga",
          metodoPagamento: sub.metodoPagamento || "cartao",
          dataEmissao: now.toISOString(),
          dataVencimento: now.toISOString(),
          dataPagamento: now.toISOString(),
          gatewayInvoiceId: event.gatewayInvoiceId,
          cartaoUltimosDigitos: sub.cartaoUltimosDigitos,
        });
      } else if (event.eventType === "PAYMENT_FAILED" || event.eventType === "PAYMENT_OVERDUE") {
        await this.subRepo.update(sub.id, { status: "atrasada" });
      } else if (event.eventType === "SUBSCRIPTION_CANCELED") {
        await this.subRepo.update(sub.id, {
          status: "cancelada",
          cancelarAoFimDoPeriodo: true,
        });
      }

      await auditLogRepository.create({
        entidade: "patient",
        entidadeId: sub.id,
        acao: "GATEWAY_WEBHOOK_RECEBIDO",
        detalhes: `Webhook ${event.gatewayProvider}: ${event.eventType} (${event.originalEventName}). Sub ID: ${sub.id}`,
        autor: `Gateway (${event.gatewayProvider})`,
      });
    }

    return {
      processed: true,
      event,
      message: sub
        ? `Webhook processado com sucesso para a assinatura ${sub.id}.`
        : "Webhook recebido e registrado (assinatura não localizada na base).",
    };
  }
}

export const subscriptionService = new SubscriptionService();
