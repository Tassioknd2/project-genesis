import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { AppHeader } from "@/components/AppHeader";
import { AppointmentCard, type Action } from "@/components/AppointmentCard";
import { EditarRegistroDialog, type EdicaoResultado } from "@/components/EditarRegistroDialog";
import { ScrollProgressHeart } from "@/components/ScrollProgressHeart";
import {
  NovoAgendamentoWizard,
  type NovoAgendamentoDraft,
} from "@/components/NovoAgendamentoWizard";
import {
  RemarcarAgendamentoDialog,
  type RemarcacaoResultado,
} from "@/components/RemarcarAgendamentoDialog";
import {
  HOJE_ISO,
  MEDICO,
  categoriaDe,
  formatarTipos,
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
import { cn } from "@/lib/utils";

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
        content: "Confirmações por WhatsApp, pendências e controle da agenda do dia da clínica.",
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
  const [removidos, setRemovidos] = useState<Record<string, string[]>>({});
  const [alteracoes, setAlteracoes] = useState<Record<string, Appointment>>({});
  const [notas, setNotas] = useState<Record<string, string[]>>({});
  const [etiquetas, setEtiquetas] = useState<Record<string, Etiqueta[]>>({});
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<CategoriaAtendimento | null>(null);
  const [editando, setEditando] = useState<Appointment | null>(null);
  const [remarcando, setRemarcando] = useState<Appointment | null>(null);
  const [wizardAberto, setWizardAberto] = useState(false);

  const isoSelecionado = toISODate(dataSelecionada);

  // Ao abrir o sistema, a agenda começa sempre no dia atual da máquina.
  useEffect(() => {
    const hoje = new Date();
    if (toISODate(hoje) !== HOJE_ISO) setDataSelecionada(hoje);
  }, []);

  // Agenda de qualquer data = base fictícia + criados na sessão - remarcados + alterações.
  const resolverAgenda = useCallback(
    (iso: string) => {
      const base = [...getAgendaPorData(iso), ...(extras[iso] ?? [])];
      const filtrados = base.filter((a) => !(removidos[iso] ?? []).includes(a.id));
      return ordenarPorHorario(filtrados.map((a) => alteracoes[a.id] ?? a));
    },
    [extras, alteracoes, removidos],
  );

  const agenda = useMemo(
    () => resolverAgenda(isoSelecionado),
    [isoSelecionado, resolverAgenda],
  );


  useEffect(() => {
    setFiltro("todos");
  }, [isoSelecionado]);

  const confirmados = agenda.filter(
    (a) => a.status === "confirmado" || a.status === "concluido",
  ).length;
  const recusados = agenda.filter((a) => a.pendencia === "recusado").length;
  const semResposta = agenda.filter((a) => a.pendencia === "sem_resposta").length;
  const falhas = agenda.filter((a) => a.pendencia === "falha_envio").length;
  const faltas = agenda.filter((a) => a.status === "falta").length;
  const total = agenda.length;

  const totalExames = agenda.filter((a) => {
    if (a.tipos && a.tipos.length > 0) return a.tipos.some((t) => categoriaDe(t) === "exame");
    return categoriaDe(a.tipo) === "exame";
  }).length;
  const totalConsultas = agenda.filter((a) => {
    if (a.tipos && a.tipos.length > 0) return a.tipos.some((t) => categoriaDe(t) === "consulta");
    return categoriaDe(a.tipo) === "consulta";
  }).length;

  const taxaConfirmacao = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  const visiveis = useMemo(
    () =>
      agenda.filter((a) => {
        if (categoria) {
          const matchCat =
            a.tipos && a.tipos.length > 0
              ? a.tipos.some((t) => categoriaDe(t) === categoria)
              : categoriaDe(a.tipo) === categoria;
          if (!matchCat) return false;
        }
        if (filtro !== "todos" && a.status !== filtro) return false;
        if (busca) {
          const q = busca.toLowerCase();
          const matchTipo =
            a.tipo.toLowerCase().includes(q) ||
            (a.tipos && a.tipos.some((t) => t.toLowerCase().includes(q)));
          return (
            a.paciente.nome.toLowerCase().includes(q) ||
            matchTipo ||
            a.paciente.convenio.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [agenda, filtro, busca, categoria],
  );

  function handleAction(appointment: Appointment, action: Action) {
    if (action.status === "remarcado" || action.label.toLowerCase().includes("remarcar")) {
      setRemarcando(appointment);
      return;
    }

    if (action.status) {
      setAlteracoes((atual) => ({
        ...atual,
        [appointment.id]: {
          ...appointment,
          status: action.status!,
          pendencia: undefined,
        },
      }));
      toast.success(`${appointment.paciente.nome.split(" ")[0]} — ${action.label.toLowerCase()}`, {
        description: `Estado atualizado para "${statusInfo[action.status].rotulo}".`,
      });
    } else {
      toast.info(`${action.label} — ${appointment.paciente.nome}`, {
        description: "Esta ação exige confirmação humana (disponível na versão conectada).",
      });
    }
  }

  function handleRemarcarConfirmado(resultado: RemarcacaoResultado) {
    const {
      appointment,
      novaData,
      novoHorario,
      paciente: pac,
      tipos,
      duracaoMin,
      motivo,
    } = resultado;
    const isoDestino = toISODate(novaData);
    const primaryTipo = tipos[0] || appointment.tipo;

    // Atualizar paciente cadastrado se necessário
    const idxPaciente = pacientes.findIndex((p) => p.id === pac.id);
    if (idxPaciente >= 0) pacientes[idxPaciente] = pac;
    else pacientes.push(pac);

    const atualizado: Appointment = {
      ...appointment,
      hora: novoHorario,
      paciente: pac,
      tipo: primaryTipo,
      tipos,
      duracaoMin,
      status: "agendado",
      pendencia: undefined,
    };

    if (motivo) {
      const timestamp = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const notaTexto = `[Remarcação às ${timestamp}]: ${motivo} (Transferido para ${novaData.toLocaleDateString("pt-BR")} às ${novoHorario})`;
      setNotas((atual) => ({
        ...atual,
        [atualizado.id]: [...(atual[atualizado.id] ?? []), notaTexto],
      }));
    }

    if (isoDestino === isoSelecionado) {
      // Mesmo dia: atualiza horário e procedimentos
      setAlteracoes((atual) => ({
        ...atual,
        [atualizado.id]: atualizado,
      }));
    } else {
      // Dia diferente: remove da data atual e insere na nova data
      setRemovidos((prev) => ({
        ...prev,
        [isoSelecionado]: [...(prev[isoSelecionado] ?? []), appointment.id],
      }));

      setExtras((prev) => ({
        ...prev,
        [isoDestino]: [
          ...(prev[isoDestino] ?? []).filter((a) => a.id !== atualizado.id),
          atualizado,
        ],
      }));

      setAlteracoes((prev) => {
        const next = { ...prev };
        delete next[appointment.id];
        return next;
      });
    }

    const rotuloTipos = formatarTipos(tipos, primaryTipo);
    toast.success(`Agendamento remarcado com sucesso!`, {
      description: `${pac.nome.split(" ")[0]} · ${rotuloTipos} · ${novaData.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })} às ${novoHorario}`,
    });
  }

  function handleCancelarAgendamento(appointment: Appointment, motivo?: string) {
    setAlteracoes((atual) => ({
      ...atual,
      [appointment.id]: {
        ...appointment,
        status: "recusado",
        pendencia: "recusado",
      },
    }));

    if (motivo) {
      const timestamp = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setNotas((atual) => ({
        ...atual,
        [appointment.id]: [
          ...(atual[appointment.id] ?? []),
          `[Cancelado às ${timestamp}]: ${motivo}`,
        ],
      }));
    }

    toast.error(`Agendamento cancelado — ${appointment.paciente.nome.split(" ")[0]}`, {
      description: motivo || "Horário liberado na agenda do dia.",
    });
  }

  function handleNovoAgendamento(draft: NovoAgendamentoDraft) {
    if (!pacientes.some((p) => p.id === draft.paciente.id)) {
      pacientes.push(draft.paciente);
    }

    const novo: Appointment = {
      id: `novo-${Date.now()}`,
      hora: draft.hora,
      duracaoMin: draft.duracaoMin,
      paciente: draft.paciente,
      tipo: draft.tipo,
      tipos: draft.tipos,
      medico: MEDICO,
      status: "agendado",
    };

    const isoDraft = toISODate(draft.data);

    if (draft.observacoes) {
      const obs = draft.observacoes;
      setNotas((atual) => ({ ...atual, [novo.id]: [...(atual[novo.id] ?? []), obs] }));
    }

    setExtras((atual) => ({
      ...atual,
      [isoDraft]: [...(atual[isoDraft] ?? []), novo],
    }));
    setFiltro("todos");
    setBusca("");
    setCategoria(null);

    if (isoDraft !== isoSelecionado) {
      setDataSelecionada(draft.data);
    }

    const rotuloTipos = formatarTipos(draft.tipos, draft.tipo);

    toast.success(`Agendamento criado — ${draft.paciente.nome.split(" ")[0]}`, {
      description: `${rotuloTipos} · ${draft.hora} · ${statusInfo.agendado.rotulo} (${draft.duracaoMin} min)`,
    });
  }

  function salvarEdicao(appointment: Appointment, resultado: EdicaoResultado) {
    const indice = pacientes.findIndex((p) => p.id === resultado.paciente.id);
    if (indice >= 0) pacientes[indice] = resultado.paciente;

    setAlteracoes((atual) => ({
      ...atual,
      [appointment.id]: {
        ...(atual[appointment.id] ?? appointment),
        paciente: resultado.paciente,
        ...(resultado.agendamento ?? {}),
      },
    }));
    toast.success("Informações atualizadas");
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
        agendaDoDia={resolverAgenda}
      />

      <ScrollProgressHeart />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">

        {/* Indicadores do dia — Linha interativa */}
        <section
          aria-label="Indicadores do dia"
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
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
            onClick={() => setFiltro("todos")}
            title={`${recusados} recusado(s) · ${semResposta} sem resposta · ${falhas} falha(s) de envio`}
            className="card-rise flex items-center gap-3 rounded-2xl border border-amber/40 bg-amber/5 p-4 text-left shadow-2xs transition-all duration-200 hover:border-amber active:scale-[0.98]"
            style={{ animationDelay: "250ms" }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amberdeep">
              <AlertTriangle className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="truncate font-mono text-[9px] font-bold uppercase tracking-widest text-amberdeep">
                Pendências
              </div>
              <div className="text-2xl font-black leading-tight tracking-tight tabular-nums text-amberdeep">
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
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-inksoft/60" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por paciente, tipo de atendimento ou convênio..."
              className="h-12 w-full rounded-2xl border border-line2 bg-card pl-11 pr-10 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/50 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
            />
            {busca && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setBusca("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-inksoft/60 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-line2 bg-card p-1.5">
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
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                Consultas
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums transition-colors",
                  categoria === "consulta" ? "bg-amber/20 text-amber" : "bg-mutbg text-inksoft",
                )}
              >
                {totalConsultas} {totalConsultas === 1 ? "agendada" : "agendadas"}
              </span>
            </button>
          </div>
        </section>

        {/* Lista de agendamentos */}
        <section aria-label="Agenda do dia" className="space-y-3.5">
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
              onEditar={() => setEditando(appointment)}
              onRemarcar={(app) => setRemarcando(app)}
            />
          ))}

          {visiveis.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line2 bg-card p-12 text-center shadow-2xs">
              <Clock className="mx-auto mb-2 size-8 text-inksoft/40" />
              <p className="text-sm font-bold text-ink">
                Nenhum agendamento encontrado para os filtros selecionados.
              </p>
              <p className="mt-1 text-xs text-inksoft">
                Tente limpar os termos de busca ou selecionar outra data no cabeçalho.
              </p>
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
                  Limpar filtros
                </button>
                <button
                  type="button"
                  onClick={() => setWizardAberto(true)}
                  className="rounded-xl bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-2xs transition-all hover:bg-ink/90"
                >
                  Criar Agendamento
                </button>
              </div>
            </div>
          )}
        </section>

        {editando && (
          <EditarRegistroDialog
            open={!!editando}
            onOpenChange={(aberto) => !aberto && setEditando(null)}
            paciente={editando.paciente}
            appointment={editando}
            onSalvar={(resultado) => salvarEdicao(editando, resultado)}
          />
        )}

        {remarcando && (
          <RemarcarAgendamentoDialog
            open={!!remarcando}
            onOpenChange={(aberto) => !aberto && setRemarcando(null)}
            appointment={remarcando}
            dataAtual={dataSelecionada}
            onConfirmarRemarcacao={handleRemarcarConfirmado}
            onCancelarAgendamento={handleCancelarAgendamento}
          />
        )}

        <NovoAgendamentoWizard
          open={wizardAberto}
          onOpenChange={setWizardAberto}
          dataInicial={dataSelecionada}
          onSalvar={handleNovoAgendamento}
        />

        <footer className="mt-12 flex items-center justify-between border-t border-line2/40 py-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
            Clínica de Cardiologia · Dr. Carlos Mendes (CRM 123.456-SP)
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft/70">
            Agenda Cardio v2.0
          </span>
        </footer>
      </main>
    </div>
  );
}
