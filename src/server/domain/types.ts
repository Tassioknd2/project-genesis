export type AppointmentStatus =
  | "agendado"
  | "aguardando"
  | "confirmado"
  | "recusado"
  | "falha_envio"
  | "concluido"
  | "falta"
  | "remarcado";

export type PendenciaType = "recusado" | "sem_resposta" | "falha_envio" | "tardio";

export type TipoAtendimento =
  | "Consulta"
  | "Retorno"
  | "Eletrocardiograma"
  | "Ecocardiograma"
  | "Teste ergométrico"
  | "Holter 24h"
  | "MAPA";

export type CategoriaAtendimento = "exame" | "consulta";

export interface Patient {
  id: string;
  nome: string;
  idade: number;
  telefone: string;
  convenio: string;
  cpf?: string;
  email?: string;
  ultimaVisita?: string;
  observacoes?: string;
  criadoEm?: string;
}

export type EtiquetaCor = "ambar" | "verde" | "azul" | "vermelho" | "roxo" | "cinza";

export interface Etiqueta {
  id: string;
  texto: string;
  cor: EtiquetaCor;
}

export interface Appointment {
  id: string;
  data: string; // ISO YYYY-MM-DD
  hora: string; // HH:MM
  duracaoMin: number;
  paciente: Patient;
  tipo: TipoAtendimento;
  tipos?: TipoAtendimento[];
  medico: string;
  status: AppointmentStatus;
pendencia?: PendenciaType | undefined;
  observacoes?: string | undefined;
  notas?: string[];
  etiquetas?: Etiqueta[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuditLog {
  id: string;
  entidade: "appointment" | "patient" | "whatsapp";
  entidadeId: string;
  acao: string;
  deStatus?: AppointmentStatus;
  paraStatus?: AppointmentStatus;
  detalhes?: string;
  autor: string;
  criadoEm: string;
}

export interface AgendaSummaryMetrics {
  totalAgendamentos: number;
  confirmados: number;
  aguardando: number;
  agendados: number;
  recusados: number;
  concluidos: number;
  faltas: number;
  taxaConfirmacaoWhatsApp: number; // porcentagem (0 - 100)
  totalConsultas: number;
  totalExames: number;
  pendenciasCriticas: number;
}
