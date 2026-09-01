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
  dataNascimento?: string;
  telefone: string;
  convenio: string; // "Particular" quando particular
  ultimaVisita?: string;
  observacoes?: string;
}

export function calcularIdade(
  dataNascimento: string | Date | undefined,
  fallbackIdade?: number,
): number {
  if (!dataNascimento) return fallbackIdade ?? 0;
  let d: Date;
  if (dataNascimento instanceof Date) {
    d = dataNascimento;
  } else if (typeof dataNascimento === "string") {
    if (dataNascimento.includes("-")) {
      const parts = dataNascimento.split("-").map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        // YYYY-MM-DD
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(dataNascimento);
      }
    } else if (dataNascimento.includes("/")) {
      const parts = dataNascimento.split("/").map(Number);
      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
        // DD/MM/YYYY
        d = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        d = new Date(dataNascimento);
      }
    } else {
      d = new Date(dataNascimento);
    }
  } else {
    return fallbackIdade ?? 0;
  }

  if (isNaN(d.getTime())) return fallbackIdade ?? 0;

  const hoje = new Date();
  let anos = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) {
    anos--;
  }
  return Math.max(0, anos);
}

export interface Appointment {
  id: string;
  hora: string;
  duracaoMin: number;
  paciente: Patient;
  tipo: TipoAtendimento;
  tipos?: TipoAtendimento[];
  medico: string;
  status: AppointmentStatus;
  pendencia?: "recusado" | "sem_resposta" | "falha_envio" | "tardio" | undefined;
}

export const MEDICO = "Dr. Carlos Mendes";

// --- Categoria do atendimento (exame vs consulta) ---

export type CategoriaAtendimento = "exame" | "consulta";

export const TIPOS_CONSULTA: TipoAtendimento[] = ["Consulta", "Retorno"];

export const TIPOS_EXAME: TipoAtendimento[] = [
  "Eletrocardiograma",
  "Ecocardiograma",
  "Teste ergométrico",
  "Holter 24h",
  "MAPA",
];

const tiposExame = TIPOS_EXAME;

export function categoriaDe(tipo: TipoAtendimento): CategoriaAtendimento {
  return tiposExame.includes(tipo) ? "exame" : "consulta";
}

const DURACOES: Record<TipoAtendimento, number> = {
  Consulta: 30,
  Retorno: 30,
  Eletrocardiograma: 30,
  Ecocardiograma: 45,
  "Teste ergométrico": 50,
  "Holter 24h": 40,
  MAPA: 30,
};

export function duracaoDe(tipo: TipoAtendimento): number {
  return DURACOES[tipo] ?? 30;
}

export function duracaoDosTipos(tipos?: TipoAtendimento[], tipoPadrao?: TipoAtendimento): number {
  if (tipos && tipos.length > 0) {
    return tipos.reduce((acc, t) => acc + (DURACOES[t] ?? 30), 0);
  }
  return tipoPadrao ? duracaoDe(tipoPadrao) : 30;
}

export function formatarTipos(tipos?: TipoAtendimento[], tipoPadrao?: TipoAtendimento): string {
  if (tipos && tipos.length > 0) {
    if (tipos.length === 1) return tipos[0]!;
    if (tipos.length === 2) return `${tipos[0]} + ${tipos[1]}`;
    return `${tipos.slice(0, -1).join(", ")} + ${tipos[tipos.length - 1]}`;
  }
  return tipoPadrao ?? "Consulta";
}

export const pacientes: Patient[] = [
  {
    id: "p1",
    nome: "Marta Nogueira",
    idade: 62,
    dataNascimento: "1964-04-12",
    telefone: "(11) 98812-4450",
    convenio: "Unimed",
    ultimaVisita: "03/01/2026",
    observacoes: "Hipertensa; traz último exame de sangue.",
  },
  {
    id: "p2",
    nome: "Roberto Lima",
    idade: 58,
    dataNascimento: "1968-08-25",
    telefone: "(11) 97123-8801",
    convenio: "Particular",
    ultimaVisita: "18/12/2025",
  },
  {
    id: "p3",
    nome: "Cláudia Ferraz",
    idade: 71,
    dataNascimento: "1955-02-14",
    telefone: "(11) 96540-2213",
    convenio: "SulAmérica",
    ultimaVisita: "22/12/2025",
    observacoes: "Mobilidade reduzida; preferir sala térrea.",
  },
  {
    id: "p4",
    nome: "Henrique Prado",
    idade: 66,
    dataNascimento: "1960-06-30",
    telefone: "(11) 98777-5540",
    convenio: "Bradesco Saúde",
    ultimaVisita: "10/01/2026",
  },
  {
    id: "p5",
    nome: "Solange Ribeiro",
    idade: 74,
    dataNascimento: "1952-11-09",
    telefone: "(11) 99901-3345",
    convenio: "Porto Seguro",
    ultimaVisita: "05/01/2026",
  },
  {
    id: "p6",
    nome: "Eduardo Sanches",
    idade: 59,
    dataNascimento: "1967-03-18",
    telefone: "(11) 91234-7789",
    convenio: "Amil",
    ultimaVisita: "15/01/2026",
  },
  {
    id: "p7",
    nome: "Tereza Campos",
    idade: 80,
    dataNascimento: "1946-09-05",
    telefone: "(11) 98321-0012",
    convenio: "SulAmérica",
    ultimaVisita: "28/11/2025",
    observacoes: "Acompanhada pela filha.",
  },
  {
    id: "p8",
    nome: "Fernando Alcântara",
    idade: 64,
    dataNascimento: "1962-07-21",
    telefone: "(11) 97456-1188",
    convenio: "Particular",
    ultimaVisita: "09/01/2026",
  },
  {
    id: "p9",
    nome: "Beatriz Hoffmann",
    idade: 53,
    dataNascimento: "1973-10-15",
    telefone: "(11) 96610-9034",
    convenio: "Bradesco Saúde",
    ultimaVisita: "20/01/2026",
  },
  {
    id: "p10",
    nome: "Amélia Corrêa",
    idade: 69,
    dataNascimento: "1957-01-29",
    telefone: "(11) 98877-6621",
    convenio: "Amil",
    ultimaVisita: "12/01/2026",
  },
];

export const agendaDoDia: Appointment[] = [
  {
    id: "a1",
    hora: "08:00",
    duracaoMin: 30,
    paciente: pacientes[0]!,
    tipo: "Eletrocardiograma",
    medico: MEDICO,
    status: "concluido",
  },
  {
    id: "a2",
    hora: "08:30",
    duracaoMin: 45,
    paciente: pacientes[7]!,
    tipo: "Ecocardiograma",
    medico: MEDICO,
    status: "confirmado",
  },
  {
    id: "a3",
    hora: "09:15",
    duracaoMin: 60,
    paciente: pacientes[8]!,
    tipo: "Consulta",
    tipos: ["Consulta", "Eletrocardiograma"],
    medico: MEDICO,
    status: "confirmado",
  },
  {
    id: "a4",
    hora: "09:45",
    duracaoMin: 30,
    paciente: pacientes[1]!,
    tipo: "Teste ergométrico",
    medico: MEDICO,
    status: "aguardando",
    pendencia: "sem_resposta",
  },
  {
    id: "a5",
    hora: "10:30",
    duracaoMin: 50,
    paciente: pacientes[2]!,
    tipo: "Teste ergométrico",
    medico: MEDICO,
    status: "agendado",
  },
  {
    id: "a6",
    hora: "11:00",
    duracaoMin: 30,
    paciente: pacientes[3]!,
    tipo: "Retorno",
    medico: MEDICO,
    status: "recusado",
    pendencia: "recusado",
  },
  {
    id: "a7",
    hora: "13:30",
    duracaoMin: 40,
    paciente: pacientes[4]!,
    tipo: "Holter 24h",
    medico: MEDICO,
    status: "falha_envio",
    pendencia: "falha_envio",
  },
  {
    id: "a8",
    hora: "14:30",
    duracaoMin: 30,
    paciente: pacientes[9]!,
    tipo: "MAPA",
    medico: MEDICO,
    status: "aguardando",
    pendencia: "sem_resposta",
  },
  {
    id: "a9",
    hora: "15:00",
    duracaoMin: 30,
    paciente: pacientes[5]!,
    tipo: "Consulta",
    medico: MEDICO,
    status: "confirmado",
  },
  {
    id: "a10",
    hora: "16:30",
    duracaoMin: 30,
    paciente: pacientes[6]!,
    tipo: "Consulta",
    medico: MEDICO,
    status: "falta",
  },
];

export const statusInfo: Record<AppointmentStatus, { rotulo: string; descricao: string }> = {
  agendado: { rotulo: "Agendado", descricao: "Criado; confirmação ainda não enviada" },
  aguardando: { rotulo: "Aguardando", descricao: "Confirmação enviada, sem resposta" },
  confirmado: { rotulo: "Confirmado", descricao: "Paciente respondeu SIM" },
  recusado: { rotulo: "CANCELADO", descricao: "Paciente respondeu NÃO" },
  falha_envio: { rotulo: "Falha de envio", descricao: "Mensagem não foi entregue" },
  concluido: { rotulo: "Concluído", descricao: "Atendimento realizado" },
  falta: { rotulo: "FALTANTE", descricao: "Paciente não compareceu" },
  remarcado: { rotulo: "Remarcado", descricao: "Movido para outro horário" },
};

// --- Agenda por data (dados fictícios determinísticos) ---

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

/** Data de hoje (referência determinística para SSR e cliente). */
export const HOJE_ISO = "2026-08-31";

// --- Etiquetas (estilo Trello) ---

export const ETIQUETA_CORES = [
  { id: "ambar", rotulo: "Âmbar", classe: "tag-ambar" },
  { id: "verde", rotulo: "Verde", classe: "tag-verde" },
  { id: "azul", rotulo: "Azul", classe: "tag-azul" },
  { id: "vermelho", rotulo: "Vermelho", classe: "tag-vermelho" },
  { id: "roxo", rotulo: "Roxo", classe: "tag-roxo" },
  { id: "cinza", rotulo: "Cinza", classe: "tag-cinza" },
] as const;

export type EtiquetaCor = (typeof ETIQUETA_CORES)[number]["id"];

export interface Etiqueta {
  id: string;
  texto: string;
  cor: EtiquetaCor;
}

export function classeDaCor(cor: EtiquetaCor): string {
  return ETIQUETA_CORES.find((c) => c.id === cor)?.classe ?? "tag-cinza";
}

/** Ordena uma agenda pelo horário (HH:MM), crescente. */
export function ordenarPorHorario(lista: Appointment[]): Appointment[] {
  return [...lista].sort((a, b) => a.hora.localeCompare(b.hora));
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const statusFuturos: AppointmentStatus[] = [
  "agendado",
  "aguardando",
  "confirmado",
  "recusado",
  "falha_envio",
];
const statusPassados: AppointmentStatus[] = [
  "concluido",
  "concluido",
  "falta",
  "remarcado",
  "concluido",
];

function pendenciaDe(status: AppointmentStatus): Appointment["pendencia"] {
  if (status === "recusado") return "recusado";
  if (status === "aguardando") return "sem_resposta";
  if (status === "falha_envio") return "falha_envio";
  return undefined;
}

/** Retorna a agenda fictícia de uma data (domingos ficam vazios). */
export function getAgendaPorData(iso: string): Appointment[] {
  if (iso === HOJE_ISO) return agendaDoDia.map((a) => ({ ...a }));

  const data = fromISODate(iso);
  const diaSemana = data.getDay();
  if (diaSemana === 0) return [];

  const semente = hash(iso);
  const passado = iso < HOJE_ISO;
  const quantidade = diaSemana === 6 ? 3 + (semente % 3) : 5 + (semente % 6);

  return Array.from({ length: quantidade }, (_, i) => {
    const base = agendaDoDia[(semente + i * 3) % agendaDoDia.length]!;
    const status = passado
      ? statusPassados[(semente + i) % statusPassados.length]!
      : statusFuturos[(semente + i * 2) % statusFuturos.length]!;
    const minutos = 8 * 60 + i * 45 + ((semente + i) % 3) * 5;
    const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
    return {
      ...base,
      id: `${iso}-${i}`,
      hora,
      status,
      pendencia: pendenciaDe(status),
    };
  });
}
