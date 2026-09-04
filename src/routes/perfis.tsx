import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Profile, SubscriptionSummaryResponse } from "@/server/domain/subscription.types";
import {
  HeartPulse,
  Plus,
  Stethoscope,
  User,
  Shield,
  Pencil,
  Trash2,
  Lock,
  Sparkles,
  ArrowRight,
  LogOut,
  CreditCard,
  CheckCircle2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/perfis")({
  component: PerfisPage,
});

export function PerfisPage() {
  const { user, isAuthenticated, isLoading, setCurrentProfile, logout, currentProfile } = useAuth();
  const navigate = useNavigate();

  const [perfis, setPerfis] = useState<Profile[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummaryResponse | null>(null);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [modoGerenciamento, setModoGerenciamento] = useState(false);

  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalPinAberto, setModalPinAberto] = useState(false);
  const [perfilSelecionadoPin, setPerfilSelecionadoPin] = useState<Profile | null>(null);
  const [perfilEmEdicao, setPerfilEmEdicao] = useState<Profile | null>(null);
  const [pinInput, setPinInput] = useState("");

  // Formulário de Criação/Edição
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"medico" | "recepcionista" | "crm_admin">("medico");
  const [formCrm, setFormCrm] = useState("");
  const [formColor, setFormColor] = useState("#2563EB");
  const [formPin, setFormPin] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Redireciona para /login se não estiver logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const carregarPerfisESumo = async () => {
    try {
      setCarregandoDados(true);
      const [listaPerfis, resumoAssinatura] = await Promise.all([
        apiClient.getProfiles(),
        apiClient.getSubscriptionSummary(),
      ]);
      setPerfis(listaPerfis);
      setSummary(resumoAssinatura);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao carregar perfis";
      toast.error("Erro ao carregar perfis", { description: msg });
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      carregarPerfisESumo();
    }
  }, [isAuthenticated]);

  const handleSelecionarPerfil = async (perfil: Profile) => {
    if (modoGerenciamento) {
      abrirEditarPerfil(perfil);
      return;
    }

    // Se o perfil tiver PIN configurado, abre prompt de validação
    if (perfil.pin) {
      setPerfilSelecionadoPin(perfil);
      setPinInput("");
      setModalPinAberto(true);
      return;
    }

    try {
      await apiClient.selectProfile(perfil.id);
      setCurrentProfile(perfil);
      toast.success(`Bem-vindo, ${perfil.nome}!`, {
        description: `Perfil ativado: ${perfil.role === "medico" ? "Cardiologista" : perfil.role === "recepcionista" ? "Recepção" : "CRM Administrativo"}`,
      });
      navigate({ to: "/agenda" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao selecionar perfil";
      toast.error(msg);
    }
  };

  const handleConfirmarPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfilSelecionadoPin) return;

    try {
      await apiClient.selectProfile(perfilSelecionadoPin.id, pinInput);
      setCurrentProfile(perfilSelecionadoPin);
      setModalPinAberto(false);
      toast.success(`Acesso autorizado: ${perfilSelecionadoPin.nome}`);
      navigate({ to: "/agenda" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PIN incorreto";
      toast.error("Acesso negado", { description: msg });
    }
  };

  const abrirNovoPerfil = () => {
    if (!summary?.podeAdicionarPerfil) {
      toast.error("Limite de perfis atingido", {
        description: `Seu plano atual permite até ${summary?.subscription?.totalPerfisPermitidos || 2} perfil(is). Faça upgrade para o Plano Avançado para liberar o perfil de CRM e mais recursos.`,
        action: {
          label: "Ver Planos",
          onClick: () => navigate({ to: "/planos" }),
        },
      });
      return;
    }

    setFormNome("");
    setFormEmail("");
    setFormRole("medico");
    setFormCrm("");
    setFormColor(CORES_NETFLIX[perfis.length % CORES_NETFLIX.length] || "#2563EB");
    setFormPin("");
    setModalNovoAberto(true);
  };

  const abrirEditarPerfil = (perfil: Profile) => {
    setPerfilEmEdicao(perfil);
    setFormNome(perfil.nome);
    setFormEmail(perfil.email);
    setFormRole(perfil.role);
    setFormCrm(perfil.crm || "");
    setFormColor(perfil.avatarColor || "#2563EB");
    setFormPin(perfil.pin || "");
    setModalEditarAberto(true);
  };

  const handleSalvarNovoPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const novo = await apiClient.createProfile({
        nome: formNome,
        email: formEmail,
        role: formRole,
        crm: formRole === "medico" ? formCrm : undefined,
        avatarColor: formColor,
        avatarIcon:
          formRole === "medico" ? "stethoscope" : formRole === "crm_admin" ? "shield" : "user",
        pin: formPin.trim() ? formPin : undefined,
      });

      toast.success(`Perfil '${novo.nome}' criado com sucesso!`);
      setModalNovoAberto(false);
      await carregarPerfisESumo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar perfil";
      toast.error("Não foi possível criar o perfil", { description: msg });
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarEdicaoPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfilEmEdicao) return;

    setSalvando(true);
    try {
      const atualizado = await apiClient.updateProfile(perfilEmEdicao.id, {
        nome: formNome,
        email: formEmail,
        role: formRole,
        crm: formRole === "medico" ? formCrm : undefined,
        avatarColor: formColor,
        pin: formPin.trim() ? formPin : undefined,
      });

      if (currentProfile?.id === atualizado.id) {
        setCurrentProfile(atualizado);
      }

      toast.success(`Perfil '${atualizado.nome}' atualizado!`);
      setModalEditarAberto(false);
      await carregarPerfisESumo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      toast.error("Não foi possível atualizar o perfil", { description: msg });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirPerfil = async (perfil: Profile) => {
    if (perfil.isPrimary) {
      toast.error("O perfil principal do titular não pode ser excluído.");
      return;
    }

    if (!confirm(`Tem certeza que deseja remover o perfil de '${perfil.nome}'?`)) {
      return;
    }

    try {
      await apiClient.deleteProfile(perfil.id);
      if (currentProfile?.id === perfil.id) {
        setCurrentProfile(null);
      }
      toast.success(`Perfil '${perfil.nome}' removido.`);
      await carregarPerfisESumo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir perfil";
      toast.error(msg);
    }
  };

  const CORES_NETFLIX = ["#2563EB", "#10B981", "#DC2626", "#8B5CF6", "#F59E0B", "#06B6D4"];

  const renderIconePerfil = (role: string, iconName?: string) => {
    if (role === "medico" || iconName === "stethoscope") {
      return <Stethoscope className="size-12 text-white drop-shadow" />;
    }
    if (role === "crm_admin" || iconName === "shield") {
      return <Shield className="size-12 text-white drop-shadow" />;
    }
    return <User className="size-12 text-white drop-shadow" />;
  };

  if (isLoading || carregandoDados) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
          <HeartPulse className="size-8 animate-pulse text-red-500" />
        </div>
        <p className="mt-4 font-mono text-sm tracking-widest text-zinc-400">
          CARREGANDO PERFIS CLÍNICOS...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-[#030712] text-zinc-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Topo / Barra de Marca */}
      <header className="px-6 py-6 sm:px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-red-600 font-mono text-lg font-black text-white shadow-lg shadow-red-600/30">
            <HeartPulse className="size-6" />
          </div>
          <div>
            <span className="font-mono text-lg font-black tracking-wider uppercase text-white">
              AGENDA<span className="text-red-500">CARDIO</span>
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
              Multi-Perfil
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => navigate({ to: "/planos" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <CreditCard className="size-3.5 text-red-400" />
            <span className="hidden sm:inline">Plano:</span>{" "}
            <strong>{summary?.plan?.nome || "Carregando"}</strong>
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Sair da Conta"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Central: Quem está atendendo hoje? */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            Quem está usando agora?
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto mb-10">
            Selecione seu perfil profissional para carregar seus agendamentos, prontuários de
            pacientes e registros médicos em conformidade com o sigilo clínico.
          </p>

          {/* Grid de Perfis estilo Netflix */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-12">
            {perfis.map((perfil) => {
              const isSelected = currentProfile?.id === perfil.id;
              return (
                <div
                  key={perfil.id}
                  className="group relative flex flex-col items-center w-36 sm:w-44 text-center cursor-pointer"
                  onClick={() => handleSelecionarPerfil(perfil)}
                >
                  {/* Cartão do Avatar */}
                  <div
                    style={{ backgroundColor: perfil.avatarColor || "#2563EB" }}
                    className={`relative size-32 sm:size-40 rounded-2xl flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:ring-4 group-hover:ring-white/80 group-hover:shadow-2xl ${
                      isSelected ? "ring-4 ring-red-500 shadow-red-900/40" : "ring-1 ring-white/10"
                    }`}
                  >
                    {renderIconePerfil(perfil.role, perfil.avatarIcon)}

                    {/* Selo de Perfil Primário ou CRM */}
                    {perfil.isPrimary && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-black/60 text-white backdrop-blur">
                        Titular
                      </span>
                    )}
                    {perfil.tipo === "crm" && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-900/80 text-purple-200 backdrop-blur">
                        CRM
                      </span>
                    )}

                    {/* Ícone de Cadeado se tiver PIN */}
                    {perfil.pin && (
                      <span
                        className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 text-amber-300 backdrop-blur"
                        title="Protegido por PIN"
                      >
                        <Lock className="size-3.5" />
                      </span>
                    )}

                    {/* Botão de Edição no Modo Gerenciamento */}
                    {modoGerenciamento && (
                      <div className="absolute inset-0 bg-black/75 rounded-2xl flex items-center justify-center gap-3 backdrop-blur-xs transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEditarPerfil(perfil);
                          }}
                          className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition transform hover:scale-110"
                          title="Editar Perfil"
                        >
                          <Pencil className="size-4" />
                        </button>
                        {!perfil.isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluirPerfil(perfil);
                            }}
                            className="p-2.5 rounded-full bg-red-900/80 hover:bg-red-700 text-white transition transform hover:scale-110"
                            title="Excluir Perfil"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nome e Cargo */}
                  <span className="mt-3.5 text-base sm:text-lg font-bold text-zinc-200 group-hover:text-white line-clamp-1">
                    {perfil.nome}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {perfil.role === "medico"
                      ? perfil.crm
                        ? `CRM ${perfil.crm}`
                        : "Médico"
                      : perfil.role === "recepcionista"
                        ? "Recepção / Triagem"
                        : "CRM Comercial"}
                  </span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-[150px] mt-0.5">
                    {perfil.email}
                  </span>
                </div>
              );
            })}

            {/* Cartão de Adicionar Perfil (+) */}
            <div
              onClick={abrirNovoPerfil}
              className="group flex flex-col items-center w-36 sm:w-44 text-center cursor-pointer"
            >
              <div
                className={`size-32 sm:size-40 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 bg-zinc-900/40 text-zinc-400 group-hover:border-zinc-300 group-hover:text-white group-hover:bg-zinc-800/60 transition-all duration-300 transform group-hover:scale-105 shadow-inner`}
              >
                <Plus className="size-12 stroke-[1.5]" />
                <span className="mt-2 text-xs font-mono uppercase tracking-wider font-semibold">
                  Novo Perfil
                </span>
              </div>
              <span className="mt-3.5 text-sm font-semibold text-zinc-400 group-hover:text-zinc-200">
                Adicionar Perfil
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {summary?.perfisDisponiveis !== undefined
                  ? `${summary.perfisDisponiveis} vaga(s) no plano`
                  : "Verificar plano"}
              </span>
            </div>
          </div>

          {/* Ações Inferiores: Gerenciar Perfis / Fazer Upgrade */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setModoGerenciamento((prev) => !prev)}
              className={`px-6 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest font-bold border transition ${
                modoGerenciamento
                  ? "bg-red-600 text-white border-red-500 hover:bg-red-700"
                  : "bg-transparent text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
              }`}
            >
              {modoGerenciamento ? "Concluir Edição" : "Gerenciar Perfis"}
            </button>

            <button
              onClick={() => navigate({ to: "/planos" })}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Gerenciar Assinatura</span>
            </button>
          </div>
        </div>
      </main>

      {/* Banner de Rodapé sobre a Assinatura */}
      <footer className="px-6 py-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>
            Assinatura Ativa:{" "}
            <strong className="text-zinc-200">{summary?.plan?.nome || "Plano"}</strong> (
            {summary?.perfisUsados || perfis.length} de{" "}
            {summary?.subscription?.totalPerfisPermitidos || 1} perfis em uso)
          </span>
        </div>

        <button
          onClick={() => navigate({ to: "/planos" })}
          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition"
        >
          <span>Trocar de Plano ou Adicionar Vagas</span>
          <ArrowRight className="size-3" />
        </button>
      </footer>

      {/* Modal de Confirmação de PIN estilo Netflix */}
      {modalPinAberto && perfilSelecionadoPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-700 max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl">
            <div className="mx-auto size-14 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/50 flex items-center justify-center mb-3 shadow-lg shadow-red-950/50">
              <Lock className="size-7" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Perfil Protegido por PIN</h3>
            <p className="text-xs text-zinc-400 mb-2">
              Digite o PIN de 4 dígitos para acessar o perfil de{" "}
              <strong className="text-white">{perfilSelecionadoPin.nome}</strong>.
            </p>
            <p className="text-[11px] text-zinc-500 mb-4 font-mono">{perfilSelecionadoPin.email}</p>

            <form onSubmit={handleConfirmarPin} className="space-y-4">
              {/* 4 Caixas de Dígitos do PIN */}
              <div className="flex justify-center gap-3 my-4">
                {[0, 1, 2, 3].map((idx) => {
                  const digit = pinInput[idx];
                  return (
                    <div
                      key={idx}
                      className={`size-12 sm:size-14 rounded-xl flex items-center justify-center font-mono text-2xl font-black border transition-all ${
                        digit
                          ? "border-red-500 bg-red-950/40 text-white shadow-md shadow-red-950/40"
                          : idx === pinInput.length
                            ? "border-white/80 bg-white/10 text-white ring-2 ring-white/30"
                            : "border-zinc-700 bg-zinc-800/60 text-zinc-600"
                      }`}
                    >
                      {digit ? "•" : ""}
                    </div>
                  );
                })}
              </div>

              {/* Input escondido/acessível com autoFocus */}
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setPinInput(val);
                }}
                className="opacity-0 absolute -z-10"
                aria-label="Digite os 4 dígitos do PIN"
              />

              {/* Teclado numérico de toque direto na tela */}
              <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((btn) => (
                  <button
                    key={btn}
                    type="button"
                    onClick={() => {
                      if (btn === "C") {
                        setPinInput("");
                      } else if (btn === "⌫") {
                        setPinInput((prev) => prev.slice(0, -1));
                      } else if (pinInput.length < 4) {
                        setPinInput((prev) => prev + btn);
                      }
                    }}
                    className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 font-mono text-sm font-bold text-zinc-200 border border-zinc-750 transition"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalPinAberto(false)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/30"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Perfil com Validação em Tempo Real */}
      {(modalNovoAberto || modalEditarAberto) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setModalNovoAberto(false);
                setModalEditarAberto(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {modalNovoAberto ? "Adicionar Novo Perfil" : "Editar Perfil"}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Cada perfil possui seu próprio e-mail e configurações no estilo Netflix.
            </p>

            {/* Medidor de Limites e Cota do Plano */}
            <div className="mb-4 p-3 rounded-xl bg-zinc-800/90 border border-zinc-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400 block">
                  Capacidade da Assinatura:
                </span>
                <span className="font-bold text-white">
                  {summary?.perfisUsados || perfis.length} de{" "}
                  {summary?.subscription?.totalPerfisPermitidos || 1} vagas em uso
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-red-950 text-red-300 border border-red-800/60">
                {summary?.plan?.nome || "Plano"}
              </span>
            </div>

            {/* Alerta de Cota Esgotada se for Novo Perfil */}
            {modalNovoAberto && !summary?.podeAdicionarPerfil && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/60 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Lock className="size-4" />
                  <span>Limite do Plano Atingido</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Seu plano atual ({summary?.plan?.nome}) permite até{" "}
                  {summary?.subscription?.totalPerfisPermitidos || 2} perfil(is). Para liberar o{" "}
                  perfil dedicado de CRM comercial e recursos extras, faça upgrade para o{" "}
                  <strong>Plano Avançado</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setModalNovoAberto(false);
                    navigate({ to: "/planos" });
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="size-3.5" />
                  <span>Fazer Upgrade no Plano Avançado</span>
                </button>
              </div>
            )}

            <form
              onSubmit={modalNovoAberto ? handleSalvarNovoPerfil : handleSalvarEdicaoPerfil}
              className="space-y-4 text-left"
            >
              {/* Nome */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nome do Profissional ou Setor *
                </label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Dra. Mariana Costa ou Recepção 02"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              {/* E-mail Próprio do Perfil */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  E-mail do Perfil (Único) *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ex: mariana.cardio@clinica.com.br"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Conforme a lógica Netflix, cada perfil pode possuir seu próprio endereço de
                  e-mail.
                </span>
              </div>

              {/* Função / Papel */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Função Clínica *
                </label>
                <select
                  value={formRole}
                  onChange={(e) =>
                    setFormRole(e.target.value as "medico" | "recepcionista" | "crm_admin")
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="medico">Médico / Cardiologista</option>
                  <option value="recepcionista">Recepção / Triagem</option>
                  {summary?.crmLiberado && (
                    <option value="crm_admin">Gestor Comercial & CRM</option>
                  )}
                </select>
              </div>

              {/* CRM (se médico) */}
              {formRole === "medico" && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Número de Registro CRM
                  </label>
                  <input
                    type="text"
                    value={formCrm}
                    onChange={(e) => setFormCrm(e.target.value)}
                    placeholder="Ex: SP-987654"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              {/* Cor do Avatar estilo Netflix */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Cor do Perfil
                </label>
                <div className="flex gap-2.5">
                  {CORES_NETFLIX.map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setFormColor(cor)}
                      style={{ backgroundColor: cor }}
                      className={`size-8 rounded-full border-2 transition transform ${
                        formColor === cor
                          ? "border-white scale-125 shadow-lg"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PIN de Segurança Opcional */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  PIN de Acesso (4 dígitos opcional)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ex: 1234 (opcional)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-mono focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Exige esta senha rápida ao clicar para abrir este perfil.
                </span>
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalNovoAberto(false);
                    setModalEditarAberto(false);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-red-900/30"
                >
                  {salvando
                    ? "Salvando..."
                    : modalNovoAberto
                      ? "Criar Perfil"
                      : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
