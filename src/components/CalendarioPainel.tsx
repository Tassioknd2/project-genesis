import { useMemo } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, RefreshCcw, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categoriaDe,
  fromISODate,
  toISODate,
  type Appointment,
} from "@/lib/agenda-data";

const DIAS_CURTOS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const DIAS_LONGOS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

/** Constrói a matriz de dias do mês (semana começando na segunda-feira). */
export function gridDoMes(mes: Date): Date[] {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const deslocamento = (primeiro.getDay() + 6) % 7; // segunda = 0
  const inicio = new Date(primeiro);
  inicio.setDate(primeiro.getDate() - deslocamento);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });
}

/** Faixa de carga (0 = livre, 3 = cheio) usada nas barras do calendário. */
export function nivelDeCarga(total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0;
  if (total <= 2) return 1;
  if (total <= 5) return 2;
  return 3;
}

const BARRA = ["bg-transparent", "bg-amber/25", "bg-amber/60", "bg-amberdeep"] as const;

interface CalendarioPainelProps {
  mes: Date;
  onMesChange: (mes: Date) => void;
  selecionada: Date;
  onSelecionar: (data: Date) => void;
  hojeISO: string;
  agendaDoDia: (iso: string) => Appointment[];
  onAbrirVisaoMes: () => void;
  onIrParaHoje: () => void;
}

export function CalendarioPainel({
  mes,
  onMesChange,
  selecionada,
  onSelecionar,
  hojeISO,
  agendaDoDia,
  onAbrirVisaoMes,
  onIrParaHoje,
}: CalendarioPainelProps) {
  const dias = useMemo(() => gridDoMes(mes), [mes]);
  const contagens = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const d of dias) {
      const iso = toISODate(d);
      mapa[iso] = agendaDoDia(iso).length;
    }
    return mapa;
  }, [dias, agendaDoDia]);

  const isoSelecionado = toISODate(selecionada);
  const listaDoDia = useMemo(
    () => agendaDoDia(isoSelecionado).slice().sort((a, b) => a.hora.localeCompare(b.hora)),
    [isoSelecionado, agendaDoDia],
  );

  const consultas = listaDoDia.filter((a) => categoriaDe(a.tipo) === "consulta").length;
  const exames = listaDoDia.length - consultas;

  function trocarMes(delta: number) {
    onMesChange(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));
  }

  return (
    <div className="w-[min(92vw,780px)]">
      <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
        {/* Calendário do mês */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => trocarMes(-1)}
              className="flex size-7 items-center justify-center rounded-lg border border-line2 bg-card text-inksoft transition-colors hover:border-amber/50 hover:text-amberdeep active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-ink">
              {MESES[mes.getMonth()]} {mes.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => trocarMes(1)}
              className="flex size-7 items-center justify-center rounded-lg border border-line2 bg-card text-inksoft transition-colors hover:border-amber/50 hover:text-amberdeep active:scale-95"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px rounded-lg border border-line2/70 bg-line2/40 p-px">
            {DIAS_CURTOS.map((d) => (
              <div
                key={d}
                className="bg-card py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft"
              >
                {d}
              </div>
            ))}
            {dias.map((d) => {
              const iso = toISODate(d);
              const doMes = d.getMonth() === mes.getMonth();
              const total = contagens[iso] ?? 0;
              const nivel = nivelDeCarga(total);
              const sel = iso === isoSelecionado;
              const hoje = iso === hojeISO;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onSelecionar(d)}
                  aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}, ${total} agendamentos`}
                  aria-current={sel ? "date" : undefined}
                  className={cn(
                    "group relative flex h-[52px] flex-col items-center justify-center gap-1 bg-card transition-all duration-150",
                    doMes ? "text-ink" : "text-inksoft/45",
                    !sel && "hover:bg-paper",
                    sel && "bg-ink text-cream",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[12px] font-bold leading-none",
                      hoje && !sel && "text-amberdeep",
                    )}
                  >
                    {String(d.getDate()).padStart(2, "0")}
                  </span>
                  {total > 0 && (
                    <span
                      className={cn(
                        "rounded px-1 font-mono text-[9px] font-bold leading-tight",
                        sel ? "bg-cream/15 text-cream" : "bg-mutbg text-inksoft",
                      )}
                    >
                      {total}
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-1 h-[3px] rounded-full transition-all",
                      sel ? "bg-amber" : BARRA[nivel],
                      !doMes && "opacity-40",
                    )}
                  />
                  {hoje && (
                    <span className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-amber" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-inksoft">
            <span>Carga</span>
            <span className="h-[3px] w-5 rounded-full bg-amber/25" />
            <span>1-2</span>
            <span className="h-[3px] w-5 rounded-full bg-amber/60" />
            <span>3-5</span>
            <span className="h-[3px] w-5 rounded-full bg-amberdeep" />
            <span>6+</span>
          </div>
        </div>

        {/* Prévia do dia selecionado */}
        <div className="border-t border-line2/60 p-4 md:border-l md:border-t-0">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink">
              {DIAS_LONGOS[selecionada.getDay()]}, {selecionada.getDate()}{" "}
              {MESES[selecionada.getMonth()]?.slice(0, 3).toUpperCase()}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-inksoft">
              {listaDoDia.length} atend.
            </span>
          </div>

          <div className="max-h-[220px] space-y-px overflow-y-auto pr-1">
            {listaDoDia.length === 0 && (
              <p className="rounded-lg border border-dashed border-line2 px-3 py-6 text-center font-mono text-[10px] uppercase tracking-widest text-inksoft">
                Nenhum atendimento
              </p>
            )}
            {listaDoDia.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 border-b border-dashed border-line2/60 py-1.5 last:border-0"
              >
                <span className="font-mono text-[11px] font-bold text-amberdeep">{a.hora}</span>
                <span className="flex-1 truncate text-[12px] font-semibold text-ink">
                  {a.paciente.nome}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-inksoft">
                  {categoriaDe(a.tipo) === "exame" ? "EXA" : "CON"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line2/60 pt-3">
            {[
              { icone: CalendarRange, valor: listaDoDia.length, rotulo: "Total" },
              { icone: Stethoscope, valor: consultas, rotulo: "Consultas" },
              { icone: Users, valor: exames, rotulo: "Exames" },
            ].map(({ icone: Icone, valor, rotulo }) => (
              <div key={rotulo} className="flex items-center gap-2">
                <Icone className="size-3.5 text-amber" />
                <div className="leading-none">
                  <div className="font-mono text-[13px] font-black text-ink">{valor}</div>
                  <div className="font-mono text-[8px] uppercase tracking-widest text-inksoft">
                    {rotulo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé de ações */}
      <div className="flex items-center justify-between gap-3 border-t border-line2/60 px-4 py-3">
        <button
          type="button"
          onClick={onAbrirVisaoMes}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-widest text-cream shadow-sm transition-all hover:brightness-105 active:scale-[0.98] sm:flex-none sm:px-6"
        >
          <CalendarRange className="size-4" />
          Visão do mês
        </button>
        <button
          type="button"
          onClick={onIrParaHoje}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amberdeep transition-colors hover:bg-amber/10"
        >
          <RefreshCcw className="size-3" />
          Ir para hoje
        </button>
      </div>
    </div>
  );
}

export { MESES, DIAS_LONGOS, fromISODate };
