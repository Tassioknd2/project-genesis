import { jsonResponse, handleApiError } from "./error-handler";
import { handleAuthApiRequest } from "./auth.router";
import { handleSubscriptionApiRequest } from "./subscription.router";
import {
  requireAuth,
  isPublicApiRoute,
  logSensitiveDataAccess,
  requireRole,
  requireActiveSubscription,
  requireFeature,
} from "./auth-guard";
import {
  CreateAppointmentSchema,
  UpdateAppointmentStatusSchema,
  RescheduleAppointmentSchema,
  AddAppointmentNoteSchema,
  UpdateAppointmentLabelsSchema,
  CreatePatientSchema,
  UpdatePatientSchema,
  SimulateWhatsAppReplySchema,
  GetAgendaQuerySchema,
} from "../domain/schemas";
import { agendaService, CreateAppointmentDTO } from "../services/agenda.service";
import { patientService } from "../services/patient.service";
import { whatsAppDispatchService } from "../services/whatsapp-dispatch.service";
import { analyticsService } from "../services/analytics.service";
import { auditLogRepository } from "../repositories/audit-log.repository";
import { Etiqueta, Patient } from "../domain/types";

/**
 * Remove propriedades cujo valor seja `undefined` — compatível com
 * `exactOptionalPropertyTypes`, que rejeita `undefined` explícito em
 * propriedades opcionais.
 */
function semUndefined<T extends object>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as { [K in keyof T]: Exclude<T[K], undefined> };
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Verifica se é uma rota de API
  if (!path.startsWith("/api/")) {
    return null;
  }

  try {
    // 1. Healthcheck público (sem dados sensíveis)
    if (path === "/api/health" && method === "GET") {
      return jsonResponse({
        status: "healthy",
        service: "Agenda Cardio API",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    }

    // 2. Rotas públicas de autenticação (/api/auth/login, /api/auth/register, etc.)
    if (isPublicApiRoute(path, method)) {
      const authResponse = await handleAuthApiRequest(request);
      if (authResponse) {
        return authResponse;
      }
      const subResponse = await handleSubscriptionApiRequest(request);
      if (subResponse) {
        return subResponse;
      }
    }

    // =========================================================================
    // BARREIRA DE SEGURANÇA OBRIGATÓRIA (ZERO TRUST / DEFENSE IN DEPTH)
    // A partir deste ponto, TODAS as rotas exigem token Bearer válido de sessão.
    // Requisições sem token ou com token inválido/expirado são rejeitadas com 401.
    // =========================================================================
    const user = await requireAuth(request);
    const userActorLabel = `${user.nome} (${user.role}${user.crm ? ` - CRM ${user.crm}` : ""})`;

    // 3. Rotas privadas de autenticação e perfil (/api/auth/me, /api/auth/profile, /api/auth/change-password, /api/auth/logout)
    if (path.startsWith("/api/auth/")) {
      const authResponse = await handleAuthApiRequest(request);
      if (authResponse) {
        return authResponse;
      }
    }

    // 4. Rotas de Assinaturas, Planos e Perfis estilo Netflix (/api/subscriptions/*, /api/profiles/*)
    if (path.startsWith("/api/subscriptions") || path.startsWith("/api/profiles")) {
      const subResponse = await handleSubscriptionApiRequest(request);
      if (subResponse) {
        return subResponse;
      }
    }

    // 5. Rotas do Módulo CRM (Acesso condicionado ao Plano Avançado)
    if (path.startsWith("/api/crm")) {
      await requireActiveSubscription(user.id);
      await requireFeature(user.id, "crm");
      return jsonResponse({
        status: "ok",
        modulo: "CRM Administrativo",
        mensagem: "Módulo CRM liberado para o seu plano.",
      });
    }

    // =========================================================================
    // BARREIRA DE ASSINATURA ATIVA (MOTOR DE ACESSO DO BACK-END)
    // Exige que a conta possua uma assinatura com status 'ativa' ou 'trial'
    // antes de liberar manipulação de agenda, prontuários ou disparo de WhatsApp.
    // =========================================================================
    await requireActiveSubscription(user.id);

    // 6. Agenda e Agendamentos Clínicos (Dados Sensíveis de Pacientes)
    if (path === "/api/agenda" && method === "GET") {
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validatedQuery = GetAgendaQuerySchema.parse(queryParams);
      const result = await agendaService.getAgenda(semUndefined(validatedQuery));
      return jsonResponse(result);
    }

    if (path === "/api/appointments" && method === "POST") {
      const body = await request.json();
      const validated = CreateAppointmentSchema.parse(body);
      const created = await agendaService.createAppointment(
        validated as unknown as CreateAppointmentDTO,
        userActorLabel,
      );
      return jsonResponse(created, 201);
    }

    // Rotas parametrizadas de agendamentos: /api/appointments/:id/...
    const appMatch = path.match(
      /^\/api\/appointments\/([^/]+)(\/(status|reschedule|notes|labels))?$/,
    );
    if (appMatch) {
      const id = decodeURIComponent(appMatch[1]!);
      const subAction = appMatch[3];

      if (!subAction && method === "GET") {
        const query = await agendaService.getAgenda({});
        const item = query.appointments.find((a) => a.id === id);
        if (!item) {
          return jsonResponse({ error: "Agendamento não encontrado" }, 404);
        }
        return jsonResponse(item);
      }

      if (subAction === "status" && (method === "PATCH" || method === "PUT")) {
        const body = await request.json();
        const validated = UpdateAppointmentStatusSchema.parse(body);
        const updated = await agendaService.updateStatus(
          id,
          validated.status,
          validated.motivo,
          userActorLabel,
        );
        return jsonResponse(updated);
      }

      if (subAction === "reschedule" && (method === "PATCH" || method === "POST")) {
        const body = await request.json();
        const validated = RescheduleAppointmentSchema.parse(body);
        const updated = await agendaService.reschedule(
          id,
          validated.novaData,
          validated.novaHora,
          validated.motivo,
          userActorLabel,
        );
        return jsonResponse(updated);
      }

      if (subAction === "notes" && method === "POST") {
        const body = await request.json();
        const validated = AddAppointmentNoteSchema.parse(body);
        const updated = await agendaService.addNote(id, validated.nota, userActorLabel);
        return jsonResponse(updated);
      }

      if (subAction === "labels" && (method === "PUT" || method === "PATCH")) {
        const body = await request.json();
        const validated = UpdateAppointmentLabelsSchema.parse(body);
        const updated = await agendaService.updateLabels(
          id,
          validated.etiquetas as unknown as Etiqueta[],
        );
        return jsonResponse(updated);
      }
    }

    // 5. Gestão de Pacientes e Prontuários (Proteção Estrita LGPD)
    if (path === "/api/patients" && method === "GET") {
      const search = url.searchParams.get("search") || undefined;
      const convenio = url.searchParams.get("convenio") || undefined;
      const patients = await patientService.list(semUndefined({ search, convenio }));
      return jsonResponse(patients);
    }

    if (path === "/api/patients" && method === "POST") {
      const body = await request.json();
      const validated = CreatePatientSchema.parse(body);
      const created = await patientService.create(
        validated as unknown as Omit<Patient, "id">,
        userActorLabel,
      );
      return jsonResponse(created, 201);
    }

    const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
    if (patientMatch) {
      const id = decodeURIComponent(patientMatch[1]!);
      if (method === "GET") {
        const details = await patientService.getDetails(id);
        // Auditoria de acesso ao prontuário médico sensível
        await logSensitiveDataAccess(
          user,
          "LEITURA_PRONTUARIO",
          `Prontuário e histórico clínico do paciente '${details.nome}' acessados por ${userActorLabel}.`,
          "patient",
          id,
        );
        return jsonResponse(details);
      }
      if (method === "PATCH" || method === "PUT") {
        const body = await request.json();
        const validated = UpdatePatientSchema.parse(body);
        const updated = await patientService.update(
          id,
          validated as unknown as Partial<Patient>,
          userActorLabel,
        );
        return jsonResponse(updated);
      }
    }

    // 6. Disparo e Simulação de WhatsApp (Ações Externas Críticas)
    if (path === "/api/whatsapp/send" && method === "POST") {
      const body = await request.json();
      if (!body.appointmentId) {
        return jsonResponse({ error: "appointmentId é obrigatório." }, 400);
      }
      const result = await whatsAppDispatchService.sendConfirmation(body.appointmentId);
      await logSensitiveDataAccess(
        user,
        "DISPARO_WHATSAPP",
        `Disparo de confirmação WhatsApp realizado por ${userActorLabel} para o agendamento ${body.appointmentId}.`,
        "appointment",
        body.appointmentId,
      );
      return jsonResponse(result);
    }

    if (path === "/api/whatsapp/simulate-reply" && method === "POST") {
      const body = await request.json();
      const validated = SimulateWhatsAppReplySchema.parse(body);
      const result = await whatsAppDispatchService.simulateIncomingResponse(
        validated.appointmentId,
        validated.resposta,
        validated.mensagemAdicional,
      );
      return jsonResponse(result);
    }

    // 7. Estatísticas e Métricas Clínicas
    if (path === "/api/stats" && method === "GET") {
      const date = url.searchParams.get("date") || undefined;
      const stats = await analyticsService.getDailyStats(date);
      return jsonResponse(stats);
    }

    // 8. Trilha de Auditoria Clínica e Segurança (RBAC: Médicos, Recepcionistas e Administradores)
    if (path === "/api/audit-logs" && method === "GET") {
      requireRole(user, ["admin", "medico", "recepcionista"]);
      const limit = Number(url.searchParams.get("limit")) || 50;
      const logs = await auditLogRepository.findRecent(limit);
      return jsonResponse(logs);
    }

    // Rota de API não encontrada
    return jsonResponse(
      {
        error: {
          code: "NOT_FOUND",
          message: `Endpoint de API não encontrado: ${method} ${path}`,
        },
      },
      404,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
