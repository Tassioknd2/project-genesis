/**
 * Contratos e Interfaces para Integração de Gateway de Pagamento
 * Padrão: Ports and Adapters (Arquitetura Hexagonal)
 *
 * Permite plugar qualquer provedor (Asaas, Stripe, Mercado Pago, Pagar.me, etc.)
 * sem alterar as regras de negócio de assinaturas da aplicação.
 */

export type GatewayPaymentMethod = "cartao" | "pix" | "boleto";

export interface GatewayCustomer {
  id?: string;
  userId: string;
  nome: string;
  email: string;
  cpfCnpj?: string;
  telefone?: string;
}

export interface GatewayCardData {
  numero: string;
  nomeTitular: string;
  validade: string; // MM/AA
  cvv: string;
}

export interface GatewayCreateSubscriptionParams {
  customer: GatewayCustomer;
  planId: string;
  planNome: string;
  valorMensal: number;
  billingCycle: "mensal" | "anual";
  metodoPagamento: GatewayPaymentMethod;
  cartao?: GatewayCardData;
  paymentToken?: string; // Token gerado pelo SDK client-side (Stripe Elements / MercadoPago.js / Asaas)
  metadata?: Record<string, string>;
}

export interface GatewaySubscriptionResult {
  gatewayProvider: string;
  gatewaySubscriptionId: string;
  gatewayCustomerId: string;
  status: "ativa" | "pendente" | "cancelada";
  transacaoId: string;
  valorCobrado: number;
  proximaCobranca?: string;
  // Campos específicos para PIX Instantâneo
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  // Campos específicos para Boleto Bancário
  boletoCodigoBarras?: string;
  boletoUrlPdf?: string;
  // Metadados do cartão de crédito
  cartaoBandeira?: string;
  cartaoUltimosDigitos?: string;
}

export type WebhookEventType =
  | "PAYMENT_CONFIRMED" // Pagamento de fatura/mensalidade aprovado
  | "PAYMENT_FAILED" // Tentativa de cobrança recusada
  | "PAYMENT_OVERDUE" // Mensalidade em atraso
  | "SUBSCRIPTION_CANCELED" // Assinatura cancelada no gateway
  | "SUBSCRIPTION_UPDATED" // Mudança de valor ou ciclo
  | "UNKNOWN";

export interface NormalizedWebhookEvent {
  gatewayProvider: string;
  eventType: WebhookEventType;
  originalEventName: string;
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  gatewayInvoiceId?: string;
  valor?: number;
  dataEvento: string;
  faturaUrlPdf?: string;
  detalhes?: string;
  rawPayload: unknown;
}

/**
 * Interface obrigatória para qualquer adaptador de gateway de pagamento
 */
export interface IPaymentGateway {
  readonly providerName: string;

  /**
   * Cria ou localiza um cliente na base do gateway
   */
  createOrGetCustomer(customer: GatewayCustomer): Promise<string>;

  /**
   * Cria uma nova assinatura recorrente no gateway
   */
  createSubscription(params: GatewayCreateSubscriptionParams): Promise<GatewaySubscriptionResult>;

  /**
   * Cancela uma assinatura recorrente ativa no gateway
   */
  cancelSubscription(
    gatewaySubscriptionId: string,
  ): Promise<{ success: boolean; message: string; canceladoEm: string }>;

  /**
   * Normaliza webhooks recebidos do gateway em um formato unificado para a aplicação
   */
  parseWebhook(
    headers: Headers,
    body: unknown,
    rawBody?: string,
  ): Promise<NormalizedWebhookEvent | null>;
}
