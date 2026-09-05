import { IPaymentGateway } from "./payment-gateway.interface";
import { SandboxPaymentGateway } from "./sandbox.gateway";

/**
 * Factory para obter a instância do Gateway de Pagamento configurado.
 *
 * Para plugar um Gateway real (Asaas, Stripe, Mercado Pago ou Pagar.me):
 * 1. Crie uma classe (ex: `AsaasPaymentGateway` ou `StripePaymentGateway`) implementando `IPaymentGateway`.
 * 2. Preencha as credenciais em `.env`.
 * 3. Adicione a condição abaixo retornando a nova classe quando `process.env.PAYMENT_GATEWAY_PROVIDER === "asaas"`.
 */
export function getPaymentGateway(): IPaymentGateway {
  const provider = (process.env['PAYMENT_GATEWAY_PROVIDER'] || "sandbox").toLowerCase();

  switch (provider) {
    case "sandbox":
    default:
      return new SandboxPaymentGateway();
  }
}

export const paymentGateway = getPaymentGateway();
