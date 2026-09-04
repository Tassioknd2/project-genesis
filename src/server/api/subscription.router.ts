import { jsonResponse } from "./error-handler";
import { requireAuth } from "./auth-guard";
import { subscriptionService } from "../services/subscription.service";
import {
  CheckoutSchema,
  CreateProfileSchema,
  SelectProfileSchema,
  UpdateProfileSchema,
} from "../domain/subscription.schemas";

export async function handleSubscriptionApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // 1. Consulta Pública de Planos e Preços (GET /api/plans)
  if (path === "/api/plans" && method === "GET") {
    const plans = subscriptionService.getAvailablePlans();
    return jsonResponse({ plans }, 200);
  }

  // 2. Webhook de Gateway de Pagamento (POST /api/subscriptions/webhook)
  if (path === "/api/subscriptions/webhook" && method === "POST") {
    const rawBody = await request.text().catch(() => "");
    let body: unknown = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      body = {};
    }
    const result = await subscriptionService.handleWebhook(request.headers, body, rawBody);
    return jsonResponse(result, 200);
  }

  // A partir daqui, todas as rotas de assinatura e perfis exigem usuário autenticado
  if (!path.startsWith("/api/subscriptions") && !path.startsWith("/api/profiles")) {
    return null;
  }

  const user = await requireAuth(request);

  // 3. Resumo da Assinatura do Usuário (GET /api/subscriptions/my)
  if (path === "/api/subscriptions/my" && method === "GET") {
    const summary = await subscriptionService.getSubscriptionSummary(user.id);
    return jsonResponse(summary, 200);
  }

  // 3.1 Histórico de Faturas e Cobranças (GET /api/subscriptions/invoices)
  if (path === "/api/subscriptions/invoices" && method === "GET") {
    const invoices = await subscriptionService.listInvoices(user.id);
    return jsonResponse({ invoices }, 200);
  }

  // 4. Checkout / Assinatura / Troca de Plano (POST /api/subscriptions/checkout)
  if (path === "/api/subscriptions/checkout" && method === "POST") {
    const body = await request.json();
    const validated = CheckoutSchema.parse(body);
    const result = await subscriptionService.checkout(user.id, validated);
    return jsonResponse(result, 200);
  }

  // 5. Cancelamento de Assinatura (POST /api/subscriptions/cancel)
  if (path === "/api/subscriptions/cancel" && method === "POST") {
    const result = await subscriptionService.cancelSubscription(user.id);
    return jsonResponse(
      { message: "Assinatura cancelada com sucesso.", subscription: result },
      200,
    );
  }

  // 6. Lista de Perfis da Conta (GET /api/profiles)
  if (path === "/api/profiles" && method === "GET") {
    const profiles = await subscriptionService.listProfiles(user.id);
    return jsonResponse({ profiles }, 200);
  }

  // 7. Criação de Novo Perfil (POST /api/profiles)
  if (path === "/api/profiles" && method === "POST") {
    const body = await request.json();
    const validated = CreateProfileSchema.parse(body);
    const created = await subscriptionService.createProfile(user.id, validated);
    return jsonResponse({ profile: created }, 201);
  }

  // Rotas parametrizadas de perfil: /api/profiles/:id
  const profileMatch = path.match(/^\/api\/profiles\/([^/]+)(\/(select))?$/);
  if (profileMatch) {
    const profileId = decodeURIComponent(profileMatch[1]!);
    const subAction = profileMatch[3]; // 'select' | undefined

    // 8. Seleção de Perfil estilo Netflix (POST /api/profiles/:id/select)
    if (subAction === "select" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const validated = SelectProfileSchema.parse(body);
      const selected = await subscriptionService.selectProfile(user.id, profileId, validated.pin);
      return jsonResponse(
        { profile: selected, message: `Perfil '${selected.nome}' ativado com sucesso.` },
        200,
      );
    }

    // 9. Atualização de Perfil (PATCH / PUT /api/profiles/:id)
    if (!subAction && (method === "PATCH" || method === "PUT")) {
      const body = await request.json();
      const validated = UpdateProfileSchema.parse(body);
      const updated = await subscriptionService.updateProfile(user.id, profileId, validated);
      return jsonResponse({ profile: updated }, 200);
    }

    // 10. Exclusão de Perfil (DELETE /api/profiles/:id)
    if (!subAction && method === "DELETE") {
      await subscriptionService.deleteProfile(user.id, profileId);
      return jsonResponse({ message: "Perfil removido com sucesso." }, 200);
    }
  }

  return null;
}
