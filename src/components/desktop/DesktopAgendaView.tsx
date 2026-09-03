import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FlaskConical,
  MessageCircle,
  Search,
  Stethoscope,
  UserX,
  X,
} from "lucide-react";
import { DesktopAppointmentCard, type Action } from "./DesktopAppointmentCard";
import type {
  Appointment,
  AppointmentStatus,
  CategoriaAtendimento,
  Etiqueta,
  EtiquetaCor,
} from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export type FiltroAgenda = "todos" | "pendencias" | AppointmentStatus;

const filtrosPrincipais: { id: FiltroAgenda; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "pendencias", rotulo: "Pendências" },
  { id: "confirmado", rotulo: "Confirmados" },
  { id: "aguardando", rotulo: "Aguardando" },
  { id: "falta", rotulo: "Faltas" },
  { id: "agendado", rotulo: "Agendados" },
];

export interface DesktopAgendaViewProps {
  dataSelecionada: Date;
  total: number;
  confirmados: number;
  faltas: number;
  taxaConfirmacao: number;
  totalPendencias: number;
  semResposta: number;
  recusados: number;
  totalExames: number;
  totalConsultas: number;
  filtro: FiltroAgenda;
  setFiltro: React.Dispatch<React.SetStateAction<FiltroAgenda>>;
  busca: string;
  setBusca: (busca: string) => void;
  categoria: CategoriaAtendimento | null;
  setCategoria: React.Dispatch<React.SetStateAction<CategoriaAtendimento | null>>;
  visiveis: Appointment[];
  notas: Record<string, string[]>;
  etiquetas: Record<string, Etiqueta[]>;
  onAction: (appointment: Appointment, action: Action) => void;
  onAddNota: (id: string, texto: string) => void;
  onRemoveNota: (id: string, indice: number) => void;
  onAddEtiqueta: (id: string, texto: string, cor: EtiquetaCor) => void;
  onRemoveEtiqueta: (id: string, idEtiqueta: string) => void;
  onEditar: (appointment: Appointment) => void;
  onRemarcar: (appointment: Appointment) => void;
  onAbrirWizard: () => void;
}

export function DesktopAgendaView({
  dataSelecionada: _dataSelecionada,
  total,
  confirmados,
  faltas,
  taxaConfirmacao,
  totalPendencias,
  semResposta,
  recusados,
  totalExames,
  totalConsultas,
  filtro,
  setFiltro,
  busca,
  setBusca,
  categoria,
  setCategoria,
  visiveis,
  notas,
  etiquetas,
  onAction,
  onAddNota,
  onRemoveNota,
  onAddEtiqueta,
  onRemoveEtiqueta,
  onEditar,
  onRemarcar,
  onAbrirWizard,
}: DesktopAgendaViewProps) {
  return (
    <div id="desktop-agenda-root" className="mx-auto max-w-[1240px] px-6 py-8 lg:px-8">
      {/* Indicadores do dia — Linha interativa Desktop */}
      <section
        aria-label="Indicadores do dia"
        className="mb-6 grid grid-cols-3 gap-3 lg:grid-cols-5"
      >
        {/* Total Agendamentos */}
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={cn(
            "card-rise flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
            filtro === "todos"
              ? "border-ink bg-card ring-1 ring-ink shadow-2xs"
              : "border-line2/70 bg-card hover:border-amber/40 shadow-2xs",
          )}
          style={{ animationDelay: "50ms" }}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amberdeep">
            <CalendarDays className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft">
              Total Dia
            </div>
            <div className="text-2xl font-black leading-tight tracking-tight tabular-nums text-ink">
              {total}
            </div>
          </div>
        </button>

        {/* Confirmados */}
        <button
          type="button"
          onClick={() => setFiltro(filtro === "confirmado" ? "todos" : "confirmado")}
          className={cn(
            "card-rise flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
            filtro === "confirmado"
              ? "border-ok bg-ok/5 ring-1 ring-ok shadow-2xs"
              : "border-line2/70 bg-card hover:border-ok/40 shadow-2xs",
          )}
          style={{ animationDelay: "100ms" }}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ok/10 text-ok">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-ok">
              Confirmados
            </div>
            <div className="text-2xl font-black leading-tight tracking-tight tabular-nums text-ok">
              {confirmados}
              <span className="ml-1 text-xs font-semibold text-inksoft">/ {total}</span>
            </div>
          </div>
        </button>

        {/* Faltas */}
        <button
          type="button"
          onClick={() => setFiltro(filtro === "falta" ? "todos" : "falta")}
          className={cn(
            "card-rise flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98]",
            filtro === "falta"
              ? "border-bad bg-bad/5 ring-1 ring-bad shadow-2xs"
              : "border-line2/70 bg-card hover:border-bad/40 shadow-2xs",
          )}
          style={{ animationDelay: "150ms" }}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bad/10 text-bad">
            <UserX className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-bad">
              Faltas
            </div>
            <div className="text-2xl font-black leading-tight tracking-tight tabular-nums text-bad">
              {faltas}
            </div>
          </div>
        </button>

        {/* Taxa de Confirmação WhatsApp */}
        <div
          className="card-rise flex items-center gap-3 rounded-2xl bg-ink p-4 text-paper shadow-xs"
          style={{ animationDelay: "200ms" }}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-paper/10 text-amber">
            <MessageCircle className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest opacity-70">
              Confirmação
            </div>
            <div className="text-2xl font-black leading-tight tracking-tight tabular-nums">
              {taxaConfirmacao}
              <span className="ml-0.5 text-xs opacity-70">%</span>
            </div>
          </div>
        </div>

        {/* Pendências */}
        <button
          type="button"
          onClick={() => setFiltro((prev) => (prev === "pendencias" ? "todos" : "pendencias"))}
          title={`${totalPendencias} pendência(s): ${semResposta} aguardando resposta · ${faltas} paciente(s) faltante(s) · ${recusados} recusa(s)`}
          className={cn(
            "card-rise flex items-center gap-3 rounded-2xl border p-4 text-left shadow-2xs transition-all duration-200 active:scale-[0.98]",
            filtro === "pendencias"
              ? "border-amber bg-amber/20 ring-2 ring-amber/50 shadow-xs"
              : "border-amber/40 bg-amber/5 hover:border-amber hover:bg-amber/10",
          )}
          style={{ animationDelay: "250ms" }}
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
              filtro === "pendencias"
                ? "bg-amber text-ink font-bold shadow-2xs"
                : "bg-amber/15 text-amberdeep",
            )}
          >
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate font-mono text-[9px] font-bold uppercase tracking-widest text-amberdeep">
              <span>Pendências</span>
              {filtro === "pendencias" && (
                <span className="rounded-full bg-amber px-1.5 py-0.2 text-[8px] font-black text-ink">
                  ATIVO
                </span>
              )}
            </div>
            <div className="text-2xl font-black leading-tight tracking-tight tabular-nums text-amberdeep">
              {totalPendencias}
            </div>
          </div>
        </button>
      </section>

      {/* Busca e filtros Desktop */}
      <section
        className="card-rise mb-6 flex flex-row items-stretch gap-3"
        style={{ animationDelay: "280ms" }}
        aria-label="Busca e filtros"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-inksoft/60" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setBusca("");
            }}
            placeholder="Buscar por paciente, tipo de atendimento ou convênio..."
            className={cn(
              "h-12 w-full rounded-2xl border border-line2 bg-card pl-11 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/50 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20",
              busca ? "pr-28" : "pr-4",
            )}
          />
          {busca && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Apagar tudo da busca"
                title="Apagar tudo (ESC)"
                onClick={() => setBusca("")}
                className="flex h-8 items-center gap-1.5 rounded-xl border border-amber/50 bg-amber/15 px-2.5 font-mono text-[11px] font-bold text-amberdeep shadow-2xs transition-all hover:bg-amber hover:text-cream active:scale-95"
              >
                <X className="size-3.5 stroke-[2.5]" />
                <span>Limpar</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl border border-line2 bg-card p-1.5">
          {filtrosPrincipais.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                "h-9 whitespace-nowrap rounded-xl px-3.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all",
                filtro === f.id ? "bg-ink text-cream shadow-2xs" : "text-inksoft hover:bg-paper",
              )}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </section>

      {/* Filtro por categoria Desktop — Exames × Consultas */}
      <section
        aria-label="Filtrar por tipo de atendimento"
        className="card-rise mb-6"
        style={{ animationDelay: "320ms" }}
      >
        <div role="group" aria-label="Categoria" className="grid grid-cols-2 gap-3">
<button
            type="button"
            aria-pressed={categoria === "consulta"}
            onClick={() => setCategoria((c) => (c === "consulta" ? null : "consulta"))}
            className={cn(
              "flex items-center justify-center gap-3 rounded-2xl border p-3.5 shadow-2xs transition-all duration-200 active:scale-[0.98]",
              categoria === "consulta"
                ? "border-ink bg-ink text-cream shadow-xs"
                : "border-line2 bg-card text-ink hover:border-amber/40 hover:bg-amber/5",
            )}
          >
            <Stethoscope
              className={cn(
                "size-4.5 shrink-0 transition-colors",
                categoria === "consulta" ? "text-amber" : "text-inksoft",
              )}
              aria-hidden
            />
            <span className="font-mono text-xs font-black uppercase tracking-wider">Consultas</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors",
                categoria === "consulta" ? "bg-amber/20 text-amber" : "bg-mutbg text-inksoft",
              )}
            >
              {totalConsultas} {totalConsultas === 1 ? "agendada" : "agendadas"}
            </span>
          </button>

          <button
            type="button"
            aria-pressed={categoria === "exame"}
            onClick={() => setCategoria((c) => (c === "exame" ? null : "exame"))}
            className={cn(
              "flex items-center justify-center gap-3 rounded-2xl border p-3.5 shadow-2xs transition-all duration-200 active:scale-[0.98]",
              categoria === "exame"
                ? "border-ink bg-ink text-cream shadow-xs"
                : "border-line2 bg-card text-ink hover:border-amber/40 hover:bg-amber/5",
            )}
          >
            <FlaskConical
              className={cn(
                "size-4.5 shrink-0 transition-colors",
                categoria === "exame" ? "text-amber" : "text-amberdeep",
              )}
              aria-hidden
            />
            <span className="font-mono text-xs font-black uppercase tracking-wider">Exames</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors",
                categoria === "exame" ? "bg-amber/20 text-amber" : "bg-amber/10 text-amberdeep",
              )}
            >
              {totalExames} {totalExames === 1 ? "agendado" : "agendados"}
            </span>
          </button>
        </div>
      </section>

      {/* Lista de agendamentos Desktop */}
      <section aria-label="Agenda do dia" className="space-y-3.5">
        {visiveis.map((appointment, i) => (
          <DesktopAppointmentCard
            key={appointment.id}
            appointment={appointment}
            index={i}
            onAction={onAction}
            notas={notas[appointment.id] ?? []}
            etiquetas={etiquetas[appointment.id] ?? []}
            onAddNota={(texto) => onAddNota(appointment.id, texto)}
            onRemoveNota={(indice) => onRemoveNota(appointment.id, indice)}
            onAddEtiqueta={(texto, cor) => onAddEtiqueta(appointment.id, texto, cor)}
            onRemoveEtiqueta={(idEtiqueta) => onRemoveEtiqueta(appointment.id, idEtiqueta)}
            onEditar={() => onEditar(appointment)}
            onRemarcar={() => onRemarcar(appointment)}
          />
        ))}

        {visiveis.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line2 bg-card p-12 text-center shadow-2xs">
            {filtro === "pendencias" ? (
              <>
                <CheckCircle2 className="mx-auto mb-2 size-8 text-ok" />
                <p className="text-sm font-bold text-ink">
                  Nenhuma pendência aberta para este dia!
                </p>
                <p className="mt-1 text-xs text-inksoft">
                  Todas as confirmações foram respondidas e não há faltas pendentes de remarcação.
                </p>
              </>
            ) : (
              <>
                <Clock className="mx-auto mb-2 size-8 text-inksoft/40" />
                <p className="text-sm font-bold text-ink">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </p>
                <p className="mt-1 text-xs text-inksoft">
                  Tente limpar os termos de busca ou selecionar outra data no cabeçalho.
                </p>
              </>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFiltro("todos");
                  setBusca("");
                  setCategoria(null);
                }}
                className="rounded-xl border border-line2 bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
              >
                Ver todos os agendamentos
              </button>
              <button
                type="button"
                onClick={onAbrirWizard}
                className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-2xs transition-all hover:bg-ink/90"
              >
                Criar Agendamento
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-12 flex items-center justify-between border-t border-line2/40 py-8">
        <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
          Clínica de Cardiologia · Dr. Carlos Mendes (CRM 123.456-SP)
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
          Agenda Cardio v2.0 (Desktop)
        </span>
      </footer>
    </div>
  );
}
