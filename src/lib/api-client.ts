import {
  Appointment,
  AppointmentStatus,
  AgendaSummaryMetrics,
  Etiqueta,
  Patient,
  TipoAtendimento,
  AuditLog,
} from "../server/domain/types";
import { DashboardStats } from "../server/services/analytics.service";
import { PatientDetails } from "../server/services/patient.service";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || `Erro na requisição HTTP ${response.status}`;
const err = new Error(errorMsg) as Error & { code?: string; details?: unknown };
      if (json.error?.code !== undefined) err.code = json.error.code;
      err.details = json.error?.details;
      throw err;
    }

    return json.data as T;
  }

  // --- Agenda & Agendamentos ---

  async getAgenda(query?: {
    date?: string;
    status?: string;
    search?: string;
    tipo?: string;
    categoria?: "consulta" | "exame";
  }): Promise<{
    date: string;
    appointments: Appointment[];
    metrics: AgendaSummaryMetrics;
  }> {
    const params = new URLSearchParams();
    if (query?.date) params.set("date", query.date);
    if (query?.status) params.set("status", query.status);
    if (query?.search) params.set("search", query.search);
    if (query?.tipo) params.set("tipo", query.tipo);
    if (query?.categoria) params.set("categoria", query.categoria);

    const qs = params.toString();
    return this.request<{
      date: string;
      appointments: Appointment[];
      metrics: AgendaSummaryMetrics;
    }>(`/api/agenda${qs ? `?${qs}` : ""}`);
  }

  async createAppointment(payload: {
    data: string;
    hora: string;
    tipo: TipoAtendimento;
    duracaoMin?: number;
    medico?: string;
    paciente: { id: string } | Omit<Patient, "id">;
    observacoes?: string;
    etiquetas?: Etiqueta[];
  }): Promise<Appointment> {
    return this.request<Appointment>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateStatus(id: string, status: AppointmentStatus, motivo?: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, motivo }),
    });
  }

  async reschedule(
    id: string,
    novaData: string,
    novaHora: string,
    motivo?: string,
  ): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${encodeURIComponent(id)}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify({ novaData, novaHora, motivo }),
    });
  }

  async addNote(id: string, nota: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${encodeURIComponent(id)}/notes`, {
      method: "POST",
      body: JSON.stringify({ nota }),
    });
  }

  async updateLabels(id: string, etiquetas: Etiqueta[]): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${encodeURIComponent(id)}/labels`, {
      method: "PUT",
      body: JSON.stringify({ etiquetas }),
    });
  }

  // --- Pacientes ---

  async getPatients(query?: { search?: string; convenio?: string }): Promise<Patient[]> {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.convenio) params.set("convenio", query.convenio);

    const qs = params.toString();
    return this.request<Patient[]>(`/api/patients${qs ? `?${qs}` : ""}`);
  }

  async getPatientDetails(id: string): Promise<PatientDetails> {
    return this.request<PatientDetails>(`/api/patients/${encodeURIComponent(id)}`);
  }

  async createPatient(patient: Omit<Patient, "id">): Promise<Patient> {
    return this.request<Patient>("/api/patients", {
      method: "POST",
      body: JSON.stringify(patient),
    });
  }

  // --- WhatsApp ---

  async sendWhatsAppConfirmation(appointmentId: string): Promise<{
    success: boolean;
    appointment: Appointment;
  }> {
    return this.request<{ success: boolean; appointment: Appointment }>("/api/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ appointmentId }),
    });
  }

  async simulateWhatsAppReply(
    appointmentId: string,
    resposta: "SIM" | "NAO" | "REMARCAR" | "FALHA_ENVIO",
    mensagemAdicional?: string,
  ): Promise<{
    appointment: Appointment;
    novoStatus: AppointmentStatus;
    mensagemProcessada: string;
  }> {
    return this.request<{
      appointment: Appointment;
      novoStatus: AppointmentStatus;
      mensagemProcessada: string;
    }>("/api/whatsapp/simulate-reply", {
      method: "POST",
      body: JSON.stringify({ appointmentId, resposta, mensagemAdicional }),
    });
  }

  // --- Estatísticas & Auditoria ---

  async getStats(date?: string): Promise<DashboardStats> {
    const params = date ? `?date=${encodeURIComponent(date)}` : "";
    return this.request<DashboardStats>(`/api/stats${params}`);
  }

  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/api/audit-logs?limit=${limit}`);
  }
}

export const apiClient = new ApiClient();
