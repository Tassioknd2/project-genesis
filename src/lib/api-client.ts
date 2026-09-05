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
import { UserSafeProfile, AuthSessionResponse, UserRole } from "../server/domain/auth.types";
import {
  PlanDefinition,
  SubscriptionSummaryResponse,
  Subscription,
  Profile,
  CheckoutRequestDTO,
  CreateProfileDTO,
  UpdateProfileDTO,
  Invoice,
} from "../server/domain/subscription.types";

export interface ApiResponse<T> {
  success: boolean;
  data?: T | undefined;
  error?: {
    code: string;
    message: string;
    details?: unknown | undefined;
  };
}

export const AUTH_TOKEN_KEY = "agenda_cardio_token";
export const AUTH_USER_KEY = "agenda_cardio_user";

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Inicializa o token do localStorage se estiver em ambiente de navegador
    if (typeof window !== "undefined") {
      try {
        this.token = localStorage.getItem(AUTH_TOKEN_KEY);
      } catch {
        this.token = null;
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      try {
        this.token = localStorage.getItem(AUTH_TOKEN_KEY);
      } catch {
        this.token = null;
      }
    }
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      try {
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      } catch {
        // Ignora erros de storage restrito
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }

    const currentToken = this.getToken();
    if (currentToken && !headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      // Se a sessão expirou ou for inválida (401), limpa credenciais locais
      if (response.status === 401 && endpoint.startsWith("/api/auth/me")) {
        this.setToken(null);
      }
      const errorMsg = json.error?.message || `Erro na requisição HTTP ${response.status}`;
      const err = new Error(errorMsg) as Error & { code?: string; details?: unknown };
      if (json.error?.code !== undefined) err.code = json.error.code;
      err.details = json.error?.details;
      throw err;
    }

    return json.data as T;
  }

  // --- Autenticação & Usuários ---

  async login(payload: { email: string; password: string }): Promise<AuthSessionResponse> {
    const res = await this.request<AuthSessionResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      } catch {
        // storage fallback
      }
    }
    return res;
  }

  async register(payload: {
    nome: string;
    email: string;
    password: string;
    role?: UserRole | undefined;
    telefone?: string | undefined;
    crm?: string | undefined;
  }): Promise<AuthSessionResponse> {
    const res = await this.request<AuthSessionResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      } catch {
        // storage fallback
      }
    }
    return res;
  }

  async loginWithGoogle(payload: {
    credential: string;
    role?: UserRole | undefined;
  }): Promise<AuthSessionResponse> {
    const res = await this.request<AuthSessionResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      } catch {
        // storage fallback
      }
    }
    return res;
  }

  async getMe(): Promise<{ user: UserSafeProfile }> {
    return this.request<{ user: UserSafeProfile }>("/api/auth/me", {
      method: "GET",
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request<{ message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Logout é idempotente
    } finally {
      this.setToken(null);
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string; previewToken?: string }> {
    return this.request<{ message: string; previewToken?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async sendVerificationCode(
    email?: string,
  ): Promise<{ success: boolean; message: string; previewCode?: string }> {
    return this.request<{ success: boolean; message: string; previewCode?: string }>(
      "/api/auth/send-verification-code",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );
  }

  async verifyEmail(
    code: string,
    email?: string,
  ): Promise<{ success: boolean; user: UserSafeProfile; message: string }> {
    const res = await this.request<{ success: boolean; user: UserSafeProfile; message: string }>(
      "/api/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify({ code, email }),
      },
    );
    if (res.user && typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      } catch {
        // fallback
      }
    }
    return res;
  }

  // --- Agenda & Agendamentos ---

  async getAgenda(query?: {
    date?: string | undefined;
    status?: string | undefined;
    search?: string | undefined;
    tipo?: string | undefined;
    categoria?: "consulta" | "exame" | undefined;
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
    duracaoMin?: number | undefined;
    medico?: string | undefined;
    paciente: { id: string } | Omit<Patient, "id">;
    observacoes?: string | undefined;
    etiquetas?: Etiqueta[] | undefined;
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

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return this.request<Patient>(`/api/patients/${encodeURIComponent(id)}`, {
      method: "PUT",
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

  // --- Planos e Assinaturas (O Motor de Monetização) ---

  async getPlans(): Promise<PlanDefinition[]> {
    const res = await this.request<{ plans: PlanDefinition[] }>("/api/plans");
    return res.plans;
  }

  async getSubscriptionSummary(): Promise<SubscriptionSummaryResponse> {
    return this.request<SubscriptionSummaryResponse>("/api/subscriptions/my");
  }

  async getInvoices(): Promise<Invoice[]> {
    const res = await this.request<{ invoices: Invoice[] }>("/api/subscriptions/invoices");
    return res.invoices;
  }

  async checkout(data: CheckoutRequestDTO): Promise<{
    subscription: Subscription;
    message: string;
    transacaoId: string;
  }> {
    return this.request<{
      subscription: Subscription;
      message: string;
      transacaoId: string;
    }>("/api/subscriptions/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelSubscription(): Promise<{ message: string; subscription: Subscription }> {
    return this.request<{ message: string; subscription: Subscription }>(
      "/api/subscriptions/cancel",
      {
        method: "POST",
      },
    );
  }

  // --- Múltiplos Perfis (Estilo Netflix) ---

  async getProfiles(): Promise<Profile[]> {
    const res = await this.request<{ profiles: Profile[] }>("/api/profiles");
    return res.profiles;
  }

  async createProfile(data: CreateProfileDTO): Promise<Profile> {
    const res = await this.request<{ profile: Profile }>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.profile;
  }

  async updateProfile(id: string, data: UpdateProfileDTO): Promise<Profile> {
    const res = await this.request<{ profile: Profile }>(`/api/profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.profile;
  }

  async deleteProfile(id: string): Promise<void> {
    await this.request<{ message: string }>(`/api/profiles/${id}`, {
      method: "DELETE",
    });
  }

  async selectProfile(id: string, pin?: string): Promise<Profile> {
    const res = await this.request<{ profile: Profile; message: string }>(
      `/api/profiles/${id}/select`,
      {
        method: "POST",
        body: JSON.stringify({ pin }),
      },
    );
    return res.profile;
  }
}

export const apiClient = new ApiClient();
