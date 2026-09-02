import { Calendar, CalendarPlus, MessageCircle, Pencil, Search, Users, X } from "lucide-react";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { calcularIdade, type Patient } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export interface MobilePacientesViewProps {
  listaPacientes: Patient[];
  visiveis: Patient[];
  totalParticulares: number;
  totalConvenios: number;
  convenios: string[];
  busca: string;
  setBusca: (busca: string) => void;
  filtroConvenio: string;
  setFiltroConvenio: (filtro: string) => void;
  onAbrirEdicao: (paciente: Patient) => void;
  onAbrirAgendamento: (paciente: Patient) => void;
}

function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatarDataNascimento(data?: string): string | null {
  if (!data) return null;
  if (data.includes("-")) {
    const [y, m, d] = data.split("-");
    if (y && m && d) return `${d}/${m}/${y}`;
  }
  return data;
}

export function MobilePacientesView({
  listaPacientes,
  visiveis,
  convenios,
  busca,
  setBusca,
  filtroConvenio,
  setFiltroConvenio,
  onAbrirEdicao,
  onAbrirAgendamento,
}: MobilePacientesViewProps) {
  const conveniosScroll = useDragScroll<HTMLElement>();

  return (
    <div id="mobile-pacientes-root" className="pl-6 pr-3.5 py-4 pb-24 md:hidden">
      {/* Cabeçalho Mobile */}
      <div className="mb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft">
            Prontuários · Mobile
          </span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-ink">
          Pacientes ({visiveis.length})
        </h2>
      </div>

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
            placeholder="Buscar por nome ou plano..."
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

      {/* Filtro de Convênio Horizontal Mobile sem barra visível com clique e arraste */}
      <section
        id="mobile-convenios-filter"
        ref={conveniosScroll.ref}
        {...conveniosScroll.dragProps}
        className="mb-3 flex items-center gap-1.5 overflow-x-auto overflow-y-hidden pb-1 no-scrollbar touch-pan-x select-none active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => setFiltroConvenio("todos")}
          className={cn(
            "h-7 shrink-0 whitespace-nowrap rounded-lg px-2.5 font-mono text-[10px] font-bold uppercase transition-all active:scale-95",
            filtroConvenio === "todos"
              ? "bg-ink text-cream shadow-2xs"
              : "border border-line2/70 bg-card text-inksoft",
          )}
        >
          Todos ({listaPacientes.length})
        </button>
        {convenios.map((c) => {
          const count = listaPacientes.filter((p) => p.convenio === c).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFiltroConvenio(c)}
              className={cn(
                "h-7 shrink-0 whitespace-nowrap rounded-lg px-2.5 font-mono text-[10px] font-bold uppercase transition-all active:scale-95",
                filtroConvenio === c
                  ? "bg-amber text-ink font-bold shadow-2xs"
                  : "border border-line2/70 bg-card text-inksoft",
              )}
            >
              {c} ({count})
            </button>
          );
        })}
      </section>

      {/* Lista de Pacientes Mobile */}
      <section className="space-y-3" aria-label="Lista móvel de pacientes">
        {visiveis.map((p, i) => {
          const particular = p.convenio.toLowerCase().includes("particular");
          const idadeCalculada = calcularIdade(p.dataNascimento, p.idade);
          const dataFormatada = formatarDataNascimento(p.dataNascimento);
          const whatsappUrl = `https://wa.me/55${p.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
            `Olá ${p.nome.split(" ")[0]}, estamos entrando em contato da Agenda Cardio.`,
          )}`;

          return (
            <article
              key={p.id}
              className="rounded-2xl border border-line2/80 bg-card p-3.5 shadow-2xs transition-all active:scale-[0.99]"
              style={{ animationDelay: `${30 + i * 20}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-xs font-black text-cream">
                    {iniciais(p.nome)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-ink">{p.nome}</h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-inksoft">
                      <span>{idadeCalculada} anos</span>
                      {dataFormatada && (
                        <span className="inline-flex items-center gap-0.5">
                          · <Calendar className="size-2.5 text-amberdeep" /> {dataFormatada}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <BotaoCaneta onClick={() => onAbrirEdicao(p)} rotulo="Editar" className="size-7" />
              </div>

              {/* Detalhes do Convênio e Contato */}
              <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 text-xs">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.2 font-mono text-[9px] font-bold uppercase",
                    particular
                      ? "border border-amber/30 bg-amber/10 text-amberdeep"
                      : "border border-line2 bg-mutbg text-inksoft",
                  )}
                >
                  {p.convenio}
                </span>
                <span className="font-mono text-[11px] text-inksoft">{p.telefone}</span>
              </div>

              {p.observacoes && (
                <p className="mt-2 rounded-lg bg-amber/5 p-2 text-[11px] italic text-ink/80">
                  "{p.observacoes}"
                </p>
              )}

              {/* Botões de Ação Mobile */}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 items-center gap-1 rounded-xl border border-line2 bg-paper px-2.5 text-xs font-bold text-inksoft active:scale-95"
                >
                  <MessageCircle className="size-3.5 text-ok" />
                  <span>WhatsApp</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAbrirEdicao(p)}
                    className="flex h-8 items-center gap-1 rounded-xl border border-line2 bg-card px-2.5 text-xs font-bold text-inksoft active:scale-95"
                  >
                    <Pencil className="size-3 text-amberdeep" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAbrirAgendamento(p)}
                    className="flex h-8 items-center gap-1 rounded-xl bg-ink px-2.5 text-xs font-bold text-cream active:scale-95"
                  >
                    <CalendarPlus className="size-3 text-amber" />
                    <span>Agendar</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {visiveis.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line2 bg-card p-8 text-center">
          <Users className="mx-auto mb-2 size-6 text-inksoft/40" />
          <p className="text-xs font-bold text-ink">Nenhum paciente encontrado.</p>
        </div>
      )}
    </div>
  );
}
