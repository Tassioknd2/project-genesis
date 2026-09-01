import { Appointment, AppointmentStatus } from "../domain/types";
import { formatarProcedimentos } from "../domain/state-machine";
import { NotFoundError, ValidationError } from "../domain/errors";
import { appointmentRepository } from "../repositories/appointment.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";

export interface WhatsAppMessagePayload {
  destinatario: string;
  telefone: string;
  mensagem: string;
  data: string;
  hora: string;
  procedimento: string;
  preparo?: string;
}

export class WhatsAppDispatchService {
  /**
   * Gera a mensagem personalizada de confirmação com orientações clínicas de preparo.
   */
  generateConfirmationMessage(appointment: Appointment): WhatsAppMessagePayload {
    const { paciente, tipo, tipos, data, hora, medico } = appointment;
    const [y, m, d] = data.split("-");
    const dataFormatada = `${d}/${m}/${y}`;

    const listaTipos = tipos && tipos.length > 0 ? tipos : [tipo];
    const procedimentoFormatado = formatarProcedimentos(listaTipos, tipo);

    const preparos: string[] = [];
    if (listaTipos.includes("Ecocardiograma")) {
      preparos.push(
        "• Ecocardiograma: chegar com 15 minutos de antecedência e trazer exames anteriores.",
      );
    }
    if (listaTipos.includes("Teste ergométrico")) {
      preparos.push(
        "• Teste Ergométrico: venha com roupas leves e tênis esportivo. Evitar cafeína nas 12h anteriores.",
      );
    }
    if (listaTipos.includes("Holter 24h") || listaTipos.includes("MAPA")) {
      preparos.push(
        "• Holter/MAPA: tomar banho antes do exame e não utilizar cremes ou óleos no tórax.",
      );
    }
    if (listaTipos.includes("Eletrocardiograma")) {
      preparos.push("• ECG: não aplicar hidratantes na pele antes do exame.");
    }
    if (preparos.length === 0) {
      preparos.push("• Traga documento com foto e sua carteirinha do convênio.");
    }

    const textoPreparo = preparos.join("\n");
    const mensagem = `Olá, ${paciente.nome}! Confirmamos seu agendamento de ${procedimentoFormatado} com o ${medico} no dia ${dataFormatada} às ${hora}.\n\nOrientações:\n${textoPreparo}\n\nResponda com:\n1 para CONFIRMAR\n2 para CANCELAR\n3 para REMARCAR`;

    return {
      destinatario: paciente.nome,
      telefone: paciente.telefone,
      mensagem,
      data: dataFormatada,
      hora,
      procedimento: procedimentoFormatado,
      preparo: textoPreparo,
    };
  }

  async sendConfirmation(
    appointmentId: string,
    actor = "Sistema WhatsApp",
  ): Promise<{
    success: boolean;
    appointment: Appointment;
    payload: WhatsAppMessagePayload;
  }> {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Agendamento", appointmentId);
    }

    const payload = this.generateConfirmationMessage(appointment);

    // Atualiza status para aguardando resposta
    const updated = await appointmentRepository.update(appointmentId, {
      status: "aguardando",
      pendencia: "sem_resposta",
    });

    await auditLogRepository.log({
      entidade: "whatsapp",
      entidadeId: appointmentId,
      acao: "ENVIAR_CONFIRMACAO_WHATSAPP",
      deStatus: appointment.status,
      paraStatus: "aguardando",
      detalhes: `Mensagem enviada para ${appointment.paciente.telefone} (${appointment.paciente.nome}).`,
      autor: actor,
    });

    return {
      success: true,
      appointment: updated,
      payload,
    };
  }

  async simulateIncomingResponse(
    appointmentId: string,
    resposta: "SIM" | "NAO" | "REMARCAR" | "FALHA_ENVIO",
    mensagemAdicional?: string,
    actor = "Paciente (WhatsApp)",
  ): Promise<{
    appointment: Appointment;
    novoStatus: AppointmentStatus;
    mensagemProcessada: string;
  }> {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError("Agendamento", appointmentId);
    }

    let targetStatus: AppointmentStatus = appointment.status;
    let pendencia = appointment.pendencia;
    let desc = "";

    switch (resposta) {
      case "SIM":
        targetStatus = "confirmado";
        pendencia = undefined;
        desc = "Paciente confirmou presença via WhatsApp.";
        break;
      case "NAO":
        targetStatus = "recusado";
        pendencia = "recusado";
        desc = `Paciente recusou/cancelou atendimento via WhatsApp.${mensagemAdicional ? ` Motivo: ${mensagemAdicional}` : ""}`;
        break;
      case "REMARCAR":
        targetStatus = "agendado";
        pendencia = "tardio";
        desc = "Paciente solicitou remarcação via WhatsApp.";
        break;
      case "FALHA_ENVIO":
        targetStatus = "falha_envio";
        pendencia = "falha_envio";
        desc = "Falha na entrega da mensagem do WhatsApp (número inválido ou fora de rede).";
        break;
      default:
        throw new ValidationError("Resposta desconhecida do WhatsApp.");
    }

    const updated = await appointmentRepository.update(appointmentId, {
      status: targetStatus,
      pendencia,
    });

    await auditLogRepository.log({
      entidade: "whatsapp",
      entidadeId: appointmentId,
      acao: `RESPOSTA_WHATSAPP_${resposta}`,
      deStatus: appointment.status,
      paraStatus: targetStatus,
      detalhes: desc,
      autor: actor,
    });

    return {
      appointment: updated,
      novoStatus: targetStatus,
      mensagemProcessada: desc,
    };
  }
}

export const whatsAppDispatchService = new WhatsAppDispatchService();
