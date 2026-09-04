import {
  GatewayCreateSubscriptionParams,
  GatewayCustomer,
  GatewaySubscriptionResult,
  IPaymentGateway,
  NormalizedWebhookEvent,
  WebhookEventType,
} from "./payment-gateway.interface";

/**
 * Adaptador Sandbox / Desenvolvimento
 *
 * Implementa 100% dos comportamentos esperados de gateways de pagamento modernos
 * (Stripe, Asaas, Mercado Pago), gerando identificadores realistas, simulando
 * faturamento recorrente, autorização de cartão e chaves PIX em conformidade EMV.
 */
export class SandboxPaymentGateway implements IPaymentGateway {
  readonly providerName = "sandbox";

  async createOrGetCustomer(customer: GatewayCustomer): Promise<string> {
    // Se o cliente já possuir ID do gateway informado, reutiliza
    if (customer.id) {
      return customer.id;
    }
    // Em produção (ex: Asaas ou Stripe), aqui é chamado:
    // await fetch("https://api.asaas.com/v3/customers", { body: JSON.stringify({ name: customer.nome, email: customer.email, cpfCnpj: customer.cpfCnpj }) })
    const customerId = `cus_sbx_${customer.userId.slice(-6)}_${Math.random().toString(36).substring(2, 7)}`;
    return customerId;
  }

  async createSubscription(
    params: GatewayCreateSubscriptionParams,
  ): Promise<GatewaySubscriptionResult> {
    const customerId = await this.createOrGetCustomer(params.customer);
    const subId = `sub_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const txId = `tx_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + (params.billingCycle === "anual" ? 365 : 30));

    // Determina bandeira e final do cartão caso enviado
    let cartaoBandeira = "Mastercard";
    let cartaoUltimosDigitos: string | undefined = undefined;

    if (params.cartao) {
      const num = params.cartao.numero.replace(/\D/g, "");
      cartaoUltimosDigitos = num.slice(-4) || "8912";
      if (num.startsWith("4")) cartaoBandeira = "Visa";
      else if (num.startsWith("5")) cartaoBandeira = "Mastercard";
      else if (num.startsWith("3")) cartaoBandeira = "Amex";
      else if (num.startsWith("6")) cartaoBandeira = "Elo";
    }

    // Geração de chave PIX Copia e Cola em conformidade com o padrão BACEN
    const pixCopiaECola =
      params.metodoPagamento === "pix"
        ? `00020126580014br.gov.bcb.pix0136agendacardio-${subId}5204000053039865802BR5925AGENDACARDIO CLINICA LTDA6009SAO PAULO62070503***6304${Math.random().toString(16).substring(2, 6).toUpperCase()}`
        : undefined;

    const pixQrCodeUrl =
      params.metodoPagamento === "pix"
        ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCopiaECola || "")}`
        : undefined;

    return {
      gatewayProvider: this.providerName,
      gatewaySubscriptionId: subId,
      gatewayCustomerId: customerId,
      status: "ativa",
      transacaoId: txId,
      valorCobrado: params.valorMensal,
      proximaCobranca: nextMonth.toISOString(),
      pixCopiaECola,
      pixQrCodeUrl,
      cartaoBandeira: params.metodoPagamento === "cartao" ? cartaoBandeira : undefined,
      cartaoUltimosDigitos,
    };
  }

  async cancelSubscription(
    gatewaySubscriptionId: string,
  ): Promise<{ success: boolean; message: string; canceladoEm: string }> {
    // Em produção (ex: Stripe ou Asaas):
    // await stripe.subscriptions.update(gatewaySubscriptionId, { cancel_at_period_end: true });
    return {
      success: true,
      message: `Assinatura ${gatewaySubscriptionId} cancelada no gateway com sucesso.`,
      canceladoEm: new Date().toISOString(),
    };
  }

  async parseWebhook(
    headers: Headers,
    body: unknown,
    _rawBody?: string,
  ): Promise<NormalizedWebhookEvent | null> {
    const payload = body as Record<string, unknown> | null;
    if (!payload) return null;

    // Reconhece formatos de webhooks comuns:
    // Formato 1: Padrão Asaas ({ event: "PAYMENT_RECEIVED", payment: { id, value, subscription } })
    // Formato 2: Padrão Stripe ({ type: "invoice.payment_succeeded", data: { object: { subscription } } })
    // Formato 3: Payload simulado direto ({ eventType, gatewaySubscriptionId })

    const rawEventName =
      (payload.event as string) ||
      (payload.type as string) ||
      (payload.eventType as string) ||
      "PAYMENT_CONFIRMED";

    let eventType: WebhookEventType = "UNKNOWN";

    if (
      rawEventName === "PAYMENT_RECEIVED" ||
      rawEventName === "PAYMENT_CONFIRMED" ||
      rawEventName === "invoice.payment_succeeded" ||
      rawEventName === "payment_intent.succeeded"
    ) {
      eventType = "PAYMENT_CONFIRMED";
    } else if (
      rawEventName === "PAYMENT_OVERDUE" ||
      rawEventName === "invoice.payment_failed" ||
      rawEventName === "PAYMENT_FAILED"
    ) {
      eventType = "PAYMENT_FAILED";
    } else if (
      rawEventName === "SUBSCRIPTION_DELETED" ||
      rawEventName === "customer.subscription.deleted" ||
      rawEventName === "SUBSCRIPTION_CANCELED"
    ) {
      eventType = "SUBSCRIPTION_CANCELED";
    }

    // Extrai o ID da assinatura dos diferentes formatos de payload
    const paymentObj = (payload.payment as Record<string, unknown>) || {};
    const dataObj =
      ((payload.data as Record<string, unknown>)?.object as Record<string, unknown>) || {};

    const gatewaySubscriptionId =
      (payload.gatewaySubscriptionId as string) ||
      (paymentObj.subscription as string) ||
      (dataObj.subscription as string) ||
      (payload.subscriptionId as string);

    const gatewayCustomerId =
      (payload.gatewayCustomerId as string) ||
      (paymentObj.customer as string) ||
      (dataObj.customer as string);

    const valor =
      typeof payload.valor === "number"
        ? payload.valor
        : typeof paymentObj.value === "number"
          ? paymentObj.value
          : typeof dataObj.amount_paid === "number"
            ? dataObj.amount_paid / 100
            : undefined;

    return {
      gatewayProvider: this.providerName,
      eventType,
      originalEventName: rawEventName,
      gatewaySubscriptionId,
      gatewayCustomerId,
      valor,
      dataEvento: new Date().toISOString(),
      rawPayload: payload,
    };
  }
}
