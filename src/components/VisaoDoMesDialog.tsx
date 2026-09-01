import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Search,
  UserX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { gridDoMes, MESES } from "@/components/CalendarioPainel";
import { categoriaDe, toISODate, type Appointment } from "@/lib/agenda-data";

type FiltroMes = "todos" | "pendencias" | "nao_confirmados" | "faltas";

const FILTROS: { id: FiltroMes; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "pendencias", rotulo: "Pendências" },
  { id: "nao_confirmados", rotulo: "Não confirmados" },
  { id: "faltas", rotulo: "Faltas e cancelados" },
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

interface VisaoDoMesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mes: Date;
  onMesChange: (mes: Date) => void;
  selecionada: Date;
  onSelecionarDia: (data: Date) => void;
  hojeISO: string;
  agendaDoDia: (iso: string) => Appointment[];
}

export function VisaoDoMesDialog({
  open,
  onOpenChange,
  mes,
  onMesChange,
  selecionada,
  onSelecionarDia,
  hojeISO,
  agendaDoDia,
}: VisaoDoMesDialogProps) {
  const [filtro, setFiltro] = useState<FiltroMes>("todos");
  const [busca, setBusca] = useState("");

  const diasDoMes = useMemo(
    () => gridDoMes(mes).filter((d) => d.getMonth() === mes.getMonth()),
    [mes],
  );

  const agendaMes = useMemo(
    () =>
      diasDoMes.map((d) => {
        const iso = toISODate(d);
        return {
          data: d,
          iso,
          itens: agendaDoDia(iso).slice().sort((a, b) => a.hora.localeCompare(b.hora)),
        };
      }),
    [diasDoMes, agendaDoDia],
  );

  const resumo = useMemo(() => {
    let total = 0;
    let pendencias = 0;
    let faltas = 0;
    let livres = 0;
    for (const dia of agendaMes) {
      total += dia.itens.length;
      if (dia.itens.length === 0 && dia.data.getDay() !== 0) livres += 1;
      for (const a of dia.itens) {
        if (a.pendencia) pendencias += 1;
        if (a.status === "falta" || a.status === "recusado") faltas += 1;
      }
    }
    return { total, pendencias, faltas, livres };
  }, [agendaMes]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return agendaMes
      .map((dia) => ({
        ...dia,
        itens: dia.itens.filter((a) => {
          if (termo && !a.paciente.nome.toLowerCase().includes(termo)) return false;
          if (filtro === "pendencias") return Boolean(a.pendencia);
          if (filtro === "nao_confirmados")
            return a.status === "agendado" || a.status === "aguardando" || a.status === "falha_envio";
          if (filtro === "faltas") return a.status === "falta" || a.status === "recusado";
          return true;
        }),
      }))
      .filter((dia) => dia.itens.length > 0 || (filtro === "todos" && !termo));
  }, [agendaMes, filtro, busca]);

  function trocarMes(delta: number) {
    onMesChange(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-[900px] overflow-hidden p-0">
        <DialogHeader className="border-b border-line2/60 px-5 pb-4 pt-5 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-ink">
                <CalendarRange className="size-4 text-amber" />
                Visão do mês
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                Agenda completa · clique em um dia para abrir o painel
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Mês anterior"
                onClick={() => trocarMes(-1)}
                className="flex size-8 items-center justify-center rounded-lg border border-line2 bg-card text-inksoft hover:border-amber/50 hover:text-amberdeep active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-[130px] text-center font-mono text-xs font-black uppercase tracking-widest text-ink">
                {MESES[mes.getMonth()]} {mes.getFullYear()}
              </span>
              <button
                type="button"
                aria-label="Próximo mês"
                onClick={() => trocarMes(1)}
                className="flex size-8 items-center justify-center rounded-lg border border-line2 bg-card text-inksoft hover:border-amber/50 hover:text-amberdeep active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Resumo do mês */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { rotulo: "Atendimentos", valor: resumo.total, icone: CalendarRange },
              { rotulo: "Pendências", valor: resumo.pendencias, icone: AlertTriangle },
              { rotulo: "Faltas/cancel.", valor: resumo.faltas, icone: UserX },
              { rotulo: "Dias livres", valor: resumo.livres, icone: CalendarRange },
            ].map(({ rotulo, valor, icone: Icone }) => (
              <div
                key={rotulo}
                className="flex items-center gap-2 rounded-xl border border-line2 bg-card px-3 py-2 shadow-2xs"
              >
                <Icone className="size-3.5 text-amber" />
                <div className="leading-none">
                  <div className="font-mono text-sm font-black text-ink">{valor}</div>
                  <div className="font-mono text-[8px] uppercase tracking-widest text-inksoft">
                    {rotulo}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Busca e filtros */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-inksoft" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar paciente no mês"
                className="h-9 w-full rounded-xl border border-line2 bg-card pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-inksoft focus:border-amber/60"
              />
            </div>
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95",
                  filtro === f.id
                    ? "border-transparent bg-ink text-cream shadow-xs"
                    : "border-line2 bg-card text-inksoft hover:border-amber/50 hover:text-amberdeep",
                )}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto px-5 pb-5">
          {listaFiltrada.length === 0 && (
            <p className="rounded-xl border border-dashed border-line2 px-4 py-10 text-center font-mono text-[11px] uppercase tracking-widest text-inksoft">
              Nada encontrado com esse filtro
            </p>
          )}

          {listaFiltrada.map((dia) => {
            const sel = dia.iso === toISODate(selecionada);
            const hoje = dia.iso === hojeISO;
            return (
              <section key={dia.iso} className="border-b border-line2/50 py-3 last:border-0">
                <button
                  type="button"
                  onClick={() => {
                    onSelecionarDia(dia.data);
                    onOpenChange(false);
                  }}
                  className="group mb-1.5 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-paper"
                >
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg font-mono text-xs font-black",
                      sel ? "bg-ink text-cream" : "bg-mutbg text-ink",
                      hoje && !sel && "ring-1 ring-amber",
                    )}
                  >
                    {String(dia.data.getDate()).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    {DIAS_LONGOS[dia.data.getDay()]}
                  </span>
                  {hoje && (
                    <span className="rounded-md bg-amber/15 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-amberdeep">
                      Hoje
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-inksoft opacity-0 transition-opacity group-hover:opacity-100">
                    Abrir dia
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                    {dia.itens.length} atend.
                  </span>
                </button>

                {dia.itens.length === 0 ? (
                  <p className="pl-10 font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
                    Dia livre
                  </p>
                ) : (
                  <ul className="space-y-px pl-10">
                    {dia.itens.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-center gap-2 border-b border-dashed border-line2/50 py-1.5 last:border-0"
                      >
                        <span className="font-mono text-[11px] font-bold text-amberdeep">
                          {a.hora}
                        </span>
                        <span className="min-w-[140px] flex-1 truncate text-[13px] font-semibold text-ink">
                          {a.paciente.nome}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-inksoft">
                          {categoriaDe(a.tipo) === "exame" ? "Exame" : "Consulta"}
                        </span>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
