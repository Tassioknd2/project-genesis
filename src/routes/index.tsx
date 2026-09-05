import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { DesktopAgendaView, type FiltroAgenda } from "@/components/desktop/DesktopAgendaView";
import { MobileAgendaView, type FiltroMobile } from "@/components/mobile/MobileAgendaView";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
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
  isPendencia,
  ordenarPorHorario,
  pacientes,
  statusInfo,
  toISODate,
  type Appointment,
  type CategoriaAtendimento,
  type Etiqueta,
  type EtiquetaCor,
} from "@/lib/agenda-data";
import type { Action } from "@/components/desktop/DesktopAppointmentCard";
import type { MobileAction } from "@/components/mobile/MobileAppointmentCard";

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

function AgendaPage() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [extras, setExtras] = useState<Record<string, Appointment[]>>({});
  const [removidos, setRemovidos] = useState<Record<string, string[]>>({});
  const [alteracoes, setAlteracoes] = useState<Record<string, Appointment>>({});
  const [notas, setNotas] = useState<Record<string, string[]>>({});
  const [etiquetas, setEtiquetas] = useState<Record<string, Etiqueta[]>>({});
  const [filtro, setFiltro] = useState<FiltroAgenda>("todos");
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

  const agenda = useMemo(() => resolverAgenda(isoSelecionado), [isoSelecionado, resolverAgenda]);

  useEffect(() => {
    setFiltro("todos");
  }, [isoSelecionado]);

  const confirmados = agenda.filter(
    (a) => a.status === "confirmado" || a.status === "concluido",
  ).length;
  const pendenciasList = agenda.filter(isPendencia);
  const totalPendencias = pendenciasList.length;
  const semResposta = agenda.filter(
    (a) => a.status === "aguardando" || a.pendencia === "sem_resposta",
  ).length;
  const faltas = agenda.filter((a) => a.status === "falta").length;
  const recusados = agenda.filter(
    (a) => a.status === "recusado" || a.pendencia === "recusado",
  ).length;
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
        if (filtro === "pendencias") {
          if (!isPendencia(a)) return false;
        } else if (filtro !== "todos" && a.status !== filtro) {
          return false;
        }
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

  function handleAction(appointment: Appointment, action: Action | MobileAction) {
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
      setAlteracoes((atual) => ({
        ...atual,
        [atualizado.id]: atualizado,
      }));
    } else {
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
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-paper font-sans text-ink selection:bg-amber/20">
      <AppHeader
        selectedDate={dataSelecionada}
        onSelectDate={setDataSelecionada}
        onNovoAgendamento={handleNovoAgendamento}
        agendaDoDia={resolverAgenda}
      />

      <ScrollProgressHeart />

      {/* Camada Desktop (Totalmente Intacta e Isolada) */}
      <main className="hidden md:block">
        <DesktopAgendaView
          dataSelecionada={dataSelecionada}
          total={total}
          confirmados={confirmados}
          faltas={faltas}
          taxaConfirmacao={taxaConfirmacao}
          totalPendencias={totalPendencias}
          semResposta={semResposta}
          recusados={recusados}
          totalExames={totalExames}
          totalConsultas={totalConsultas}
          filtro={filtro}
          setFiltro={setFiltro}
          busca={busca}
          setBusca={setBusca}
          categoria={categoria}
          setCategoria={setCategoria}
          visiveis={visiveis}
          notas={notas}
          etiquetas={etiquetas}
          onAction={handleAction}
          onAddNota={addNota}
          onRemoveNota={removeNota}
          onAddEtiqueta={addEtiqueta}
          onRemoveEtiqueta={removeEtiqueta}
          onEditar={(app) => setEditando(app)}
          onRemarcar={(app) => setRemarcando(app)}
          onAbrirWizard={() => setWizardAberto(true)}
        />
      </main>

      {/* Camada Mobile (Base Dedicada e Separada para Evolução Mobile) */}
      <main className="block md:hidden">
        <MobileAgendaView
          dataSelecionada={dataSelecionada}
          onSelectDate={setDataSelecionada}
          total={total}
          confirmados={confirmados}
          faltas={faltas}
          totalPendencias={totalPendencias}
          totalExames={totalExames}
          totalConsultas={totalConsultas}
          filtro={filtro as FiltroMobile}
          setFiltro={setFiltro as React.Dispatch<React.SetStateAction<FiltroMobile>>}
          busca={busca}
          setBusca={setBusca}
          categoria={categoria}
          setCategoria={setCategoria}
          visiveis={visiveis}
          notas={notas}
          etiquetas={etiquetas}
          onAction={handleAction}
          onEditar={(app) => setEditando(app)}
          onRemarcar={(app) => setRemarcando(app)}
          onAbrirWizard={() => setWizardAberto(true)}
        />
      </main>

      {/* Barra de Navegação Inferior Móvel */}
      <MobileBottomNav
        totalPendencias={totalPendencias}
        onNovoAgendamento={() => setWizardAberto(true)}
        onFiltroPendencias={() =>
          setFiltro((prev) => (prev === "pendencias" ? "todos" : "pendencias"))
        }
        isFiltroPendenciasAtivo={filtro === "pendencias"}
      />

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
    </div>
  );
}
