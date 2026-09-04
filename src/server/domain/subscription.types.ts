export type PlanId = "plano_essencial" | "plano_avancado";

export type BillingCycle = "mensal" | "anual";

export type SubscriptionStatus = "ativa" | "pendente" | "cancelada" | "atrasada" | "trial";

export type ProfileRole = "medico" | "recepcionista" | "crm_admin";
export type ProfileType = "usuario" | "crm";

export interface PlanFeature {
  id: string;
  nome: string;
  descricao: string;
  incluso: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  nome: string;
  tagline: string;
  descricao: string;
  precoBaseMensal: number;
  permiteMultiplosPerfis: boolean;
  temCrm: boolean;
  perfisUsuarioInclusos: number;
  perfisCrmInclusos: number;
  limiteMaximoPerfisUsuario: number;
  features: string[];
  recursosDescritos: PlanFeature[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  perfisUsuarioContratados: number;
  perfisCrmContratados: number;
  totalPerfisPermitidos: number;
  precoMensal: number;
  inicioPeriodo: string;
  fimPeriodo: string;
  metodoPagamento?: "cartao" | "pix" | "boleto";
  cartaoUltimosDigitos?: string;
  cancelarAoFimDoPeriodo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  // Integração com Gateway de Pagamento
  gatewayProvider?: string;
  gatewayCustomerId?: string;
  gatewaySubscriptionId?: string;
  gatewayPaymentMethodId?: string;
  pixCopiaECola?: string;
  pixQrCodeUrl?: string;
  ultimaTransacaoId?: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  numeroFatura: string;
  valor: number;
  status: "paga" | "pendente" | "recusada" | "estornada";
  metodoPagamento: "cartao" | "pix" | "boleto";
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  urlPdfRecibo?: string;
  pixCopiaECola?: string;
  gatewayInvoiceId?: string;
  cartaoUltimosDigitos?: string;
}

export interface Profile {
  id: string;
  userId: string; // Conta titular / assinante
  nome: string;
  email: string; // Cada perfil pode ter um e-mail diferente
  role: ProfileRole;
  tipo: ProfileType;
  crm?: string | undefined;
  avatarColor: string; // Cor de identificação estilo Netflix
  avatarIcon: string; // Ícone de identificação (stethoscope, heart-pulse, user, shield, etc.)
  avatarUrl?: string | undefined;
  pin?: string | undefined; // PIN de 4 dígitos opcional
  isPrimary: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CheckoutRequestDTO {
  planId: PlanId;
  billingCycle?: BillingCycle;
  perfisUsuario?: number;
  metodoPagamento: "cartao" | "pix" | "boleto";
  paymentToken?: string; // Token gerado pelo SDK do Gateway no client-side
  cpfCnpj?: string; // CPF/CNPJ do assinante exigido por gateways no Brasil
  cartao?: {
    numero: string;
    nomeTitular: string;
    validade: string;
    cvv: string;
  };
}

export interface CreateProfileDTO {
  nome: string;
  email: string;
  role: ProfileRole;
  tipo?: ProfileType;
  crm?: string;
  avatarColor?: string;
  avatarIcon?: string;
  avatarUrl?: string;
  pin?: string;
}

export interface UpdateProfileDTO {
  nome?: string;
  email?: string;
  role?: ProfileRole;
  crm?: string;
  avatarColor?: string;
  avatarIcon?: string;
  avatarUrl?: string;
  pin?: string;
}

export interface SubscriptionSummaryResponse {
  subscription: Subscription | null;
  plan: PlanDefinition | null;
  perfisUsados: number;
  perfisDisponiveis: number;
  podeAdicionarPerfil: boolean;
  crmLiberado: boolean;
}
