import { appointmentRepository } from "../repositories/appointment.repository";
import { patientRepository } from "../repositories/patient.repository";
import { getCategoriaAtendimento } from "../domain/state-machine";
import { TipoAtendimento } from "../domain/types";

export interface DashboardStats {
  data: string;
  totalPacientesCadastrados: number;
  totalAtendimentosHoje: number;
  distribuicaoStatus: {
    confirmados: number;
    aguardando: number;
    agendados: number;
    recusados: number;
    concluidos: number;
    faltas: number;
    falhasEnvio: number;
  };
  procedimentosFrequentes: {
    nome: string;
    quantidade: number;
    categoria: "consulta" | "exame";
  }[];
  taxaConfirmacaoWhatsApp: number;
  taxaNoShow: number; // faltas / (concluidos + faltas) * 100
}

export class AnalyticsService {
  async getDailyStats(date?: string): Promise<DashboardStats> {
    const today = date || new Date().toISOString().split("T")[0]!;
    const appointments = await appointmentRepository.findByDate(today);
    const patients = await patientRepository.findAll();

    const statusCounts = {
      confirmados: 0,
      aguardando: 0,
      agendados: 0,
      recusados: 0,
      concluidos: 0,
      faltas: 0,
      falhasEnvio: 0,
    };

    const procedimentosMap = new Map<string, number>();

    for (const a of appointments) {
      if (a.status === "confirmado") statusCounts.confirmados++;
      else if (a.status === "aguardando") statusCounts.aguardando++;
      else if (a.status === "agendado") statusCounts.agendados++;
      else if (a.status === "recusado") statusCounts.recusados++;
      else if (a.status === "concluido") statusCounts.concluidos++;
      else if (a.status === "falta") statusCounts.faltas++;
      else if (a.status === "falha_envio") statusCounts.falhasEnvio++;

      const tiposDoAgendamento = a.tipos && a.tipos.length > 0 ? a.tipos : [a.tipo];
      for (const t of tiposDoAgendamento) {
        procedimentosMap.set(t, (procedimentosMap.get(t) || 0) + 1);
      }
    }

    const totalRespondidos =
      statusCounts.confirmados + statusCounts.recusados + statusCounts.aguardando;
    const taxaConfirmacaoWhatsApp =
      totalRespondidos > 0 ? Math.round((statusCounts.confirmados / totalRespondidos) * 100) : 0;

    const totalFinalizados = statusCounts.concluidos + statusCounts.faltas;
    const taxaNoShow =
      totalFinalizados > 0 ? Math.round((statusCounts.faltas / totalFinalizados) * 100) : 0;

    const procedimentosFrequentes = Array.from(procedimentosMap.entries())
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
        categoria: getCategoriaAtendimento(nome as TipoAtendimento),
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    return {
      data: today,
      totalPacientesCadastrados: patients.length,
      totalAtendimentosHoje: appointments.length,
      distribuicaoStatus: statusCounts,
      procedimentosFrequentes,
      taxaConfirmacaoWhatsApp,
      taxaNoShow,
    };
  }
}

export const analyticsService = new AnalyticsService();
