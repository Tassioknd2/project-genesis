import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FlaskConical,
  Search,
  Stethoscope,
  UserX,
  X,
} from "lucide-react";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { MobileAppointmentCard, type MobileAction } from "./MobileAppointmentCard";
import { MobileDateNavigator } from "./MobileDateNavigator";
import type {
  Appointment,
  AppointmentStatus,
  CategoriaAtendimento,
  Etiqueta,
} from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export type FiltroMobile = "todos" | "pendencias" | AppointmentStatus;

export interface MobileAgendaViewProps {
  dataSelecionada: Date;
  onSelectDate?: (date: Date) => void;
  total: number;
  confirmados: number;
  faltas: number;
  totalPendencias: number;
  totalExames: number;
  totalConsultas: number;
  filtro: FiltroMobile;
  setFiltro: React.Dispatch<React.SetStateAction<FiltroMobile>>;
  busca: string;
  setBusca: (busca: string) => void;
  categoria: CategoriaAtendimento | null;
  setCategoria: React.Dispatch<React.SetStateAction<CategoriaAtendimento | null>>;
  visiveis: Appointment[];
  notas: Record<string, string[]>;
  etiquetas: Record<string, Etiqueta[]>;
  onAction: (appointment: Appointment, action: MobileAction) => void;
  onEditar: (appointment: Appointment) => void;
  onRemarcar: (appointment: Appointment) => void;
  onAbrirWizard: () => void;
}

const filtrosMobileList: { id: FiltroMobile; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "pendencias", rotulo: "Pendências" },
  { id: "confirmado", rotulo: "Confirmados" },
  { id: "aguardando", rotulo: "Aguardando" },
  { id: "falta", rotulo: "Faltas" },
  { id: "agendado", rotulo: "Agendados" },
];

export function MobileAgendaView({
  dataSelecionada,
  onSelectDate,
  total,
  confirmados,
  faltas,
  totalPendencias,
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
  onEditar,
  onRemarcar,
  onAbrirWizard,
}: MobileAgendaViewProps) {
  const indicadoresScroll = useDragScroll<HTMLElement>();
  const filtrosScroll = useDragScroll<HTMLElement>();

  return (
    <div id="mobile-agenda-root" className="pl-6 pr-3.5 py-3 pb-24 md:hidden">
      {/* Navegador de Data da Agenda Centralizado (Substitui o antigo texto estático) */}
      {onSelectDate ? (
        <div className="mb-3.5">
          <MobileDateNavigator
            selectedDate={dataSelecionada}
            onSelectDate={onSelectDate}
            className="w-full"
          />
        </div>
      ) : null}

      {/* Indicadores Compactos em Carrossel Horizontal com arraste manual / clique e arrasto */}
      <section
        id="mobile-indicadores-carousel"
        aria-label="Indicadores mobile"
        ref={indicadoresScroll.ref}
        {...indicadoresScroll.dragProps}
        className="mb-3.5 flex gap-2 overflow-x-auto overflow-y-hidden pb-1 no-scrollbar touch-pan-x select-none active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border p-2.5 transition-all active:scale-95",
            filtro === "todos" ? "border-ink bg-card ring-1 ring-ink" : "border-line2/70 bg-card",
          )}
        >
          <CalendarDays className="size-4 text-amberdeep" />
          <div className="text-left">
            <div className="font-mono text-[8px] font-bold uppercase text-inksoft">Total</div>
            <div className="text-sm font-black text-ink">{total}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFiltro(filtro === "confirmado" ? "todos" : "confirmado")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border p-2.5 transition-all active:scale-95",
            filtro === "confirmado"
              ? "border-ok bg-ok/10 ring-1 ring-ok"
              : "border-line2/70 bg-card",
          )}
        >
          <CheckCircle2 className="size-4 text-ok" />
          <div className="text-left">
            <div className="font-mono text-[8px] font-bold uppercase text-ok">Confirmados</div>
            <div className="text-sm font-black text-ok">{confirmados}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFiltro((prev) => (prev === "pendencias" ? "todos" : "pendencias"))}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border p-2.5 transition-all active:scale-95",
            filtro === "pendencias"
              ? "border-amber bg-amber/20 ring-1 ring-amber"
              : "border-line2/70 bg-card",
          )}
        >
          <AlertTriangle className="size-4 text-amberdeep" />
          <div className="text-left">
            <div className="font-mono text-[8px] font-bold uppercase text-amberdeep">Pendentes</div>
            <div className="text-sm font-black text-amberdeep">{totalPendencias}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFiltro(filtro === "falta" ? "todos" : "falta")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border p-2.5 transition-all active:scale-95",
            filtro === "falta" ? "border-bad bg-bad/10 ring-1 ring-bad" : "border-line2/70 bg-card",
          )}
        >
          <UserX className="size-4 text-bad" />
          <div className="text-left">
            <div className="font-mono text-[8px] font-bold uppercase text-bad">Faltas</div>
            <div className="text-sm font-black text-bad">{faltas}</div>
          </div>
        </button>
      </section>

      {/* Busca Mobile */}
      <section className="mb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft/60" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setBusca("");
            }}
            placeholder="Buscar paciente, exame ou convênio..."
            className={cn(
              "h-10 w-full rounded-xl border border-line2 bg-card pl-9 text-xs font-medium text-ink shadow-2xs placeholder:text-inksoft/50 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20",
              busca ? "pr-22" : "pr-3",
            )}
          />
          {busca && (
            <button
              type="button"
              aria-label="Apagar tudo da busca"
              onClick={() => setBusca("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 items-center gap-1 rounded-lg border border-amber/50 bg-amber/15 px-2 font-mono text-[10px] font-bold text-amberdeep transition-all active:scale-90"
            >
              <X className="size-3 stroke-[2.5]" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </section>

      {/* Filtros em Pílulas com Scroll Horizontal e arraste manual sem barra visível */}
      <section
        id="mobile-filtros-pills"
        ref={filtrosScroll.ref}
        {...filtrosScroll.dragProps}
        className="mb-3 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden pb-1 no-scrollbar touch-pan-x select-none active:cursor-grabbing"
      >
        {filtrosMobileList.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={cn(
              "h-7 shrink-0 whitespace-nowrap rounded-lg px-2.5 font-mono text-[10px] font-bold uppercase transition-all active:scale-95",
              filtro === f.id
                ? "bg-ink text-cream shadow-2xs"
                : "border border-line2/70 bg-card text-inksoft",
            )}
          >
            {f.rotulo}
          </button>
        ))}
      </section>

      {/* Categoria Exames / Consultas Mobile */}
      <section className="mb-3.5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCategoria((c) => (c === "exame" ? null : "exame"))}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition-all",
            categoria === "exame"
              ? "border-ink bg-ink text-cream"
              : "border-line2 bg-card text-ink",
          )}
        >
          <FlaskConical className="size-3.5 text-amber" />
          <span>Exames ({totalExames})</span>
        </button>

        <button
          type="button"
          onClick={() => setCategoria((c) => (c === "consulta" ? null : "consulta"))}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition-all",
            categoria === "consulta"
              ? "border-ink bg-ink text-cream"
              : "border-line2 bg-card text-ink",
          )}
        >
          <Stethoscope className="size-3.5 text-amber" />
          <span>Consultas ({totalConsultas})</span>
        </button>
      </section>

      {/* Lista de Cards Mobile */}
      <section aria-label="Agenda do dia mobile" className="space-y-2.5">
        {visiveis.map((appointment, i) => (
          <MobileAppointmentCard
            key={appointment.id}
            appointment={appointment}
            index={i}
            onAction={onAction}
            notas={notas[appointment.id] ?? []}
            etiquetas={etiquetas[appointment.id] ?? []}
            onEditar={() => onEditar(appointment)}
            onRemarcar={() => onRemarcar(appointment)}
          />
        ))}

        {visiveis.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line2 bg-card p-8 text-center">
            <Clock className="mx-auto mb-2 size-6 text-inksoft/40" />
            <p className="text-xs font-bold text-ink">Nenhum agendamento encontrado.</p>
            <button
              type="button"
              onClick={onAbrirWizard}
              className="mt-3 inline-flex h-8 items-center justify-center rounded-xl bg-ink px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-cream"
            >
              Criar Agendamento
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
