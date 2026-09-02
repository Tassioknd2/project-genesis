import { jsonResponse } from "./error-handler";
import {
  RegisterUserSchema,
  LoginSchema,
  GoogleAuthSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
} from "../domain/auth.schemas";
import { authService } from "../services/auth.service";
import { extractBearerToken, requireAuth } from "./auth-guard";

/**
 * Extrai metadados do cliente para fins de auditoria e segurança
 */
function extractClientMeta(request: Request) {
  return {
    userAgent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      undefined,
  };
}

export async function handleAuthApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (!path.startsWith("/api/auth")) {
    return null;
  }

  const meta = extractClientMeta(request);

  // 1. Registro de Conta (POST /api/auth/register)
  if (path === "/api/auth/register" && method === "POST") {
    const body = await request.json();
    const validated = RegisterUserSchema.parse(body);
    const result = await authService.register(validated, meta);
    return jsonResponse(result, 201);
  }

  // 2. Login Tradicional (POST /api/auth/login)
  if (path === "/api/auth/login" && method === "POST") {
    const body = await request.json();
    const validated = LoginSchema.parse(body);
    const result = await authService.login(validated, meta);
    return jsonResponse(result, 200);
  }

  // 3. Login / Cadastro com Google (POST /api/auth/google)
  if (path === "/api/auth/google" && method === "POST") {
    const body = await request.json();
    const validated = GoogleAuthSchema.parse(body);
    const result = await authService.loginWithGoogle(validated, meta);
    return jsonResponse(result, 200);
  }

  // 4. Solicitação de Recuperação de Senha (POST /api/auth/forgot-password)
  if (path === "/api/auth/forgot-password" && method === "POST") {
    const body = await request.json();
    const validated = ForgotPasswordSchema.parse(body);
    const result = await authService.requestPasswordReset(validated);
    return jsonResponse(result, 200);
  }

  // 5. Redefinição de Senha (POST /api/auth/reset-password)
  if (path === "/api/auth/reset-password" && method === "POST") {
    const body = await request.json();
    const validated = ResetPasswordSchema.parse(body);
    const result = await authService.resetPassword(validated);
    return jsonResponse(result, 200);
  }

  // 6. Dados do Usuário Autenticado (GET /api/auth/me)
  if (path === "/api/auth/me" && method === "GET") {
    const user = await requireAuth(request);
    return jsonResponse({ user }, 200);
  }

  // 7. Atualização de Perfil (PATCH /api/auth/profile)
  if (path === "/api/auth/profile" && (method === "PATCH" || method === "PUT")) {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = UpdateProfileSchema.parse(body);
    const updatedUser = await authService.updateProfile(user.id, validated);
    return jsonResponse({ user: updatedUser }, 200);
  }

  // 8. Alteração de Senha Autenticada (POST /api/auth/change-password)
  if (path === "/api/auth/change-password" && method === "POST") {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = ChangePasswordSchema.parse(body);
    const result = await authService.changePassword(user.id, validated);
    return jsonResponse(result, 200);
  }

  // 9. Encerramento de Sessão (POST /api/auth/logout)
  if (path === "/api/auth/logout" && method === "POST") {
    try {
      const token = extractBearerToken(request);
      await authService.logout(token);
    } catch {
      // Logout é idempotente
    }
    return jsonResponse({ message: "Sessão encerrada com sucesso." }, 200);
  }

  return null;
}
