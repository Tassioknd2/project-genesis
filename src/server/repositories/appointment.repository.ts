import {
  Appointment,
  AppointmentStatus,
  Etiqueta,
  Patient,
  PendenciaType,
  TipoAtendimento,
} from "../domain/types";
import { isOverlapping } from "../domain/state-machine";
import { NotFoundError } from "../domain/errors";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Tables } from "@/integrations/supabase/types";

type AppointmentRow = Tables<"appointments">;
type PatientRow = Tables<"patients">;

function rowToPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    nome: row.nome,
    idade: row.idade,
    telefone: row.telefone,
    convenio: row.convenio,
    ...(row.cpf != null ? { cpf: row.cpf } : {}),
    ...(row.email != null ? { email: row.email } : {}),
    ...(row.ultima_visita != null ? { ultimaVisita: row.ultima_visita } : {}),
    ...(row.observacoes != null ? { observacoes: row.observacoes } : {}),
    ...(row.criado_em != null ? { criadoEm: row.criado_em } : {}),
  };
}

type AppointmentJoinRow = AppointmentRow & { paciente: PatientRow | null };

function rowToAppointment(row: AppointmentJoinRow): Appointment {
  const paciente: Patient = row.paciente
    ? rowToPatient(row.paciente)
    : {
        id: row.paciente_id,
        nome: "Paciente removido",
        idade: 0,
        telefone: "",
        convenio: "",
      };

  return {
    id: row.id,
    data: row.data,
    hora: row.hora,
    duracaoMin: row.duracao_min,
    paciente,
    tipo: row.tipo as TipoAtendimento,
    ...(row.tipos != null ? { tipos: row.tipos as TipoAtendimento[] } : {}),
    medico: row.medico,
    status: row.status as AppointmentStatus,
    ...(row.pendencia != null ? { pendencia: row.pendencia as PendenciaType } : {}),
    ...(row.observacoes != null ? { observacoes: row.observacoes } : {}),
    ...(row.notas != null ? { notas: row.notas } : {}),
    ...(row.etiquetas != null ? { etiquetas: row.etiquetas as unknown as Etiqueta[] } : {}),
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

const SELECT_WITH_PATIENT = "*, paciente:patients(*)";

export class AppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(SELECT_WITH_PATIENT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToAppointment(data as AppointmentJoinRow) : null;
  }

  async findByDate(date: string): Promise<Appointment[]> {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(SELECT_WITH_PATIENT)
      .eq("data", date)
      .order("hora", { ascending: true });
    if (error) throw error;
    return ((data || []) as AppointmentJoinRow[]).map(rowToAppointment);
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select(SELECT_WITH_PATIENT)
      .eq("paciente_id", patientId)
      .order("data", { ascending: false })
      .order("hora", { ascending: false });
    if (error) throw error;
    return ((data || []) as AppointmentJoinRow[]).map(rowToAppointment);
  }

  /**
   * Procura colisões de horário para o mesmo médico no mesmo dia.
   */
  async findOverlappingSlot(
    date: string,
    time: string,
    durationMin: number,
    doctor: string,
    ignoreAppointmentId?: string,
  ): Promise<Appointment | null> {
    const sameDay = await this.findByDate(date);
    for (const app of sameDay) {
      if (ignoreAppointmentId && app.id === ignoreAppointmentId) continue;
      if (app.medico !== doctor) continue;
      if (app.status === "recusado" || app.status === "remarcado") continue;

      if (isOverlapping(app.hora, app.duracaoMin, time, durationMin)) {
        return app;
      }
    }
    return null;
  }

  async create(appointment: Omit<Appointment, "criadoEm" | "atualizadoEm">): Promise<Appointment> {
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .insert({
        id: appointment.id,
        data: appointment.data,
        hora: appointment.hora,
        duracao_min: appointment.duracaoMin,
        paciente_id: appointment.paciente.id,
        tipo: appointment.tipo,
        tipos: appointment.tipos ?? null,
        medico: appointment.medico,
        status: appointment.status,
        pendencia: appointment.pendencia ?? null,
        observacoes: appointment.observacoes ?? null,
        notas: appointment.notas ?? null,
        etiquetas: appointment.etiquetas
          ? (JSON.parse(JSON.stringify(appointment.etiquetas)) as Tables<"appointments">["Insert"]["etiquetas"])
          : null,
        criado_em: now,
        atualizado_em: now,
      })
      .select(SELECT_WITH_PATIENT)
      .single();
    if (error) throw error;
    return rowToAppointment(data as AppointmentJoinRow);
  }

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const patch: Record<string, unknown> = {};
    if (updates.data !== undefined) patch["data"] = updates.data;
    if (updates.hora !== undefined) patch["hora"] = updates.hora;
    if (updates.duracaoMin !== undefined) patch["duracao_min"] = updates.duracaoMin;
    if (updates.tipo !== undefined) patch["tipo"] = updates.tipo;
    if ("tipos" in updates) patch["tipos"] = updates.tipos ?? null;
    if (updates.medico !== undefined) patch["medico"] = updates.medico;
    if (updates.status !== undefined) patch["status"] = updates.status;
    if ("pendencia" in updates) patch["pendencia"] = updates.pendencia ?? null;
    if ("observacoes" in updates) patch["observacoes"] = updates.observacoes ?? null;
    if ("notas" in updates) patch["notas"] = updates.notas ?? null;
    if ("etiquetas" in updates) {
      patch["etiquetas"] = updates.etiquetas ? JSON.parse(JSON.stringify(updates.etiquetas)) : null;
    }
    if (updates.paciente) patch["paciente_id"] = updates.paciente.id;

    const { data, error } = await supabaseAdmin
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .select(SELECT_WITH_PATIENT)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundError("Agendamento", id);
    return rowToAppointment(data as AppointmentJoinRow);
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabaseAdmin
      .from("appointments")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}

export const appointmentRepository = new AppointmentRepository();
