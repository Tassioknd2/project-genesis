import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageCircle,
  Pencil,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import { calcularIdade, type Patient } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export interface DesktopPacientesViewProps {
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

export function DesktopPacientesView({
  listaPacientes,
  visiveis,
  totalParticulares,
  totalConvenios,
  convenios,
  busca,
  setBusca,
  filtroConvenio,
  setFiltroConvenio,
  onAbrirEdicao,
  onAbrirAgendamento,
}: DesktopPacientesViewProps) {
  return (
    <div id="desktop-pacientes-root" className="mx-auto max-w-[1240px] px-6 py-8 lg:px-8">
      {/* Resumo de Indicadores Desktop */}
      <section aria-label="Resumo cadastral" className="mb-8 grid grid-cols-4 gap-3.5">
        <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
            <Users className="size-4 text-amberdeep" />
            <span>Total Cadastrados</span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-ink">
            {listaPacientes.length}
          </div>
          <div className="mt-0.5 text-xs text-inksoft">Prontuários ativos na clínica</div>
        </div>

        <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-amberdeep">
            <UserCheck className="size-4" />
            <span>Particulares</span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-amberdeep">
            {totalParticulares}
          </div>
          <div className="mt-0.5 text-xs text-inksoft">Atendimentos diretos</div>
        </div>

        <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ok">
            <ShieldCheck className="size-4" />
            <span>Planos / Convênios</span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-ok">
            {totalConvenios}
          </div>
          <div className="mt-0.5 text-xs text-inksoft">
            {convenios.filter((c) => !c.toLowerCase().includes("particular")).length} operadoras
            credenciadas
          </div>
        </div>

        <div className="card-rise rounded-2xl bg-ink p-4 text-paper shadow-xs">
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-amber">
            <CheckCircle2 className="size-4" />
            <span>Base Atualizada</span>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-paper">100%</div>
          <div className="mt-0.5 text-xs text-paper/70">Com telefone & cadastro ativo</div>
        </div>
      </section>

      {/* Controles de Busca e Filtro de Convênio Desktop */}
      <section className="mb-6 space-y-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-ink">
              Central de Informações dos Pacientes · Desktop
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-inksoft">
              Mostrando {visiveis.length} de {listaPacientes.length} cadastros de pacientes
            </p>
          </div>

          <div className="relative w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-inksoft/60" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setBusca("");
              }}
              placeholder="Buscar por nome, telefone, plano ou anotação..."
              className={cn(
                "h-11 w-full rounded-2xl border border-line2 bg-card pl-11 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/50 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20",
                busca ? "pr-24" : "pr-4",
              )}
            />
            {busca && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Apagar tudo da busca"
                  title="Apagar tudo (ESC)"
                  onClick={() => setBusca("")}
                  className="flex h-7.5 items-center gap-1.5 rounded-xl border border-amber/50 bg-amber/15 px-2.5 font-mono text-[11px] font-bold text-amberdeep shadow-2xs transition-all hover:bg-amber hover:text-cream active:scale-95"
                >
                  <X className="size-3.5 stroke-[2.5]" />
                  <span>Limpar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filtros por Convênio Desktop */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line2/40 pb-4">
          <button
            type="button"
            onClick={() => setFiltroConvenio("todos")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all",
              filtroConvenio === "todos"
                ? "bg-ink text-cream shadow-2xs"
                : "border border-line2 bg-card text-inksoft hover:bg-paper",
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
                  "rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-all",
                  filtroConvenio === c
                    ? "bg-amber text-ink font-bold shadow-2xs"
                    : "border border-line2/70 bg-card text-inksoft hover:border-amber/40 hover:bg-paper",
                )}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Grade de Cartões Centralizados de Pacientes Desktop */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-3" aria-label="Lista de pacientes">
        {visiveis.map((p, i) => {
          const particular = p.convenio.toLowerCase().includes("particular");
          const idadeCalculada = calcularIdade(p.dataNascimento, p.idade);
          const dataFormatada = formatarDataNascimento(p.dataNascimento);
          const whatsappUrl = `https://wa.me/55${p.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
            `Olá ${p.nome.split(" ")[0]}, estamos entrando em contato da Agenda Cardio para acompanhamento clínico.`,
          )}`;

          return (
            <article
              key={p.id}
              className="card-rise group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line2/70 bg-card p-5 transition-all duration-200 hover:border-amber/50 hover:shadow-md"
              style={{ animationDelay: `${50 + i * 25}ms` }}
            >
              <div>
                {/* Cabeçalho do Card com Avatar, Informações e Botão da Caneta */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-xs font-black text-cream shadow-2xs">
                      {iniciais(p.nome)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-ink group-hover:text-amberdeep">
                        {p.nome}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-inksoft">
                          {idadeCalculada} {idadeCalculada === 1 ? "ano" : "anos"}
                        </span>
                        {dataFormatada && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-inksoft/80">
                            · <Calendar className="size-3 text-amberdeep" /> {dataFormatada}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <BotaoCaneta
                      onClick={() => onAbrirEdicao(p)}
                      rotulo="Editar dados"
                      className="border-line2/80 bg-paper/80"
                    />
                  </div>
                </div>

                {/* Informações Centrais do Indivíduo */}
                <div className="mt-4 space-y-2.5 border-t border-line/60 pt-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                      Convênio / Plano
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                        particular
                          ? "border border-amber/30 bg-amber/10 text-amberdeep"
                          : "border border-line2 bg-mutbg text-ink",
                      )}
                    >
                      {p.convenio}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                      Contato
                    </span>
                    <span className="font-mono text-xs font-medium text-ink">{p.telefone}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-inksoft">
                    <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                      <Clock className="size-3 text-amberdeep" />
                      <span>Última consulta</span>
                    </span>
                    <strong className="font-medium text-ink">
                      {p.ultimaVisita ?? "Primeiro atendimento"}
                    </strong>
                  </div>

                  {p.observacoes && (
                    <div className="mt-2 rounded-xl border border-amber/20 bg-amber/5 p-2.5 text-xs italic leading-relaxed text-ink/90">
                      <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-wider not-italic text-amberdeep">
                        Observação Clínica
                      </div>
                      "{p.observacoes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas do Paciente */}
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-line/60 pt-3.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Conversar via WhatsApp"
                  className="inline-flex h-8.5 items-center gap-1.5 rounded-xl border border-line2/80 bg-paper/80 px-3 text-xs font-bold text-inksoft transition-colors hover:border-ok/50 hover:text-ok active:scale-95"
                >
                  <MessageCircle className="size-3.5 text-ok" />
                  <span>WhatsApp</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAbrirEdicao(p)}
                    title="Editar cadastro do paciente"
                    className="inline-flex h-8.5 items-center gap-1.5 rounded-xl border border-line2 bg-card px-2.5 text-xs font-bold text-inksoft transition-colors hover:border-amber/40 hover:text-ink active:scale-95"
                  >
                    <Pencil className="size-3 text-amberdeep" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAbrirAgendamento(p)}
                    className="inline-flex h-8.5 items-center gap-1.5 rounded-xl bg-ink px-3 text-xs font-bold text-cream shadow-2xs transition-all hover:bg-ink/90 active:scale-95"
                  >
                    <CalendarPlus className="size-3.5 text-amber" />
                    <span>Agendar</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {visiveis.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line2 bg-card p-12 text-center shadow-2xs">
          <Users className="mx-auto mb-2 size-8 text-inksoft/40" />
          <p className="text-sm font-bold text-ink">Nenhum paciente encontrado.</p>
          <p className="mt-1 text-xs text-inksoft">
            Tente buscar com outro termo ou limpe os filtros de convênio.
          </p>
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setFiltroConvenio("todos");
            }}
            className="mt-4 rounded-xl border border-line2 bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:border-ink/40"
          >
            Limpar filtros de busca
          </button>
        </div>
      )}

      {/* Rodapé Desktop */}
      <footer className="mt-12 flex items-center justify-between border-t border-line2/40 py-8">
        <Link
          to="/agenda"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-inksoft transition-colors hover:text-amber"
        >
          ← Voltar à agenda do dia
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
          Agenda Cardio · Prontuário de Pacientes (Desktop)
        </span>
      </footer>
    </div>
  );
}
