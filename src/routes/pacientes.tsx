import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  HeartPulse,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import {
  EditarRegistroDialog,
  type EdicaoResultado,
} from "@/components/EditarRegistroDialog";
import {
  NovoAgendamentoWizard,
  type NovoAgendamentoDraft,
} from "@/components/NovoAgendamentoWizard";
import { calcularIdade, pacientes, type Patient } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Agenda Cardio — Cadastro de Pacientes" },
      {
        name: "description",
        content:
          "Diretório clínico de pacientes: histórico de atendimentos, planos de saúde, contatos diretos por WhatsApp e agendamento instantâneo.",
      },
      { property: "og:title", content: "Agenda Cardio — Pacientes" },
      {
        property: "og:description",
        content: "Cadastro e gestão de pacientes da clínica de cardiologia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PacientesPage,
});

function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!)
    .join("")
    .toUpperCase();
}

function PacientesPage() {
  const [busca, setBusca] = useState("");
  const [filtroConvenio, setFiltroConvenio] = useState<string>("todos");
  const [pacienteParaAgendar, setPacienteParaAgendar] = useState<Patient | null>(null);
  const [wizardAberto, setWizardAberto] = useState(false);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<Patient | null>(null);
  const [versao, setVersao] = useState(0);

  const convenios = useMemo(() => {
    const set = new Set<string>();
    pacientes.forEach((p) => {
      if (p.convenio) set.add(p.convenio);
    });
    return Array.from(set);
  }, []);

  const visiveis = useMemo(() => {
    return pacientes.filter((p) => {
      if (filtroConvenio !== "todos" && p.convenio !== filtroConvenio) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return (
          p.nome.toLowerCase().includes(q) ||
          p.telefone.includes(q) ||
          p.convenio.toLowerCase().includes(q) ||
          (p.observacoes && p.observacoes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [busca, filtroConvenio]);

  const totalParticulares = pacientes.filter((p) =>
    p.convenio.toLowerCase().includes("particular"),
  ).length;
  const totalConvenios = pacientes.length - totalParticulares;

  function abrirAgendamento(p: Patient) {
    setPacienteParaAgendar(p);
    setWizardAberto(true);
  }

  function handleSalvarDraft(draft: NovoAgendamentoDraft) {
    toast.success(`Agendamento realizado para ${draft.paciente.nome}`, {
      description: `${draft.tipo} agendado às ${draft.hora}.`,
    });
    setWizardAberto(false);
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-amber/20">
      <AppHeader />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner de Estatísticas da Base */}
        <section
          aria-label="Indicadores da Base de Pacientes"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
              <Users className="size-4 text-amberdeep" />
              <span>Total Cadastrados</span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-ink">
              {pacientes.length}
            </div>
            <div className="mt-0.5 text-xs text-inksoft">Registros ativos na clínica</div>
          </div>

          <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-amberdeep">
              <UserCheck className="size-4 text-amber" />
              <span>Particulares</span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-amberdeep">
              {totalParticulares}
            </div>
            <div className="mt-0.5 text-xs text-inksoft">Atendimentos diretos</div>
          </div>

          <div className="card-rise rounded-2xl border border-line2/70 bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
              <ShieldCheck className="size-4 text-ok" />
              <span>Convênios</span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-ink">
              {totalConvenios}
            </div>
            <div className="mt-0.5 text-xs text-inksoft">Planos credenciados</div>
          </div>

          <div className="card-rise rounded-2xl border border-ok/30 bg-ok/5 p-4 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ok">
              <CheckCircle2 className="size-4 text-ok" />
              <span>WhatsApp Ativo</span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight tabular-nums text-ok">100%</div>
            <div className="mt-0.5 text-xs text-inksoft">Com número verificado</div>
          </div>
        </section>

        {/* Barra de Busca e Filtro por Convênio */}
        <section className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-ink">
                Diretório de Pacientes
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-wider text-inksoft">
                Mostrando {visiveis.length} de {pacientes.length} pacientes
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-inksoft/60" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome, telefone ou plano..."
                className="h-11 w-full rounded-2xl border border-line2 bg-card pl-11 pr-9 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/50 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
              />
              {busca && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-inksoft/60 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chips de filtro por convênio */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setFiltroConvenio("todos")}
              className={cn(
                "rounded-xl px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-all",
                filtroConvenio === "todos"
                  ? "bg-ink text-cream shadow-2xs"
                  : "border border-line2 bg-card text-inksoft hover:bg-paper",
              )}
            >
              Todos ({pacientes.length})
            </button>
            {convenios.map((c) => {
              const count = pacientes.filter((p) => p.convenio === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFiltroConvenio(c)}
                  className={cn(
                    "rounded-xl px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-all",
                    filtroConvenio === c
                      ? "bg-ink text-cream shadow-2xs"
                      : "border border-line2 bg-card text-inksoft hover:bg-paper",
                  )}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Grade de Pacientes */}
        <section
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Lista de pacientes"
        >
          {visiveis.map((p, i) => {
            const particular = p.convenio.toLowerCase().includes("particular");
            const idadeCalculada = calcularIdade(p.dataNascimento, p.idade);
            const whatsappUrl = `https://wa.me/55${p.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Olá ${p.nome.split(" ")[0]}, estamos entrando em contato da Agenda Cardio para confirmar seu acompanhamento clínico.`,
            )}`;

            return (
              <article
                key={p.id}
                className="card-rise group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line2/70 bg-card p-5 transition-all duration-200 hover:border-amber/40 hover:shadow-md"
                style={{ animationDelay: `${50 + i * 25}ms` }}
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-xs font-bold text-cream">
                        {iniciais(p.nome)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-ink">{p.nome}</h3>
                        <p className="font-mono text-[11px] text-inksoft">
                          {idadeCalculada} {idadeCalculada === 1 ? "ano" : "anos"} · {p.telefone}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                        particular
                          ? "border border-amber/30 bg-amber/10 text-amberdeep"
                          : "border border-line2 bg-mutbg text-inksoft",
                      )}
                    >
                      {p.convenio}
                    </span>
                  </div>

                  {/* Informações Clínicas */}
                  <div className="mt-3.5 space-y-2 border-t border-line/60 pt-3">
                    <div className="flex items-center gap-2 text-xs text-inksoft">
                      <Clock className="size-3.5 text-amberdeep" />
                      <span>
                        Última consulta:{" "}
                        <strong className="font-semibold text-ink">
                          {p.ultimaVisita ?? "Primeiro atendimento"}
                        </strong>
                      </span>
                    </div>

                    {p.observacoes && (
                      <div className="rounded-xl border border-line/80 bg-paper/60 p-2.5 text-xs italic leading-relaxed text-ink/80">
                        {p.observacoes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas de Atendimento */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Conversar via WhatsApp"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line2 bg-paper/60 px-2.5 text-xs font-bold text-inksoft transition-colors hover:border-ok/50 hover:text-ok active:scale-95"
                  >
                    <MessageCircle className="size-3.5 text-ok" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => abrirAgendamento(p)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-bold text-cream shadow-2xs transition-all hover:bg-ink/90 active:scale-95"
                  >
                    <CalendarPlus className="size-3.5 text-amber" />
                    <span>Agendar</span>
                  </button>
                </div>
              </article>
            );
          })}

          {visiveis.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-line2 bg-card p-12 text-center">
              <HeartPulse className="mx-auto mb-2 size-8 text-inksoft/40" />
              <p className="text-sm font-bold text-ink">Nenhum paciente encontrado.</p>
              <p className="mt-1 text-xs text-inksoft">
                Tente ajustar os termos da busca ou selecionar outro convênio.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBusca("");
                  setFiltroConvenio("todos");
                }}
                className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-amber hover:text-amberdeep"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        <footer className="mt-12 flex items-center justify-between border-t border-line2/40 py-8">
          <Link
            to="/"
            className="font-mono text-xs font-bold uppercase tracking-wider text-inksoft transition-colors hover:text-amber"
          >
            ← Voltar à agenda do dia
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/60">
            Agenda Cardio · Pacientes
          </span>
        </footer>
      </main>

      <NovoAgendamentoWizard
        open={wizardAberto}
        onOpenChange={setWizardAberto}
        pacienteInicial={pacienteParaAgendar}
        onSalvar={handleSalvarDraft}
      />
    </div>
  );
}
