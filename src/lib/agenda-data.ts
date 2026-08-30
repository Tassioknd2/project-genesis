// Dados fictícios do MVP — sem banco de dados nesta fase.

export type AppointmentStatus =
  | "agendado"
  | "aguardando"
  | "confirmado"
  | "recusado"
  | "falha_envio"
  | "concluido"
  | "falta"
  | "remarcado";

export type TipoAtendimento =
  | "Consulta"
  | "Retorno"
  | "Eletrocardiograma"
  | "Ecocardiograma"
  | "Teste ergométrico"
  | "Holter 24h"
  | "MAPA";

export interface Patient {
  id: string;
  nome: string;
  idade: number;
  telefone: string;
  convenio: string; // "Particular" quando particular
  ultimaVisita?: string;
  observacoes?: string;
}

export interface Appointment {
  id: string;
  hora: string;
  duracaoMin: number;
  paciente: Patient;
  tipo: TipoAtendimento;
  medico: string;
  status: AppointmentStatus;
  pendencia?: "recusado" | "sem_resposta" | "falha_envio" | "tardio";
}

export const MEDICO = "Dr. Carlos Mendes";

export const pacientes: Patient[] = [
  { id: "p1", nome: "Marta Nogueira", idade: 62, telefone: "(11) 98812-4450", convenio: "Unimed", ultimaVisita: "03/01/2026", observacoes: "Hipertensa; traz último exame de sangue." },
  { id: "p2", nome: "Roberto Lima", idade: 58, telefone: "(11) 97123-8801", convenio: "Particular", ultimaVisita: "18/12/2025" },
  { id: "p3", nome: "Cláudia Ferraz", idade: 71, telefone: "(11) 96540-2213", convenio: "SulAmérica", ultimaVisita: "22/12/2025", observacoes: "Mobilidade reduzida; preferir sala térrea." },
  { id: "p4", nome: "Henrique Prado", idade: 66, telefone: "(11) 98777-5540", convenio: "Bradesco Saúde", ultimaVisita: "10/01/2026" },
  { id: "p5", nome: "Solange Ribeiro", idade: 74, telefone: "(11) 99901-3345", convenio: "Porto Seguro", ultimaVisita: "05/01/2026" },
  { id: "p6", nome: "Eduardo Sanches", idade: 59, telefone: "(11) 91234-7789", convenio: "Amil", ultimaVisita: "15/01/2026" },
  { id: "p7", nome: "Tereza Campos", idade: 80, telefone: "(11) 98321-0012", convenio: "SulAmérica", ultimaVisita: "28/11/2025", observacoes: "Acompanhada pela filha." },
  { id: "p8", nome: "Fernando Alcântara", idade: 64, telefone: "(11) 97456-1188", convenio: "Particular", ultimaVisita: "09/01/2026" },
  { id: "p9", nome: "Beatriz Hoffmann", idade: 53, telefone: "(11) 96610-9034", convenio: "Bradesco Saúde", ultimaVisita: "20/01/2026" },
  { id: "p10", nome: "Amélia Corrêa", idade: 69, telefone: "(11) 98877-6621", convenio: "Amil", ultimaVisita: "12/01/2026" },
];

export const agendaDoDia: Appointment[] = [
  { id: "a1", hora: "08:00", duracaoMin: 30, paciente: pacientes[0], tipo: "Eletrocardiograma", medico: MEDICO, status: "concluido" },
  { id: "a2", hora: "08:30", duracaoMin: 45, paciente: pacientes[7], tipo: "Ecocardiograma", medico: MEDICO, status: "confirmado" },
  { id: "a3", hora: "09:15", duracaoMin: 30, paciente: pacientes[8], tipo: "Consulta", medico: MEDICO, status: "confirmado" },
  { id: "a4", hora: "09:45", duracaoMin: 30, paciente: pacientes[1], tipo: "Teste ergométrico", medico: MEDICO, status: "aguardando", pendencia: "sem_resposta" },
  { id: "a5", hora: "10:30", duracaoMin: 50, paciente: pacientes[2], tipo: "Teste ergométrico", medico: MEDICO, status: "agendado" },
  { id: "a6", hora: "11:00", duracaoMin: 30, paciente: pacientes[3], tipo: "Retorno", medico: MEDICO, status: "recusado", pendencia: "recusado" },
  { id: "a7", hora: "13:30", duracaoMin: 40, paciente: pacientes[4], tipo: "Holter 24h", medico: MEDICO, status: "falha_envio", pendencia: "falha_envio" },
  { id: "a8", hora: "14:30", duracaoMin: 30, paciente: pacientes[9], tipo: "MAPA", medico: MEDICO, status: "aguardando", pendencia: "sem_resposta" },
  { id: "a9", hora: "15:00", duracaoMin: 30, paciente: pacientes[5], tipo: "Consulta", medico: MEDICO, status: "confirmado" },
  { id: "a10", hora: "16:30", duracaoMin: 30, paciente: pacientes[6], tipo: "Consulta", medico: MEDICO, status: "falta" },
];

export const statusInfo: Record<
  AppointmentStatus,
  { rotulo: string; descricao: string }
> = {
  agendado: { rotulo: "Agendado", descricao: "Criado; confirmação ainda não enviada" },
  aguardando: { rotulo: "Aguardando", descricao: "Confirmação enviada, sem resposta" },
  confirmado: { rotulo: "Confirmado", descricao: "Paciente respondeu SIM" },
  recusado: { rotulo: "Recusado", descricao: "Paciente respondeu NÃO" },
  falha_envio: { rotulo: "Falha de envio", descricao: "Mensagem não foi entregue" },
  concluido: { rotulo: "Concluído", descricao: "Atendimento realizado" },
  falta: { rotulo: "Falta", descricao: "Paciente não compareceu" },
  remarcado: { rotulo: "Remarcado", descricao: "Movido para outro horário" },
};
