import { Patient, Appointment } from "../domain/types";
import { NotFoundError } from "../domain/errors";
import { patientRepository } from "../repositories/patient.repository";
import { appointmentRepository } from "../repositories/appointment.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";

export interface PatientDetails extends Patient {
  historico: Appointment[];
  totalConsultas: number;
  totalExames: number;
}

export class PatientService {
  async list(query?: { search?: string; convenio?: string }): Promise<Patient[]> {
    return patientRepository.findAll(query);
  }

  async getDetails(id: string): Promise<PatientDetails> {
    const patient = await patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError("Paciente", id);
    }

    const historico = await appointmentRepository.findByPatientId(id);
    let totalConsultas = 0;
    let totalExames = 0;

    for (const a of historico) {
      if (a.tipo === "Consulta" || a.tipo === "Retorno") {
        totalConsultas++;
      } else {
        totalExames++;
      }
    }

    return {
      ...patient,
      historico,
      totalConsultas,
      totalExames,
    };
  }

  async create(data: Omit<Patient, "id">, actor = "Recepção"): Promise<Patient> {
    const patient = await patientRepository.create(data);
    await auditLogRepository.log({
      entidade: "patient",
      entidadeId: patient.id,
      acao: "CRIAR_PACIENTE",
      detalhes: `Paciente ${patient.nome} cadastrado com plano ${patient.convenio}.`,
      autor: actor,
    });
    return patient;
  }

  async update(id: string, updates: Partial<Patient>, actor = "Recepção"): Promise<Patient> {
    const patient = await patientRepository.update(id, updates);
    await auditLogRepository.log({
      entidade: "patient",
      entidadeId: id,
      acao: "ATUALIZAR_PACIENTE",
      detalhes: `Dados de ${patient.nome} atualizados.`,
      autor: actor,
    });
    return patient;
  }
}

export const patientService = new PatientService();
