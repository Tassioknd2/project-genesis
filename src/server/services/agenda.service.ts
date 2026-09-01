import {
  Appointment,
  AppointmentStatus,
  AgendaSummaryMetrics,
  Etiqueta,
  Patient,
  TipoAtendimento,
} from "../domain/types";
import {
  assertValidStatusTransition,
  formatarProcedimentos,
  getCategoriaAtendimento,
  getDuracaoAtendimento,
  getDuracaoTotal,
} from "../domain/state-machine";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors";
import { appointmentRepository } from "../repositories/appointment.repository";
import { patientRepository } from "../repositories/patient.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";

export interface CreateAppointmentDTO {
  data: string;
  hora: string;
  tipo?: TipoAtendimento;
  tipos?: TipoAtendimento[];
  duracaoMin?: number;
  medico?: string;
  paciente: { id: string } | Omit<Patient, "id">;
  observacoes?: string;
  etiquetas?: Etiqueta[];
}

export interface GetAgendaQuery {
  date?: string;
  status?: string;
  search?: string;
  tipo?: string;
  categoria?: "consulta" | "exame";
}

export class AgendaService {
  async getAgenda(query: GetAgendaQuery): Promise<{
    date: string;
    appointments: Appointment[];
    metrics: AgendaSummaryMetrics;
  }> {
    const todayIso = query.date || new Date().toISOString().split("T")[0]!;
    let list = await appointmentRepository.findByDate(todayIso);

    // Calcular métricas completas do dia antes de filtros visuais
    const totalAgendamentos = list.length;
    const confirmados = list.filter((a) => a.status === "confirmado").length;
    const aguardando = list.filter((a) => a.status === "aguardando").length;
    const agendados = list.filter((a) => a.status === "agendado").length;
    const recusados = list.filter((a) => a.status === "recusado").length;
    const concluidos = list.filter((a) => a.status === "concluido").length;
    const faltas = list.filter((a) => a.status === "falta").length;

    const totalEnviadosOuRespondidos = confirmados + recusados + aguardando;
    const taxaConfirmacaoWhatsApp =
      totalEnviadosOuRespondidos > 0
        ? Math.round((confirmados / totalEnviadosOuRespondidos) * 100)
        : 0;

    let totalConsultas = 0;
    let totalExames = 0;
    let pendenciasCriticas = 0;

    for (const a of list) {
      if (getCategoriaAtendimento(a.tipo) === "exame") {
        totalExames++;
      } else {
        totalConsultas++;
      }
      if (a.status === "recusado" || a.status === "falha_envio" || a.pendencia) {
        pendenciasCriticas++;
      }
    }

    const metrics: AgendaSummaryMetrics = {
      totalAgendamentos,
      confirmados,
      aguardando,
      agendados,
      recusados,
      concluidos,
      faltas,
      taxaConfirmacaoWhatsApp,
      totalConsultas,
      totalExames,
      pendenciasCriticas,
    };

    // Aplicar filtros de pesquisa / status
    if (query.status && query.status !== "todos") {
      list = list.filter((a) => a.status === query.status);
    }

    if (query.categoria) {
      list = list.filter((a) => {
        if (a.tipos && a.tipos.length > 0) {
          return a.tipos.some((t) => getCategoriaAtendimento(t) === query.categoria);
        }
        return getCategoriaAtendimento(a.tipo) === query.categoria;
      });
    }

    if (query.tipo && query.tipo !== "todos") {
      list = list.filter(
        (a) =>
          a.tipo === query.tipo || (a.tipos && a.tipos.includes(query.tipo as TipoAtendimento)),
      );
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.paciente.nome.toLowerCase().includes(s) ||
          a.paciente.telefone.includes(s) ||
          a.paciente.convenio.toLowerCase().includes(s) ||
          a.tipo.toLowerCase().includes(s) ||
          (a.tipos && a.tipos.some((t) => t.toLowerCase().includes(s))) ||
          (a.observacoes && a.observacoes.toLowerCase().includes(s)),
      );
    }

    return {
      date: todayIso,
      appointments: list,
      metrics,
    };
  }

  async createAppointment(dto: CreateAppointmentDTO, actor = "Recepção"): Promise<Appointment> {
    const doctor = dto.medico || "Dr. Carlos Mendes";
    const selectedTypes =
      dto.tipos && dto.tipos.length > 0 ? dto.tipos : dto.tipo ? [dto.tipo] : [];
    const primaryType = selectedTypes[0] || dto.tipo || "Consulta";
    const duration = dto.duracaoMin || getDuracaoTotal(selectedTypes, primaryType);

    // 1. Resolver ou criar paciente
    let patient: Patient;
    if ("id" in dto.paciente && dto.paciente.id) {
      const found = await patientRepository.findById(dto.paciente.id);
      if (!found) {
        throw new NotFoundError("Paciente", dto.paciente.id);
      }
      patient = found;
    } else {
      const newPatientData = dto.paciente as Omit<Patient, "id">;
      if (!newPatientData.nome || !newPatientData.telefone) {
        throw new ValidationError(
          "Nome e telefone do paciente são obrigatórios para novo cadastro.",
        );
      }
      patient = await patientRepository.create(newPatientData);
    }

    // 2. Verificar conflito de agenda no mesmo horário
    const conflict = await appointmentRepository.findOverlappingSlot(
      dto.data,
      dto.hora,
      duration,
      doctor,
    );

    if (conflict) {
      const descConflito = formatarProcedimentos(conflict.tipos, conflict.tipo);
      throw new ConflictError(
        `Horário indisponível: o ${doctor} já possui atendimento marcado (${descConflito} - ${conflict.paciente.nome}) às ${conflict.hora}.`,
      );
    }

    // 3. Criar agendamento
    const id = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const appointment: Omit<Appointment, "criadoEm" | "atualizadoEm"> = {
      id,
      data: dto.data,
      hora: dto.hora,
      duracaoMin: duration,
      paciente: patient,
      tipo: primaryType,
      tipos: selectedTypes.length > 0 ? selectedTypes : [primaryType],
      medico: doctor,
      status: "agendado",
      observacoes: dto.observacoes,
      etiquetas: dto.etiquetas || [],
      notas: [],
    };

    const created = await appointmentRepository.create(appointment);

    // 4. Registrar auditoria
    const rotuloProcedimentos = formatarProcedimentos(created.tipos, created.tipo);
    await auditLogRepository.log({
      entidade: "appointment",
      entidadeId: created.id,
      acao: "CRIAR_AGENDAMENTO",
      paraStatus: "agendado",
      detalhes: `${rotuloProcedimentos} agendado para ${patient.nome} às ${dto.hora} (${duration} min).`,
      autor: actor,
    });

    return created;
  }

  async updateStatus(
    id: string,
    targetStatus: AppointmentStatus,
    motivo?: string,
    actor = "Recepção",
    allowAdminOverride = false,
  ): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento", id);
    }

    const previousStatus = appointment.status;
    assertValidStatusTransition(previousStatus, targetStatus, allowAdminOverride);

    let pendencia = appointment.pendencia;
    if (targetStatus === "recusado") {
      pendencia = "recusado";
    } else if (targetStatus === "aguardando") {
      pendencia = "sem_resposta";
    } else if (targetStatus === "falha_envio") {
      pendencia = "falha_envio";
    } else if (targetStatus === "confirmado" || targetStatus === "concluido") {
      pendencia = undefined;
    }

    const updated = await appointmentRepository.update(id, {
      status: targetStatus,
      pendencia,
    });

    await auditLogRepository.log({
      entidade: "appointment",
      entidadeId: id,
      acao: "ALTERAR_STATUS",
      deStatus: previousStatus,
      paraStatus: targetStatus,
      detalhes: motivo || `Status alterado de ${previousStatus} para ${targetStatus}`,
      autor: actor,
    });

    return updated;
  }

  async reschedule(
    id: string,
    newDate: string,
    newTime: string,
    motivo?: string,
    actor = "Recepção",
  ): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento", id);
    }

    // Verificar se novo horário está vago
    const conflict = await appointmentRepository.findOverlappingSlot(
      newDate,
      newTime,
      appointment.duracaoMin,
      appointment.medico,
      id,
    );

    if (conflict) {
      throw new ConflictError(
        `Horário indisponível: o ${appointment.medico} já possui atendimento (${conflict.tipo}) às ${conflict.hora} no dia ${newDate}.`,
      );
    }

    const oldDate = appointment.data;
    const oldTime = appointment.hora;

    const updated = await appointmentRepository.update(id, {
      data: newDate,
      hora: newTime,
      status: "agendado",
      pendencia: undefined,
    });

    await auditLogRepository.log({
      entidade: "appointment",
      entidadeId: id,
      acao: "REMARCAR_AGENDAMENTO",
      deStatus: appointment.status,
      paraStatus: "agendado",
      detalhes: `Remarcado de ${oldDate} às ${oldTime} para ${newDate} às ${newTime}.${motivo ? ` Motivo: ${motivo}` : ""}`,
      autor: actor,
    });

    return updated;
  }

  async addNote(id: string, noteText: string, actor = "Recepção"): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento", id);
    }

    const currentNotes = appointment.notas || [];
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedNote = `[${timestamp} - ${actor}]: ${noteText}`;
    const newNotes = [...currentNotes, formattedNote];

    const updated = await appointmentRepository.update(id, {
      notas: newNotes,
    });

    await auditLogRepository.log({
      entidade: "appointment",
      entidadeId: id,
      acao: "ADICIONAR_NOTA",
      detalhes: noteText,
      autor: actor,
    });

    return updated;
  }

  async updateLabels(id: string, labels: Etiqueta[], actor = "Recepção"): Promise<Appointment> {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento", id);
    }

    const updated = await appointmentRepository.update(id, {
      etiquetas: labels,
    });

    await auditLogRepository.log({
      entidade: "appointment",
      entidadeId: id,
      acao: "ATUALIZAR_ETIQUETAS",
      detalhes: `Etiquetas atualizadas: ${labels.map((l) => l.texto).join(", ")}`,
      autor: actor,
    });

    return updated;
  }
}

export const agendaService = new AgendaService();
