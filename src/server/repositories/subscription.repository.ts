import { Subscription, SubscriptionStatus } from "../domain/subscription.types";

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>;
  findById(id: string): Promise<Subscription | null>;
  findByGatewaySubscriptionId(gatewaySubscriptionId: string): Promise<Subscription | null>;
  findByGatewayCustomerId(gatewayCustomerId: string): Promise<Subscription | null>;
  create(subscription: Subscription): Promise<Subscription>;
  update(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  delete(id: string): Promise<void>;
}

const initialSubscriptions: Subscription[] = [
  {
    id: "sub_admin_1",
    userId: "usr_admin_1",
    planId: "plano_avancado",
    status: "ativa",
    billingCycle: "mensal",
    perfisUsuarioContratados: 2,
    perfisCrmContratados: 1,
    totalPerfisPermitidos: 3, // 2 de equipe (médico + atendente) + 1 CRM
    precoMensal: 49.9,
    inicioPeriodo: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    fimPeriodo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    metodoPagamento: "cartao",
    cartaoUltimosDigitos: "4242",
    cancelarAoFimDoPeriodo: false,
    criadoEm: "2026-01-01T08:00:00.000Z",
    atualizadoEm: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "sub_recep_1",
    userId: "usr_recep_1",
    planId: "plano_essencial",
    status: "ativa",
    billingCycle: "mensal",
    perfisUsuarioContratados: 2,
    perfisCrmContratados: 0,
    totalPerfisPermitidos: 2,
    precoMensal: 39.9,
    inicioPeriodo: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    fimPeriodo: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    metodoPagamento: "pix",
    cancelarAoFimDoPeriodo: false,
    criadoEm: "2026-01-01T08:30:00.000Z",
    atualizadoEm: "2026-01-01T08:30:00.000Z",
  },
];

export class SubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  constructor() {
    for (const sub of initialSubscriptions) {
      this.subscriptions.set(sub.id, { ...sub });
    }
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId) {
        return { ...sub };
      }
    }
    return null;
  }

  async findById(id: string): Promise<Subscription | null> {
    const sub = this.subscriptions.get(id);
    return sub ? { ...sub } : null;
  }

  async findByGatewaySubscriptionId(gatewaySubscriptionId: string): Promise<Subscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.gatewaySubscriptionId === gatewaySubscriptionId) {
        return { ...sub };
      }
    }
    return null;
  }

  async findByGatewayCustomerId(gatewayCustomerId: string): Promise<Subscription | null> {
    for (const sub of this.subscriptions.values()) {
      if (sub.gatewayCustomerId === gatewayCustomerId) {
        return { ...sub };
      }
    }
    return null;
  }

  async create(subscription: Subscription): Promise<Subscription> {
    this.subscriptions.set(subscription.id, { ...subscription });
    return { ...subscription };
  }

  async update(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const existing = this.subscriptions.get(id);
    if (!existing) {
      throw new Error(`Assinatura com ID ${id} não encontrada.`);
    }

    const updated: Subscription = {
      ...existing,
      ...updates,
      atualizadoEm: new Date().toISOString(),
    };
    this.subscriptions.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<void> {
    this.subscriptions.delete(id);
  }

  // Helper para testes e ambiente de desenvolvimento
  async setStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    return this.update(id, { status });
  }
}

export const subscriptionRepository = new SubscriptionRepository();
