import { AppointmentStatus, TipoAtendimento, CategoriaAtendimento } from "./types";
import { InvalidStateTransitionError } from "./errors";

// Procedimentos cardiológicos e suas durações padrão em minutos
export const DURACOES_PROCEDIMENTOS: Record<TipoAtendimento, number> = {
  Consulta: 30,
  Retorno: 30,
  Eletrocardiograma: 30,
  Ecocardiograma: 45,
  "Teste ergométrico": 50,
  "Holter 24h": 40,
  MAPA: 30,
};

const TIPOS_EXAME: Set<TipoAtendimento> = new Set([
  "Eletrocardiograma",
  "Ecocardiograma",
  "Teste ergométrico",
  "Holter 24h",
  "MAPA",
]);

export function getCategoriaAtendimento(tipo: TipoAtendimento): CategoriaAtendimento {
  return TIPOS_EXAME.has(tipo) ? "exame" : "consulta";
}

export function getDuracaoAtendimento(tipo: TipoAtendimento): number {
  return DURACOES_PROCEDIMENTOS[tipo] ?? 30;
}

export function getDuracaoTotal(tipos?: TipoAtendimento[], tipoPadrao?: TipoAtendimento): number {
  if (tipos && tipos.length > 0) {
    return tipos.reduce((acc, t) => acc + (DURACOES_PROCEDIMENTOS[t] ?? 30), 0);
  }
  return tipoPadrao ? getDuracaoAtendimento(tipoPadrao) : 30;
}

export function formatarProcedimentos(
  tipos?: TipoAtendimento[],
  tipoPadrao?: TipoAtendimento,
): string {
  if (tipos && tipos.length > 0) {
    if (tipos.length === 1) return tipos[0]!;
    if (tipos.length === 2) return `${tipos[0]} e ${tipos[1]}`;
    return `${tipos.slice(0, -1).join(", ")} e ${tipos[tipos.length - 1]}`;
  }
  return tipoPadrao ?? "Consulta";
}

// Matriz de transições permitidas na máquina de estados da clínica
const TRANSOES_PERMITIDAS: Record<AppointmentStatus, Set<AppointmentStatus>> = {
  agendado: new Set(["aguardando", "confirmado", "recusado", "falha_envio", "remarcado", "falta"]),
  aguardando: new Set(["confirmado", "recusado", "falha_envio", "remarcado", "falta", "concluido"]),
  confirmado: new Set(["concluido", "falta", "recusado", "remarcado", "aguardando"]),
  recusado: new Set(["remarcado", "agendado", "aguardando"]), // Uma vez recusado, precisa ser remarcado ou reativado
  falha_envio: new Set(["aguardando", "confirmado", "recusado", "remarcado"]),
  concluido: new Set([]), // Estado final
  falta: new Set(["remarcado", "agendado"]), // Paciente faltante pode ser remarcado
  remarcado: new Set([]), // Estado de histórico (um novo agendamento é criado)
};

export function assertValidStatusTransition(
  currentStatus: AppointmentStatus,
  targetStatus: AppointmentStatus,
  allowAdminOverride = false,
): void {
  if (currentStatus === targetStatus) return;

  if (allowAdminOverride) return;

  const validTargets = TRANSOES_PERMITIDAS[currentStatus];
  if (!validTargets || !validTargets.has(targetStatus)) {
    throw new InvalidStateTransitionError(
      currentStatus,
      targetStatus,
      `Não é permitido transicionar diretamente de '${currentStatus}' para '${targetStatus}'.`,
    );
  }
}

/**
 * Converte horário HH:MM em minutos desde 00:00 para cálculos de sobreposição de slots.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Verifica se dois intervalos de horário se sobrepõem.
 */
export function isOverlapping(startA: string, durA: number, startB: string, durB: number): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = aStart + durA;
  const bStart = timeToMinutes(startB);
  const bEnd = bStart + durB;

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}
