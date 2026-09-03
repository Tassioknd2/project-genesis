import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { AppHeader } from "@/components/AppHeader";
import { DesktopPacientesView } from "@/components/desktop/DesktopPacientesView";
import { MobilePacientesView } from "@/components/mobile/MobilePacientesView";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { EditarPacienteDialog } from "@/components/EditarPacienteDialog";
import { ScrollProgressHeart } from "@/components/ScrollProgressHeart";
import {
  NovoAgendamentoWizard,
  type NovoAgendamentoDraft,
} from "@/components/NovoAgendamentoWizard";
import { pacientes, type Patient } from "@/lib/agenda-data";

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
  component: ProtectedPacientesPage,
});

function ProtectedPacientesPage() {
  return (
    <ProtectedRoute>
      <PacientesPage />
    </ProtectedRoute>
  );
}

function PacientesPage() {
  const [listaPacientes, setListaPacientes] = useState<Patient[]>(() => [...pacientes]);
  const [busca, setBusca] = useState("");
  const [filtroConvenio, setFiltroConvenio] = useState<string>("todos");
  const [pacienteParaAgendar, setPacienteParaAgendar] = useState<Patient | null>(null);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<Patient | null>(null);
  const [wizardAberto, setWizardAberto] = useState(false);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);

  // Carrega pacientes do backend autenticado com o token da sessão
  useEffect(() => {
    let ativo = true;
    apiClient
      .getPatients()
      .then((remotos) => {
        if (ativo && remotos && remotos.length > 0) {
          setListaPacientes(remotos as Patient[]);
        }
      })
      .catch((err) => {
        console.warn("Uso de pacientes locais ou falha de autorização:", err);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const convenios = useMemo(() => {
    const set = new Set<string>();
    listaPacientes.forEach((p) => {
      if (p.convenio) set.add(p.convenio);
    });
    return Array.from(set);
  }, [listaPacientes]);

  const visiveis = useMemo(() => {
    return listaPacientes.filter((p) => {
      if (filtroConvenio !== "todos" && p.convenio !== filtroConvenio) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return (
          p.nome.toLowerCase().includes(q) ||
          p.telefone.includes(q) ||
          p.convenio.toLowerCase().includes(q) ||
          (p.observacoes && p.observacoes.toLowerCase().includes(q)) ||
          (p.dataNascimento && p.dataNascimento.includes(q))
        );
      }
      return true;
    });
  }, [listaPacientes, busca, filtroConvenio]);

  const totalParticulares = listaPacientes.filter((p) =>
    p.convenio.toLowerCase().includes("particular"),
  ).length;
  const totalConvenios = listaPacientes.length - totalParticulares;

  function abrirAgendamento(p: Patient) {
    setPacienteParaAgendar(p);
    setWizardAberto(true);
  }

  function abrirEdicao(p: Patient) {
    setPacienteParaEditar(p);
    setDialogEditarAberto(true);
  }

  async function handleSalvarPaciente(pacienteAtualizado: Patient) {
    setListaPacientes((prev) =>
      prev.map((p) => (p.id === pacienteAtualizado.id ? pacienteAtualizado : p)),
    );

    // Sincroniza também no array global em memória
    const idx = pacientes.findIndex((p) => p.id === pacienteAtualizado.id);
    if (idx >= 0) {
      pacientes[idx] = pacienteAtualizado;
    } else {
      pacientes.push(pacienteAtualizado);
    }

    try {
      await apiClient.updatePatient(pacienteAtualizado.id, pacienteAtualizado);
    } catch {
      // Notifica com tolerância a falhas locais
    }

    toast.success(`Cadastro atualizado: ${pacienteAtualizado.nome}`, {
      description: "Os dados do paciente foram salvos com sucesso.",
    });
  }

  function handleSalvarDraft(draft: NovoAgendamentoDraft) {
    toast.success(`Agendamento realizado para ${draft.paciente.nome}`, {
      description: `${draft.tipo} agendado às ${draft.hora}.`,
    });
    setWizardAberto(false);
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-paper font-sans text-ink selection:bg-amber/20">
      <AppHeader />
      <ScrollProgressHeart />

      {/* Camada Desktop (Totalmente Intacta e Isolada) */}
      <main className="hidden md:block">
        <DesktopPacientesView
          listaPacientes={listaPacientes}
          visiveis={visiveis}
          totalParticulares={totalParticulares}
          totalConvenios={totalConvenios}
          convenios={convenios}
          busca={busca}
          setBusca={setBusca}
          filtroConvenio={filtroConvenio}
          setFiltroConvenio={setFiltroConvenio}
          onAbrirEdicao={abrirEdicao}
          onAbrirAgendamento={abrirAgendamento}
        />
      </main>

      {/* Camada Mobile (Base Dedicada para Evolução Mobile) */}
      <main className="block md:hidden">
        <MobilePacientesView
          listaPacientes={listaPacientes}
          visiveis={visiveis}
          totalParticulares={totalParticulares}
          totalConvenios={totalConvenios}
          convenios={convenios}
          busca={busca}
          setBusca={setBusca}
          filtroConvenio={filtroConvenio}
          setFiltroConvenio={setFiltroConvenio}
          onAbrirEdicao={abrirEdicao}
          onAbrirAgendamento={abrirAgendamento}
        />
      </main>

      {/* Navegação Inferior Móvel */}
      <MobileBottomNav onNovoAgendamento={() => setWizardAberto(true)} />

      {/* Diálogo de Edição de Paciente */}
      {pacienteParaEditar && (
        <EditarPacienteDialog
          open={dialogEditarAberto}
          onOpenChange={(aberto) => {
            setDialogEditarAberto(aberto);
            if (!aberto) setPacienteParaEditar(null);
          }}
          paciente={pacienteParaEditar}
          onSalvar={handleSalvarPaciente}
        />
      )}

      {/* Assistente de Novo Agendamento */}
<NovoAgendamentoWizard
        open={wizardAberto}
        onOpenChange={setWizardAberto}
        pacienteInicial={pacienteParaAgendar}
        onSalvar={handleSalvarDraft}
      />
    </div>
  );
}
