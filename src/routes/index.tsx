import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FlaskConical,
  MessageCircle,
  Stethoscope,
  UserX,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AppointmentCard, type Action } from "@/components/AppointmentCard";
import { ScrollProgressHeart } from "@/components/ScrollProgressHeart";
import type { NovoAgendamentoDraft } from "@/components/NovoAgendamentoWizard";
import {
  HOJE_ISO,
  MEDICO,
  categoriaDe,
  fromISODate,
  getAgendaPorData,
  ordenarPorHorario,
  pacientes,
  statusInfo,
  toISODate,
  type Appointment,
  type AppointmentStatus,
  type CategoriaAtendimento,
  type Etiqueta,
  type EtiquetaCor,
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
  const [dataSelecionada, setDataSelecionada] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [extras, setExtras] = useState<Record<string, Appointment[]>>({});
  const [alteracoes, setAlteracoes] = useState<Record<string, Appointment>>({});
  const [notas, setNotas] = useState<Record<string, string[]>>({});
  const [etiquetas, setEtiquetas] = useState<Record<string, Etiqueta[]>>({});
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<CategoriaAtendimento | null>(null);

  const isoSelecionado = toISODate(dataSelecionada);

  // Ao abrir o sistema, a agenda começa sempre no dia atual da máquina.
  useEffect(() => {
    const hoje = new Date();
    if (toISODate(hoje) !== HOJE_ISO) setDataSelecionada(hoje);
  }, []);

  // Agenda do dia = base fictícia + criados na sessão + alterações de status,
  // sempre ordenada por horário.
  const agenda = useMemo(() => {
    const base = [...getAgendaPorData(isoSelecionado), ...(extras[isoSelecionado] ?? [])];
    return ordenarPorHorario(base.map((a) => alteracoes[a.id] ?? a));
  }, [isoSelecionado, extras, alteracoes]);

  useEffect(() => {
    setFiltro("todos");
  }, [isoSelecionado]);


  const confirmados = agenda.filter((a) => a.status === "confirmado" || a.status === "concluido").length;
  const recusados = agenda.filter((a) => a.pendencia === "recusado").length;
  const semResposta = agenda.filter((a) => a.pendencia === "sem_resposta").length;
  const falhas = agenda.filter((a) => a.pendencia === "falha_envio").length;
  const faltas = agenda.filter((a) => a.status === "falta").length;
  const total = agenda.length;

  const totalExames = agenda.filter((a) => categoriaDe(a.tipo) === "exame").length;
  const totalConsultas = agenda.filter((a) => categoriaDe(a.tipo) === "consulta").length;

  const visiveis = useMemo(
    () =>
      agenda.filter((a) => {
        if (categoria && categoriaDe(a.tipo) !== categoria) return false;
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
    [agenda, filtro, busca, categoria],
  );

function handleAction(appointment: Appointment, action: Action) {
    if (action.status) {
      setAlteracoes((atual) => ({
        ...atual,
        [appointment.id]: {
          ...appointment,
          status: action.status!,
          pendencia: undefined,
        },
      }));
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

  function handleNovoAgendamento(draft: NovoAgendamentoDraft) {
    // Registra paciente novo no cadastro (dados em memória).
    if (!pacientes.some((p) => p.id === draft.paciente.id)) {
      pacientes.push(draft.paciente);
    }

    const novo: Appointment = {
      id: `novo-${Date.now()}`,
      hora: draft.hora,
      duracaoMin: draft.duracaoMin,
      paciente: draft.paciente,
      tipo: draft.tipo,
      medico: MEDICO,
      status: "agendado",
    };

    const isoDraft = toISODate(draft.data);

    setExtras((atual) => ({
      ...atual,
      [isoDraft]: [...(atual[isoDraft] ?? []), novo],
    }));
    setFiltro("todos");
    setBusca("");
    setCategoria(null);

    // Se o agendamento é para outra data, navega até ela.
    if (isoDraft !== isoSelecionado) {
      setDataSelecionada(draft.data);
    }

    toast.success(`Agendamento criado — ${draft.paciente.nome.split(" ")[0]}`, {
      description: `${draft.tipo} · ${draft.hora} · ${statusInfo.agendado.rotulo}`,
    });
  }

  function addNota(id: string, texto: string) {
    setNotas((atual) => ({ ...atual, [id]: [...(atual[id] ?? []), texto] }));
    toast.success("Observação adicionada");
  }

  function removeNota(id: string, indice: number) {
    setNotas((atual) => ({
      ...atual,
      [id]: (atual[id] ?? []).filter((_, i) => i !== indice),
    }));
  }

  function addEtiqueta(id: string, texto: string, cor: EtiquetaCor) {
    const etiqueta: Etiqueta = { id: `et-${Date.now()}`, texto, cor };
    setEtiquetas((atual) => ({ ...atual, [id]: [...(atual[id] ?? []), etiqueta] }));
  }

  function removeEtiqueta(id: string, idEtiqueta: string) {
    setEtiquetas((atual) => ({
      ...atual,
      [id]: (atual[id] ?? []).filter((e) => e.id !== idEtiqueta),
    }));
  }



  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-amber/20">
<AppHeader
        selectedDate={dataSelecionada}
        onSelectDate={setDataSelecionada}
        onNovoAgendamento={handleNovoAgendamento}
      />
      <ScrollProgressHeart />

      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8">
        {/* Indicadores do dia — linha única */}
        <section
          aria-label="Indicadores do dia"
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {/* Agendamentos */}
          <div
            className="card-rise flex items-center gap-3 rounded-2xl border border-line2/60 bg-card px-4 py-3 shadow-sm"
            style={{ animationDelay: "50ms" }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amberdeep">
              <CalendarDays className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] uppercase tracking-widest text-inksoft/70">
                Agendamentos
              </div>
              <div className="text-xl font-bold leading-tight tracking-tighter tabular-nums">
                {total}
              </div>
            </div>
          </div>

          {/* Confirmados */}
          <div
            className="card-rise flex items-center gap-3 rounded-2xl border border-line2/60 bg-card px-4 py-3 shadow-sm"
            style={{ animationDelay: "100ms" }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ok/10 text-ok">
              <CheckCircle2 className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] uppercase tracking-widest text-inksoft/70">
                Confirmados
              </div>
              <div className="text-xl font-bold leading-tight tracking-tighter tabular-nums">
                {confirmados}
                <span className="ml-1 text-xs font-medium text-inksoft">/ {total}</span>
              </div>
            </div>
          </div>

          {/* Faltas */}
          <div
            className="card-rise flex items-center gap-3 rounded-2xl border border-line2/60 bg-card px-4 py-3 shadow-sm"
            style={{ animationDelay: "150ms" }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-bad/10 text-bad">
              <UserX className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] uppercase tracking-widest text-inksoft/70">
                Faltas
              </div>
              <div className="text-xl font-bold leading-tight tracking-tighter tabular-nums text-bad">
                {faltas}
              </div>
            </div>
          </div>

          {/* Entregas WhatsApp */}
          <div
            className="card-rise flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-paper shadow-md"
            style={{ animationDelay: "200ms" }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-paper/10 text-amber">
              <MessageCircle className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] uppercase tracking-widest opacity-60">
                WhatsApp
              </div>
              <div className="text-xl font-bold leading-tight tracking-tighter tabular-nums">
                90<span className="ml-0.5 text-xs opacity-60">%</span>
              </div>
            </div>
          </div>

          {/* Pendências */}
          <button
            type="button"
            onClick={() => setFiltro("aguardando")}
            title={`${recusados} recusado(s) · ${semResposta} sem resposta · ${falhas} falha(s) de envio — clique para ver os que aguardam`}
            className="card-rise flex items-center gap-3 rounded-2xl border border-amber/40 bg-cream px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-amber hover:shadow-md active:scale-[0.97]"
            style={{ animationDelay: "250ms" }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amberdeep">
              <AlertTriangle className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-amberdeep">
                Pendências
              </div>
              <div className="text-xl font-bold leading-tight tracking-tighter tabular-nums text-amberdeep">
                {recusados + semResposta + falhas}
              </div>
            </div>
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
              {"\n"}
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

        {/* Filtro por categoria — Exames × Consultas */}
        <section
          aria-label="Filtrar por tipo de atendimento"
          className="card-rise mb-6"
          style={{ animationDelay: "320ms" }}
        >
<div
            role="group"
            aria-label="Categoria"
            className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2"
          >
            <button
              type="button"
              aria-pressed={categoria === "exame"}
              onClick={() => setCategoria((c) => (c === "exame" ? null : "exame"))}
              className={`flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 active:scale-[0.97] ${
                categoria === "exame"
                  ? "border-ink bg-ink text-cream shadow-md"
                  : "border-line2 bg-card text-ink hover:border-amberdeep/40 hover:bg-amber/5"
              }`}
            >
              <FlaskConical
                className={`size-5 shrink-0 transition-colors ${
                  categoria === "exame" ? "text-amber" : "text-amberdeep"
                }`}
                aria-hidden
              />
              <span className="text-sm font-extrabold uppercase tracking-widest">Exames</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors ${
                  categoria === "exame"
                    ? "bg-amber/20 text-amber"
                    : "bg-amber/10 text-amberdeep"
                }`}
              >
                {totalExames} agendado{totalExames === 1 ? "" : "s"}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={categoria === "consulta"}
              onClick={() => setCategoria((c) => (c === "consulta" ? null : "consulta"))}
              className={`flex items-center justify-center gap-3 rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 active:scale-[0.97] ${
                categoria === "consulta"
                  ? "border-ink bg-ink text-cream shadow-md"
                  : "border-line2 bg-card text-ink hover:border-amberdeep/40 hover:bg-amber/5"
              }`}
            >
              <Stethoscope
                className={`size-5 shrink-0 transition-colors ${
                  categoria === "consulta" ? "text-amber" : "text-inksoft"
                }`}
                aria-hidden
              />
              <span className="text-sm font-extrabold uppercase tracking-widest">Consultas</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors ${
                  categoria === "consulta"
                    ? "bg-amber/20 text-amber"
                    : "bg-mutbg text-inksoft"
                }`}
              >
                {totalConsultas} agendado{totalConsultas === 1 ? "" : "s"}
              </span>
            </button>
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
              notas={notas[appointment.id] ?? []}
              etiquetas={etiquetas[appointment.id] ?? []}
              onAddNota={(texto) => addNota(appointment.id, texto)}
              onRemoveNota={(indice) => removeNota(appointment.id, indice)}
              onAddEtiqueta={(texto, cor) => addEtiqueta(appointment.id, texto, cor)}
              onRemoveEtiqueta={(idEtiqueta) => removeEtiqueta(appointment.id, idEtiqueta)}
            />
          ))}
          {visiveis.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line2 bg-card p-12 text-center">
              <p className="text-sm font-semibold text-inksoft">
                Nenhum agendamento para esse dia ou filtro.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFiltro("todos");
                  setBusca("");
                  setCategoria(null);
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
