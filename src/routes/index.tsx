import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Clock, X, Zap } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppointmentCard, type Action } from "@/components/AppointmentCard";
import {
  HOJE_ISO,
  fromISODate,
  getAgendaPorData,
  statusInfo,
  toISODate,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/agenda-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda Cardio — Agenda do dia" },
      {
        name: "description",
        content:
          "Painel da agenda diária da clínica de cardiologia: confirmações por WhatsApp, pendências e ações rápidas de agendamento.",
      },
      { property: "og:title", content: "Agenda Cardio — Agenda do dia" },
      {
        property: "og:description",
        content:
          "Confirmações por WhatsApp, pendências e controle da agenda do dia da clínica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgendaPage,
});

type Filtro = "todos" | AppointmentStatus;

const filtrosPrincipais: { id: Filtro; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "confirmado", rotulo: "Confirmados" },
  { id: "aguardando", rotulo: "Aguardando" },
  { id: "agendado", rotulo: "Agendados" },
  { id: "recusado", rotulo: "Recusados" },
];

function AgendaPage() {
  const [agenda, setAgenda] = useState<Appointment[]>(agendaDoDia);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");

  const confirmados = agenda.filter((a) => a.status === "confirmado" || a.status === "concluido").length;
  const recusados = agenda.filter((a) => a.pendencia === "recusado").length;
  const semResposta = agenda.filter((a) => a.pendencia === "sem_resposta").length;
  const falhas = agenda.filter((a) => a.pendencia === "falha_envio").length;
  const faltas = agenda.filter((a) => a.status === "falta").length;
  const total = agenda.length;

  const visiveis = useMemo(
    () =>
      agenda.filter((a) => {
        if (filtro !== "todos" && a.status !== filtro) return false;
        if (busca) {
          const q = busca.toLowerCase();
          return (
            a.paciente.nome.toLowerCase().includes(q) ||
            a.tipo.toLowerCase().includes(q) ||
            a.paciente.convenio.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [agenda, filtro, busca],
  );

  function handleAction(appointment: Appointment, action: Action) {
    if (action.status) {
      setAgenda((atual) =>
        atual.map((a) =>
          a.id === appointment.id
            ? {
                ...a,
                status: action.status!,
                pendencia: undefined,
              }
            : a,
        ),
      );
      toast.success(
        `${appointment.paciente.nome.split(" ")[0]} — ${action.label.toLowerCase()}`,
        {
          description: `Estado atualizado para "${statusInfo[action.status].rotulo}".`,
        },
      );
    } else {
      toast.info(`${action.label} — ${appointment.paciente.nome}`, {
        description: "Esta ação exige confirmação humana (disponível na versão conectada).",
      });
    }
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-amber/20">
      <AppHeader />

      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8">
        {/* Indicadores do dia */}
        <section
          aria-label="Indicadores do dia"
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <div className="card-rise rounded-2xl border border-line2/60 bg-card p-4 shadow-sm" style={{ animationDelay: "50ms" }}>
            <div className="mb-3 flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
                Agendamentos
              </span>
              <span className="mt-1 size-1.5 rounded-full bg-amber" />
            </div>
            <div className="text-3xl font-bold tracking-tighter">{total}</div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-tight text-ok">
              horários de 30 min
            </div>
          </div>

          <div className="card-rise rounded-2xl border border-line2/60 bg-card p-4 shadow-sm" style={{ animationDelay: "100ms" }}>
            <div className="mb-3 flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
                Confirmados
              </span>
              <span className="mt-1 size-1.5 rounded-full bg-ok" />
            </div>
            <div className="text-3xl font-bold tracking-tighter">
              {confirmados}
              <span className="ml-1 text-sm font-medium text-inksoft">/ {total}</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-line2/30">
              <div
                className="h-full rounded-full bg-ok"
                style={{ width: `${Math.round((confirmados / total) * 100)}%` }}
              />
            </div>
          </div>

          <div className="card-rise rounded-2xl border border-line2/60 bg-card p-4 shadow-sm" style={{ animationDelay: "150ms" }}>
            <div className="mb-3 flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
                Faltas
              </span>
              <span className="mt-1 size-1.5 rounded-full bg-bad" />
            </div>
            <div className="text-3xl font-bold tracking-tighter text-bad">{faltas}</div>
            <div className="mt-2 text-[10px] font-medium uppercase text-inksoft">
              {total ? Math.round((faltas / total) * 100) : 0}% do dia
            </div>
          </div>

          <div className="card-rise rounded-2xl bg-ink p-4 text-paper shadow-md" style={{ animationDelay: "200ms" }}>
            <div className="mb-3 flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                Entregas WhatsApp
              </span>
              <span className="mt-1 size-1.5 rounded-full bg-amber" />
            </div>
            <div className="text-3xl font-bold tracking-tighter">
              90<span className="ml-0.5 text-sm opacity-60">%</span>
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-80 underline underline-offset-4">
              {falhas} falha(s) visível(is)
            </div>
          </div>
        </section>

        {/* Faixa de pendências */}
        <section
          aria-label="Pendências"
          className="card-rise mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber/40 bg-cream px-3 py-2.5"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex shrink-0 items-center gap-2 pr-3">
            <AlertTriangle className="size-4 text-amber" aria-hidden />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amberdeep">
              Pendências
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFiltro("recusado")}
            className="flex items-center gap-2 rounded-lg border border-bad/30 bg-badbg/60 px-3 py-1.5 text-xs font-semibold text-bad transition-colors hover:bg-badbg"
          >
            <X className="size-3.5" aria-hidden /> {recusados} recusados
          </button>
          <button
            type="button"
            onClick={() => setFiltro("aguardando")}
            className="flex items-center gap-2 rounded-lg border border-warn/30 bg-warnbg/70 px-3 py-1.5 text-xs font-semibold text-warn transition-colors hover:bg-warnbg"
          >
            <Clock className="size-3.5" aria-hidden /> {semResposta} sem resposta
          </button>
          <button
            type="button"
            onClick={() => setFiltro("falha_envio")}
            className="flex items-center gap-2 rounded-lg border border-bad/30 bg-badbg/60 px-3 py-1.5 text-xs font-semibold text-bad transition-colors hover:bg-badbg"
          >
            <Zap className="size-3.5" aria-hidden /> {falhas} falha de envio
          </button>
          <button
            type="button"
            onClick={() => toast.info("Reenvio em lote disponível na versão conectada ao WhatsApp.")}
            className="ml-auto h-7 shrink-0 rounded-md px-2.5 text-[11px] font-bold uppercase tracking-wide text-amberdeep transition-colors hover:bg-amber/10"
          >
            Reenviar tudo
          </button>
        </section>

        {/* Busca e filtros */}
        <section
          className="card-rise mb-6 flex flex-col items-stretch gap-3 md:flex-row"
          style={{ animationDelay: "280ms" }}
          aria-label="Busca e filtros"
        >
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm italic text-inksoft/40">
              Buscar
            </span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Paciente, tipo de atendimento ou convênio..."
              className="h-14 w-full rounded-2xl border border-line2 bg-card pl-16 pr-6 text-sm font-medium shadow-sm transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-line2 bg-card p-1.5">
            {filtrosPrincipais.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={
                  filtro === f.id
                    ? "h-full whitespace-nowrap rounded-xl bg-ink px-4 text-[11px] font-bold uppercase tracking-wider text-cream"
                    : "h-full whitespace-nowrap rounded-xl px-4 text-[11px] font-bold uppercase tracking-wider text-inksoft transition-colors hover:bg-line/20"
                }
              >
                {f.rotulo}
              </button>
            ))}
          </div>
        </section>

        {/* Lista de agendamentos */}
        <section aria-label="Agenda do dia" className="space-y-3">
          {visiveis.map((appointment, i) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={i}
              onAction={handleAction}
            />
          ))}
          {visiveis.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line2 bg-card p-12 text-center">
              <p className="text-sm font-semibold text-inksoft">
                Nenhum agendamento encontrado para esse filtro.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFiltro("todos");
                  setBusca("");
                }}
                className="mt-3 text-xs font-bold uppercase tracking-wider text-amber hover:text-amberdeep"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>

        <footer className="mt-12 flex items-center justify-between border-t border-line2/30 py-8 opacity-60">
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Dados fictícios · sem conexão com banco
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Agenda Cardio MVP v1.0
          </span>
        </footer>
      </main>
    </div>
  );
}
