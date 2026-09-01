import { Appointment, AppointmentStatus, Patient } from "../domain/types";
import { isOverlapping } from "../domain/state-machine";
import { NotFoundError } from "../domain/errors";
import { patientRepository } from "./patient.repository";

function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class AppointmentRepository {
  private appointments: Map<string, Appointment> = new Map();
  private initialized = false;

  constructor() {
    this.initSeedData();
  }

  private async initSeedData() {
    if (this.initialized) return;
    this.initialized = true;

    const today = getTodayIso();
    const now = new Date().toISOString();

    const p = await patientRepository.findAll();
    const p1 = p.find((x) => x.id === "p1") || p[0]!;
    const p2 = p.find((x) => x.id === "p2") || p[1]!;
    const p3 = p.find((x) => x.id === "p3") || p[2]!;
    const p4 = p.find((x) => x.id === "p4") || p[3]!;
    const p5 = p.find((x) => x.id === "p5") || p[4]!;
    const p6 = p.find((x) => x.id === "p6") || p[5]!;
    const p7 = p.find((x) => x.id === "p7") || p[6]!;
    const p8 = p.find((x) => x.id === "p8") || p[7]!;
    const p9 = p.find((x) => x.id === "p9") || p[8]!;
    const p10 = p.find((x) => x.id === "p10") || p[9]!;

    const seed: Omit<Appointment, "criadoEm" | "atualizadoEm">[] = [
      {
        id: "a1",
        data: today,
        hora: "08:00",
        duracaoMin: 30,
        paciente: p1,
        tipo: "Eletrocardiograma",
        medico: "Dr. Carlos Mendes",
        status: "concluido",
      },
      {
        id: "a2",
        data: today,
        hora: "08:30",
        duracaoMin: 45,
        paciente: p8,
        tipo: "Ecocardiograma",
        medico: "Dr. Carlos Mendes",
        status: "confirmado",
      },
      {
        id: "a3",
        data: today,
        hora: "09:15",
        duracaoMin: 60,
        paciente: p9,
        tipo: "Consulta",
        tipos: ["Consulta", "Eletrocardiograma"],
        medico: "Dr. Carlos Mendes",
        status: "confirmado",
      },
      {
        id: "a4",
        data: today,
        hora: "09:45",
        duracaoMin: 30,
        paciente: p2,
        tipo: "Teste ergométrico",
        medico: "Dr. Carlos Mendes",
        status: "aguardando",
        pendencia: "sem_resposta",
      },
      {
        id: "a5",
        data: today,
        hora: "10:30",
        duracaoMin: 50,
        paciente: p3,
        tipo: "Teste ergométrico",
        medico: "Dr. Carlos Mendes",
        status: "agendado",
      },
      {
        id: "a6",
        data: today,
        hora: "11:00",
        duracaoMin: 30,
        paciente: p4,
        tipo: "Retorno",
        medico: "Dr. Carlos Mendes",
        status: "recusado",
        pendencia: "recusado",
      },
      {
        id: "a7",
        data: today,
        hora: "13:30",
        duracaoMin: 40,
        paciente: p5,
        tipo: "Holter 24h",
        medico: "Dr. Carlos Mendes",
        status: "falha_envio",
        pendencia: "falha_envio",
      },
      {
        id: "a8",
        data: today,
        hora: "14:30",
        duracaoMin: 30,
        paciente: p10,
        tipo: "MAPA",
        medico: "Dr. Carlos Mendes",
        status: "aguardando",
        pendencia: "sem_resposta",
      },
      {
        id: "a9",
        data: today,
        hora: "15:00",
        duracaoMin: 30,
        paciente: p6,
        tipo: "Consulta",
        medico: "Dr. Carlos Mendes",
        status: "confirmado",
      },
      {
        id: "a10",
        data: today,
        hora: "16:30",
        duracaoMin: 30,
        paciente: p7,
        tipo: "Consulta",
        medico: "Dr. Carlos Mendes",
        status: "falta",
      },
    ];

    for (const item of seed) {
      this.appointments.set(item.id, {
        ...item,
        criadoEm: now,
        atualizadoEm: now,
      });
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    const item = this.appointments.get(id);
    return item ? { ...item } : null;
  }

  async findByDate(date: string): Promise<Appointment[]> {
    const results: Appointment[] = [];
    for (const item of this.appointments.values()) {
      if (item.data === date) {
        results.push({ ...item });
      }
    }
    return results.sort((a, b) => a.hora.localeCompare(b.hora));
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const results: Appointment[] = [];
    for (const item of this.appointments.values()) {
      if (item.paciente.id === patientId) {
        results.push({ ...item });
      }
    }
    return results.sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora));
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
    const full: Appointment = {
      ...appointment,
      criadoEm: now,
      atualizadoEm: now,
    };
    this.appointments.set(full.id, full);
    return { ...full };
  }

  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) {
      throw new NotFoundError("Agendamento", id);
    }
    const updated: Appointment = {
      ...existing,
      ...updates,
      id, // imutável
      atualizadoEm: new Date().toISOString(),
    };
    this.appointments.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }
}

export const appointmentRepository = new AppointmentRepository();
