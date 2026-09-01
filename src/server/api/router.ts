import { jsonResponse, handleApiError } from "./error-handler";
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
    // 1. Healthcheck
    if (path === "/api/health" && method === "GET") {
      return jsonResponse({
        status: "healthy",
        service: "Agenda Cardio API",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    }

    // 2. Agenda
    if (path === "/api/agenda" && method === "GET") {
      const queryParams = Object.fromEntries(url.searchParams.entries());
const validatedQuery = GetAgendaQuerySchema.parse(queryParams);
      const result = await agendaService.getAgenda(semUndefined(validatedQuery));
      return jsonResponse(result);
    }

    // 3. Appointments
    if (path === "/api/appointments" && method === "POST") {
      const body = await request.json();
      const validated = CreateAppointmentSchema.parse(body);
      const created = await agendaService.createAppointment(
        validated as unknown as CreateAppointmentDTO,
      );
      return jsonResponse(created, 201);
    }

    // Rotas parametrizadas de appointment: /api/appointments/:id/...
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
        const updated = await agendaService.updateStatus(id, validated.status, validated.motivo);
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
        );
        return jsonResponse(updated);
      }

      if (subAction === "notes" && method === "POST") {
        const body = await request.json();
        const validated = AddAppointmentNoteSchema.parse(body);
        const updated = await agendaService.addNote(id, validated.nota);
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

    // 4. Patients
    if (path === "/api/patients" && method === "GET") {
const search = url.searchParams.get("search") || undefined;
      const convenio = url.searchParams.get("convenio") || undefined;
      const patients = await patientService.list(semUndefined({ search, convenio }));
      return jsonResponse(patients);
    }

    if (path === "/api/patients" && method === "POST") {
      const body = await request.json();
      const validated = CreatePatientSchema.parse(body);
      const created = await patientService.create(validated as unknown as Omit<Patient, "id">);
      return jsonResponse(created, 201);
    }

    const patientMatch = path.match(/^\/api\/patients\/([^/]+)$/);
    if (patientMatch) {
      const id = decodeURIComponent(patientMatch[1]!);
      if (method === "GET") {
        const details = await patientService.getDetails(id);
        return jsonResponse(details);
      }
      if (method === "PATCH" || method === "PUT") {
        const body = await request.json();
        const validated = UpdatePatientSchema.parse(body);
        const updated = await patientService.update(id, validated as unknown as Partial<Patient>);
        return jsonResponse(updated);
      }
    }

    // 5. WhatsApp Integration
    if (path === "/api/whatsapp/send" && method === "POST") {
      const body = await request.json();
      if (!body.appointmentId) {
        return jsonResponse({ error: "appointmentId é obrigatório." }, 400);
      }
      const result = await whatsAppDispatchService.sendConfirmation(body.appointmentId);
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

    // 6. Analytics & Audit
    if (path === "/api/stats" && method === "GET") {
      const date = url.searchParams.get("date") || undefined;
      const stats = await analyticsService.getDailyStats(date);
      return jsonResponse(stats);
    }

    if (path === "/api/audit-logs" && method === "GET") {
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
