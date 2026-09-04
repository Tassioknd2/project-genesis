import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  HeartPulse,
  Kanban,
  Lock,
  MessageCircle,
  Phone,
  Search,
  Smartphone,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroDashboardPreview } from "@/components/HeroDashboardPreview";
import { HeroSplitSection } from "@/components/HeroSplitSection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Agenda Cardio — Agendamento Inteligente, Confirmações no WhatsApp e CRM para Clínicas de Cardiologia",
      },
      {
        name: "description",
        content:
          "O sistema completo para atendentes e recepcionistas: agendamento ágil de exames cardiológicos, confirmação automática no WhatsApp e CRM de pacientes. 30 dias grátis.",
      },
      {
        property: "og:title",
        content: "Agenda Cardio — Agendamento, WhatsApp e CRM Cardiológico",
      },
      {
        property: "og:description",
        content:
          "Zero faltas, confirmações automáticas com orientações de preparo no WhatsApp e CRM completo na mesma conta. Feito para a recepção da sua clínica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type VitrineTab = "agenda" | "pacientes" | "crm";

export function HomePage() {
  const { isAuthenticated, user, currentProfile } = useAuth();
  const navigate = useNavigate();

  // Estados da Vitrine Interativa
  const [tabAtiva, setTabAtiva] = useState<VitrineTab>("agenda");
  const [pacienteSimuladoConfirmado, setPacienteSimuladoConfirmado] = useState(false);
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [filtroAgenda, setFiltroAgenda] = useState<"todos" | "confirmados" | "aguardando">("todos");
  const [faqAberto, setFaqAberto] = useState<number | null>(0);

  const handleSimularConfirmacao = () => {
    setPacienteSimuladoConfirmado(true);
    toast.success("Confirmação via WhatsApp computada!", {
      description:
        "D. Lourdes respondeu 'SIM' no WhatsApp. A vaga das 08:30 foi marcada como confirmada na agenda.",
    });
  };

  return (
    <div className="min-h-screen w-full bg-paper font-sans text-ink selection:bg-amber/25">
      {/* Barra de sessão ativa do atendente */}
      {isAuthenticated && (
        <aside
          aria-label="Sessão ativa"
          className="border-b border-amber/25 bg-amber/10 px-4 py-2 text-xs"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-ok" />
              <span className="text-inksoft">
                Painel conectado para{" "}
                <strong className="font-semibold text-ink">
                  {currentProfile?.nome || user?.name || "Atendimento da Clínica"}
                </strong>
              </span>
            </div>
            <Link
              to="/agenda"
              className="inline-flex items-center gap-1 font-medium text-amberdeep hover:underline"
            >
              <span>Abrir Agenda Diária</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </aside>
      )}

      {/* Header Limpo e Acolhedor */}
      <header className="sticky top-0 z-40 border-b border-line2/60 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Marca / Identidade */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-cream shadow-xs">
              <HeartPulse className="size-4.5 text-amber" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-ink">Agenda Cardio</span>
              <span className="text-[10px] text-inksoft leading-none">
                Agendamento • WhatsApp • CRM
              </span>
            </div>
          </Link>

          {/* Navegação calma */}
          <nav
            aria-label="Navegação da página"
            className="hidden md:flex items-center gap-6 text-xs font-medium text-inksoft"
          >
            <a href="#vitrine-app" className="hover:text-ink transition-colors">
              Conheça o Aplicativo
            </a>
            <a href="#funcionalidades" className="hover:text-ink transition-colors">
              O que fazemos
            </a>
            <a href="#planos" className="hover:text-ink transition-colors">
              Planos e Valores
            </a>
            <a href="#duvidas" className="hover:text-ink transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/agenda" })}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-4 text-xs font-medium text-cream shadow-xs hover:bg-ink/90 transition-all active:scale-95"
              >
                <span>Acessar Agenda</span>
                <ArrowRight className="size-3.5 text-amber" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line2/80 bg-card px-3 text-xs font-medium text-ink hover:border-amber/60 hover:text-amberdeep transition-all active:scale-95"
                >
                  <Lock className="size-3 text-amber" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/cadastro"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-xs font-medium text-cream shadow-xs hover:bg-ink/90 transition-all active:scale-95"
                >
                  <span>Testar 30 dias grátis</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Split Section: Tendências de Design Aplicadas ao SaaS */}
      <section className="pt-4 pb-8 sm:pt-6 sm:pb-12 border-b border-line2/50 bg-paper/40">
        <HeroSplitSection />
      </section>

      {/* =========================================================================
            A CEREJA DO BOLO: VITRINE INTERATIVA DO APLICATIVO
            Apresenta as 3 telas reais que o atendente utiliza:
            1. Agenda Diária com Confirmações no WhatsApp
            2. Cartões e Fichas Rápidas dos Pacientes
            3. CRM Completo de Relacionamento e Retornos
           ========================================================================= */}
      <section id="vitrine-app" className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-line2 bg-card p-4 sm:p-7 shadow-xs">
          {/* Cabeçalho da Vitrine com Seletor de Telas do App */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line2/60 pb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amberdeep">
                Por Dentro do Sistema
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-ink">
                A imagem real do nosso aplicativo em operação diária
              </h2>
              <p className="text-xs text-inksoft mt-0.5">
                Clique nas abas abaixo para explorar como a recepção visualiza a agenda, os
                pacientes e o CRM.
              </p>
            </div>

            {/* Botões de Navegação das Telas */}
            <div className="inline-flex rounded-xl bg-paper p-1 border border-line2/80 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setTabAtiva("agenda")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  tabAtiva === "agenda"
                    ? "bg-ink text-cream shadow-2xs"
                    : "text-inksoft hover:text-ink",
                )}
              >
                <CalendarDays className="size-3.5 text-amber" />
                <span>Agenda & WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("pacientes")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  tabAtiva === "pacientes"
                    ? "bg-ink text-cream shadow-2xs"
                    : "text-inksoft hover:text-ink",
                )}
              >
                <Users className="size-3.5 text-amber" />
                <span>Cartões de Pacientes</span>
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("crm")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  tabAtiva === "crm"
                    ? "bg-ink text-cream shadow-2xs"
                    : "text-inksoft hover:text-ink",
                )}
              >
                <Kanban className="size-3.5 text-amber" />
                <span>CRM Completo</span>
              </button>
            </div>
          </div>

          {/* TAB 1: VISÃO DA AGENDA DIÁRIA COM WHATSAPP AO VIVO */}
          {tabAtiva === "agenda" && (
            <div className="mt-6 space-y-6">
              {/* Barra de resumo da recepção */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper p-3 sm:p-4 border border-line2/70 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber" />
                    Segunda-feira · 08:00 às 18:00
                  </span>
                  <span className="text-line2">•</span>
                  <span className="text-inksoft">
                    <strong>8 pacientes agendados</strong> (6 exames, 2 retornos)
                  </span>
                </div>

                {/* Filtro Rápido */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFiltroAgenda("todos")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                      filtroAgenda === "todos"
                        ? "bg-ink text-cream"
                        : "text-inksoft hover:text-ink bg-card border border-line2/60",
                    )}
                  >
                    Todos (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroAgenda("confirmados")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                      filtroAgenda === "confirmados"
                        ? "bg-ink text-cream"
                        : "text-inksoft hover:text-ink bg-card border border-line2/60",
                    )}
                  >
                    Confirmados WhatsApp (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroAgenda("aguardando")}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                      filtroAgenda === "aguardando"
                        ? "bg-ink text-cream"
                        : "text-inksoft hover:text-ink bg-card border border-line2/60",
                    )}
                  >
                    Aguardando Resposta (1)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Grade dos cartões de agendamento */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Cartão 1 (Interativo com simulação de WhatsApp) */}
                  {(filtroAgenda === "todos" ||
                    (filtroAgenda === "confirmados" && pacienteSimuladoConfirmado) ||
                    (filtroAgenda === "aguardando" && !pacienteSimuladoConfirmado)) && (
                    <div
                      className={cn(
                        "rounded-2xl border p-4 transition-all",
                        pacienteSimuladoConfirmado
                          ? "border-emerald-500/40 bg-card shadow-xs"
                          : "border-line2 bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-paper border border-line2 text-xs font-mono font-bold text-ink">
                            08:30
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-ink">Dona Lourdes Silveira</h3>
                              <span className="text-[10px] rounded bg-amber/15 text-amberdeep font-medium px-2 py-0.5">
                                Holter 24h
                              </span>
                            </div>
                            <p className="text-xs text-inksoft mt-0.5">
                              71 anos • Bradesco Saúde • Tel: (11) 98452-1100
                            </p>
                          </div>
                        </div>

                        {pacienteSimuladoConfirmado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium shrink-0">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Confirmado WhatsApp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber/10 text-amberdeep border border-amber/20 text-[11px] font-medium shrink-0">
                            <Clock className="size-3 text-amber" />
                            Aguardando WhatsApp
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-line2/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-inksoft">
                          💡 <strong>Instrução enviada:</strong> Comparecer com camisa de botões
                          para instalação do aparelho.
                        </span>
                        {!pacienteSimuladoConfirmado ? (
                          <button
                            type="button"
                            onClick={handleSimularConfirmacao}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all"
                          >
                            <Smartphone className="size-3" />
                            <span>Simular Confirmação WhatsApp</span>
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-medium">
                            Vaga mantida com sucesso
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cartão 2 */}
                  {(filtroAgenda === "todos" || filtroAgenda === "confirmados") && (
                    <div className="rounded-2xl border border-line2 bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-paper border border-line2 text-xs font-mono font-bold text-ink">
                            09:15
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-ink">
                                Sr. Antônio Carlos Ferreira
                              </h3>
                              <span className="text-[10px] rounded bg-blue-50 text-blue-700 font-medium px-2 py-0.5">
                                Ecocardiograma
                              </span>
                            </div>
                            <p className="text-xs text-inksoft mt-0.5">
                              58 anos • Unimed • Tel: (11) 97120-4321
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium shrink-0">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Confirmado WhatsApp
                        </span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-line2/50 text-[11px] text-inksoft">
                        Paciente pontual • Confirmou presença às 07:45 via WhatsApp automático.
                      </div>
                    </div>
                  )}

                  {/* Cartão 3 */}
                  {(filtroAgenda === "todos" || filtroAgenda === "confirmados") && (
                    <div className="rounded-2xl border border-line2 bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-paper border border-line2 text-xs font-mono font-bold text-ink">
                            10:00
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-ink">Heloísa Helena Ramos</h3>
                              <span className="text-[10px] rounded bg-purple-50 text-purple-700 font-medium px-2 py-0.5">
                                MAPA 24h
                              </span>
                            </div>
                            <p className="text-xs text-inksoft mt-0.5">
                              42 anos • Particular • Tel: (11) 99312-8877
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium shrink-0">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          Confirmado WhatsApp
                        </span>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-line2/50 text-[11px] text-inksoft">
                        Instrução de evitar blusas apertadas enviada no lembrete de ontem.
                      </div>
                    </div>
                  )}

                  {/* Cartão 4 (Horário Livre / Encaixe Ágil) */}
                  {filtroAgenda === "todos" && (
                    <div className="rounded-2xl border border-dashed border-line2 bg-paper/60 p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-card border border-line2 font-mono text-inksoft text-[11px]">
                          10:45
                        </span>
                        <span className="text-inksoft italic">
                          Horário livre para novo agendamento ou encaixe imediato
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toast.info("Encaixe Rápido", {
                            description:
                              "No sistema real, você abre o agendamento em 1 clique escolhendo o paciente cadastrado.",
                          });
                        }}
                        className="text-amberdeep hover:underline font-medium text-xs"
                      >
                        + Agendar Vaga
                      </button>
                    </div>
                  )}
                </div>

                {/* Lado Direito: A Mensagem no WhatsApp Real do Paciente */}
                <div className="lg:col-span-5 rounded-2xl border border-line2/80 bg-paper p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 border-b border-line2/50 pb-3 mb-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-emerald-600/15 text-emerald-700">
                        <MessageCircle className="size-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink">
                          WhatsApp Oficial do Consultório
                        </h4>
                        <p className="text-[10px] text-inksoft">
                          Disparado automaticamente pelo Agenda Cardio
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Mensagem do Sistema */}
                      <div className="rounded-2xl rounded-tl-none bg-card border border-line2/70 p-3 text-ink leading-relaxed shadow-2xs">
                        <p className="font-semibold text-ink">Olá, Dona Lourdes! Tudo bem? 🩺</p>
                        <p className="mt-1 text-inksoft">
                          Lembramos de seu exame de <strong>Holter 24h</strong> amanhã, às{" "}
                          <strong>08:30</strong>.
                        </p>
                        <div className="mt-1.5 rounded-lg bg-amber/10 border border-amber/20 p-1.5 text-[11px] text-amberdeep">
                          💡 <strong>Dica de preparo:</strong> Por favor, venha com camisa de botões
                          na frente para facilitar a fixação dos eletrodos.
                        </div>
                        <p className="mt-1.5 text-inksoft">
                          Podemos confirmar sua presença? Basta responder <strong>SIM</strong>.
                        </p>
                        <span className="mt-1 block text-[10px] text-right text-inksoft">
                          08:02
                        </span>
                      </div>

                      {/* Resposta do Paciente */}
                      {pacienteSimuladoConfirmado ? (
                        <div className="rounded-2xl rounded-tr-none bg-emerald-600 text-white p-3 ml-6 shadow-2xs leading-relaxed">
                          <p className="font-medium">
                            Sim, confirmo com certeza! Já separei a camisa. Muito obrigada pelo
                            aviso!
                          </p>
                          <span className="mt-1 block text-[10px] text-right text-emerald-200">
                            08:14 · Confirmado no Sistema
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-line2 p-3 text-center">
                          <p className="text-[11px] text-inksoft mb-2">
                            O paciente responde pelo próprio WhatsApp e a agenda atualiza na hora:
                          </p>
                          <button
                            type="button"
                            onClick={handleSimularConfirmacao}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 text-xs font-semibold transition-all active:scale-95"
                          >
                            <Smartphone className="size-3.5" />
                            <span>Simular Resposta &ldquo;SIM&rdquo;</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line2/50 text-[11px] text-inksoft text-center">
                    Sem necessidade de celular pessoal da recepcionista. Tudo pelo painel.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARTÕES E DIRETÓRIO DE PACIENTES */}
          {tabAtiva === "pacientes" && (
            <div className="mt-6 space-y-5">
              {/* Barra de Busca de Pacientes */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-paper p-3 sm:p-4 border border-line2/70">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-inksoft" />
                  <input
                    type="text"
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    placeholder="Pesquisar por nome, telefone ou convênio..."
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-line2 bg-card text-xs text-ink placeholder:text-inksoft focus:outline-none focus:border-amber"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-inksoft self-end sm:self-auto">
                  <span className="size-2 rounded-full bg-ok" />
                  <span>Fichas ágeis com histórico de exames e WhatsApp direto</span>
                </div>
              </div>

              {/* Grid dos Cartões dos Pacientes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cartão de Paciente 1 */}
                <div className="rounded-2xl border border-line2 bg-card p-4 flex flex-col justify-between hover:border-amber/50 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber/20 font-bold text-amberdeep text-xs">
                          LS
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink">Dona Lourdes Silveira</h3>
                          <span className="text-[11px] text-inksoft">71 anos • Bradesco Saúde</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ativa
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-inksoft mb-4">
                      <div className="flex items-center gap-1.5 text-ink">
                        <Phone className="size-3 text-amber" />
                        <span>(11) 98452-1100</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-inksoft" />
                        <span>
                          Último exame: <strong>Holter 24h</strong> (Amanhã)
                        </span>
                      </div>
                      <p className="text-[11px] rounded-lg bg-paper p-2 border border-line2/60 text-ink leading-tight">
                        📝 <strong>Nota da recepção:</strong> Prefere agendamentos na parte da
                        manhã. Paciente muito pontual.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line2/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success("Conversa aberta no WhatsApp")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Chamar no WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Novo Agendamento", {
                          description: "Abre o calendário pré-selecionando Dona Lourdes.",
                        })
                      }
                      className="text-[11px] font-medium text-amberdeep hover:underline"
                    >
                      Agendar Horário
                    </button>
                  </div>
                </div>

                {/* Cartão de Paciente 2 */}
                <div className="rounded-2xl border border-line2 bg-card p-4 flex flex-col justify-between hover:border-amber/50 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 text-xs">
                          AC
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Sr. Antônio Carlos Ferreira
                          </h3>
                          <span className="text-[11px] text-inksoft">58 anos • Unimed</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ativo
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-inksoft mb-4">
                      <div className="flex items-center gap-1.5 text-ink">
                        <Phone className="size-3 text-amber" />
                        <span>(11) 97120-4321</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-inksoft" />
                        <span>
                          Último exame: <strong>Ecocardiograma</strong>
                        </span>
                      </div>
                      <p className="text-[11px] rounded-lg bg-paper p-2 border border-line2/60 text-ink leading-tight">
                        📝 <strong>Nota da recepção:</strong> Faz acompanhamento periódico de sopro
                        cardíaco anualmente.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line2/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success("Conversa aberta no WhatsApp")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Chamar no WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Novo Agendamento", {
                          description: "Abre o calendário pré-selecionando Sr. Antônio.",
                        })
                      }
                      className="text-[11px] font-medium text-amberdeep hover:underline"
                    >
                      Agendar Horário
                    </button>
                  </div>
                </div>

                {/* Cartão de Paciente 3 */}
                <div className="rounded-2xl border border-line2 bg-card p-4 flex flex-col justify-between hover:border-amber/50 transition-all shadow-2xs">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700 text-xs">
                          HR
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-ink">Heloísa Helena Ramos</h3>
                          <span className="text-[11px] text-inksoft">42 anos • Particular</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber/15 text-amberdeep border border-amber/20">
                        Retorno Semestral
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-inksoft mb-4">
                      <div className="flex items-center gap-1.5 text-ink">
                        <Phone className="size-3 text-amber" />
                        <span>(11) 99312-8877</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-inksoft" />
                        <span>
                          Último exame: <strong>MAPA 24h</strong>
                        </span>
                      </div>
                      <p className="text-[11px] rounded-lg bg-paper p-2 border border-line2/60 text-ink leading-tight">
                        📝 <strong>Nota da recepção:</strong> Monitoramento de pico de pressão
                        noturna. Paciente particular.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line2/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toast.success("Conversa aberta no WhatsApp")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Chamar no WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Novo Agendamento", {
                          description: "Abre o calendário pré-selecionando Heloísa.",
                        })
                      }
                      className="text-[11px] font-medium text-amberdeep hover:underline"
                    >
                      Agendar Horário
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISÃO DO CRM COMPLETO (PIPELINE & RELACIONAMENTO) */}
          {tabAtiva === "crm" && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-paper p-3 sm:p-4 border border-line2/70 text-xs">
                <div>
                  <h3 className="font-bold text-ink text-sm">
                    Pipeline do CRM: Nenhum Paciente Esquecido
                  </h3>
                  <p className="text-inksoft mt-0.5">
                    Controle leads de novos pacientes, confirmações pendentes e lembretes de
                    retornos semestrais ou anuais.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 text-amberdeep font-semibold text-xs shrink-0">
                  <Sparkles className="size-3.5" />
                  <span>Incluso no Plano Avançado</span>
                </div>
              </div>

              {/* Colunas do Funil CRM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Coluna 1: Novos Contatos / Dúvidas */}
                <div className="rounded-2xl border border-line2 bg-paper/60 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                    <span className="text-xs font-bold text-ink">Novos Contatos</span>
                    <span className="size-5 rounded-full bg-card border border-line2 flex items-center justify-center text-[10px] font-bold text-inksoft">
                      2
                    </span>
                  </div>

                  <div className="rounded-xl border border-line2 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Mariana Castilho</span>
                      <span className="text-[10px] text-amberdeep font-medium">Orçamento</span>
                    </div>
                    <p className="text-[11px] text-inksoft mt-1">
                      Pediu valores de Ecocardiograma com Doppler.
                    </p>
                    <span className="text-[10px] text-inksoft block mt-2">Recebido há 40 min</span>
                  </div>

                  <div className="rounded-xl border border-line2 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Rogério Alencar</span>
                      <span className="text-[10px] text-blue-700 font-medium">Convênio</span>
                    </div>
                    <p className="text-[11px] text-inksoft mt-1">
                      Dúvida sobre cobertura SulAmérica para Holter.
                    </p>
                    <span className="text-[10px] text-inksoft block mt-2">Recebido há 2h</span>
                  </div>
                </div>

                {/* Coluna 2: Confirmação Pendente */}
                <div className="rounded-2xl border border-line2 bg-paper/60 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                    <span className="text-xs font-bold text-ink">Lembrete Enviado</span>
                    <span className="size-5 rounded-full bg-card border border-line2 flex items-center justify-center text-[10px] font-bold text-amberdeep">
                      1
                    </span>
                  </div>

                  <div className="rounded-xl border border-amber/30 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Dr. Paulo Mendes</span>
                      <span className="text-[10px] text-amberdeep font-medium">WhatsApp</span>
                    </div>
                    <p className="text-[11px] text-inksoft mt-1">
                      Aguardando confirmação para teste ergométrico de sexta.
                    </p>
                    <span className="text-[10px] text-amberdeep block mt-2">
                      ⏳ Disparado ontem às 17h
                    </span>
                  </div>
                </div>

                {/* Coluna 3: Confirmados na Agenda */}
                <div className="rounded-2xl border border-line2 bg-paper/60 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                    <span className="text-xs font-bold text-ink">Confirmados</span>
                    <span className="size-5 rounded-full bg-card border border-line2 flex items-center justify-center text-[10px] font-bold text-ok">
                      8
                    </span>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Dona Lourdes Silveira</span>
                      <span className="text-[10px] text-ok font-medium">100% OK</span>
                    </div>
                    <p className="text-[11px] text-inksoft mt-1">
                      Holter 24h · Segunda 08:30 · Instrução entregue.
                    </p>
                    <span className="text-[10px] text-ok block mt-2">
                      ✓ Presença confirmada no WhatsApp
                    </span>
                  </div>
                </div>

                {/* Coluna 4: Retorno Preventivo (Reativação de Pacientes) */}
                <div className="rounded-2xl border border-line2 bg-paper/60 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                    <span className="text-xs font-bold text-ink">Retorno Preventivo</span>
                    <span className="size-5 rounded-full bg-card border border-line2 flex items-center justify-center text-[10px] font-bold text-purple-700">
                      14
                    </span>
                  </div>

                  <div className="rounded-xl border border-line2 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">Beatriz Nogueira</span>
                      <span className="text-[10px] text-purple-700 font-medium">6 Meses</span>
                    </div>
                    <p className="text-[11px] text-inksoft mt-1">
                      Fez Ecocardiograma há 6 meses. Disparar convite de retorno anual.
                    </p>
                    <button
                      type="button"
                      onClick={() => toast.success("Lembrete de retorno programado via WhatsApp!")}
                      className="mt-2 text-[10px] font-semibold text-amberdeep hover:underline block"
                    >
                      Enviar Lembrete de Retorno &rarr;
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-card border border-line2 p-3 text-xs text-inksoft flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>
                  💡 <strong>Vantagem do Plano Avançado:</strong> O perfil de CRM fica na mesma
                  conta da clínica. Sem criar novo login ou alternar janelas.
                </span>
                <Link
                  to="/planos"
                  className="text-amberdeep hover:underline font-semibold shrink-0"
                >
                  Ver detalhes do Plano Avançado &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seção: O Que Fazemos (Apenas os 3 Serviços Reais Prestados) */}
      <section id="funcionalidades" className="py-16 border-y border-line2/60 bg-paper/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amberdeep">
              Nossos Serviços
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink">
              Tudo o que sua recepção precisa em um só lugar
            </h2>
            <p className="mt-3 text-sm text-inksoft">
              Sem sistemas pesados ou módulos desnecessários. Nós entregamos com perfeição
              exatamente as três coisas que transformam o dia a dia da clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Serviço 1: Agendamento Completo */}
            <div className="rounded-3xl border border-line2 bg-card p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="size-10 rounded-2xl bg-amber/15 text-amberdeep flex items-center justify-center mb-4 font-bold">
                  <Calendar className="size-5 text-amber" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  Agendamento Completo de Pacientes
                </h3>
                <p className="text-xs text-inksoft leading-relaxed mb-4">
                  Grade de horários dinâmica, pensada para exames cardiológicos (MAPA, Holter 24h,
                  Ecocardiograma) e consultas. Encaixes rápidos e controle total para a recepção.
                </p>
                <ul className="space-y-2 text-xs text-ink">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Visualização diária clara</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Durações por tipo de exame</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Ficha ágil do paciente</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Serviço 2: Confirmações no WhatsApp */}
            <div className="rounded-3xl border border-line2 bg-card p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="size-10 rounded-2xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center mb-4 font-bold">
                  <MessageCircle className="size-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  Confirmações via WhatsApp com Orientação
                </h3>
                <p className="text-xs text-inksoft leading-relaxed mb-4">
                  Disparos automáticos e acolhedores com as orientações pré-exame (roupas, horários
                  e cuidados). A resposta do paciente atualiza o status na agenda sem nenhuma
                  ligação manual.
                </p>
                <ul className="space-y-2 text-xs text-ink">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Lembretes automáticos prévios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Orientações de preparo inclusas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Fim das salas e horários ociosos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Serviço 3: CRM Completo */}
            <div className="rounded-3xl border border-line2 bg-card p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="size-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold">
                  <Kanban className="size-5 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">
                  CRM Completo & Lembretes de Retorno
                </h3>
                <p className="text-xs text-inksoft leading-relaxed mb-4">
                  Acompanhe pacientes interessados em exames particulares e reative pacientes
                  antigos com lembretes de exames semestrais ou anuais. Disponível no Plano
                  Avançado.
                </p>
                <ul className="space-y-2 text-xs text-ink">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Pipeline visual de pacientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Retornos preventivos de exames</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-ok shrink-0" />
                    <span>Na mesma conta (sem novo login)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos e Preços: Essencial (R$ 39,90) e Avançado (R$ 49,90) */}
      <section id="planos" className="py-16 sm:py-20 bg-paper">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amberdeep">
              Degustação de 30 Dias
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink">
              Planos objetivos e com o 1º mês 100% gratuito
            </h2>
            <p className="mt-2 text-sm text-inksoft">
              Sem surpresas ou fidelidade. Teste na prática em sua recepção durante 30 dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8 items-stretch">
            {/* Plano 1: Essencial */}
            <div className="rounded-3xl border border-line2 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-ink">Plano Essencial</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-line2/70 text-inksoft">
                    Recepção
                  </span>
                </div>
                <p className="text-xs text-inksoft">
                  Ideal para clínicas que desejam organizar a agenda e confirmar pacientes no
                  WhatsApp.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-paper/80 border border-line2/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-inksoft">R$</span>
                    <span className="text-3xl sm:text-4xl font-black text-ink font-mono tracking-tight">
                      39,90
                    </span>
                    <span className="text-xs text-inksoft">/mês</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ok">
                    <CheckCircle2 className="size-3.5" />
                    <span>1º Mês 100% Gratuito</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-ink mb-6">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>
                      <strong>1 Perfil de Atendente</strong> (Recepção)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Agendamento completo de consultas e exames</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Disparo e confirmações no WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Cartões e histórico dos pacientes</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-inksoft">
                    <span className="size-1.5 rounded-full bg-line2 ml-1 mr-1.5" />
                    <span>Módulo CRM não incluso neste plano</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-line2/60">
                <Link
                  to="/cadastro"
                  className="w-full inline-flex h-11 items-center justify-center rounded-xl border border-line2/90 bg-paper text-xs font-semibold text-ink hover:border-amber/60 hover:text-amberdeep transition-colors"
                >
                  Experimentar 30 Dias Grátis
                </Link>
              </div>
            </div>

            {/* Plano 2: Avançado */}
            <div className="relative rounded-3xl border-2 border-amber bg-card p-6 sm:p-8 flex flex-col justify-between shadow-md">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-0.5 text-[11px] font-semibold text-cream shadow-xs">
                Mais Escolhido • Com CRM Incluso
              </span>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-ink">Plano Avançado</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/15 text-amberdeep">
                    Com CRM Completo
                  </span>
                </div>
                <p className="text-xs text-inksoft">
                  Para clínicas que desejam captar novos pacientes e reativar retornos preventivos.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-paper/80 border border-line2/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-inksoft">R$</span>
                    <span className="text-3xl sm:text-4xl font-black text-ink font-mono tracking-tight">
                      49,90
                    </span>
                    <span className="text-xs text-inksoft">/mês</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ok">
                    <CheckCircle2 className="size-3.5" />
                    <span>1º Mês 100% Gratuito</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-ink mb-6">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>
                      <strong>1 Perfil de Atendente</strong> (Recepção)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-amberdeep">
                    <Check className="size-4 text-amberdeep shrink-0" />
                    <span>
                      <strong>1 Perfil CRM Incluso</strong> (na mesma conta, sem novo login)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Agendamento completo de consultas e exames</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Disparo e confirmações no WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-ok shrink-0" />
                    <span>Funil de captação e lembretes de retorno preventivo</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-line2/60">
                <Link
                  to="/cadastro"
                  className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink text-xs font-semibold text-cream shadow-xs hover:bg-ink/90 transition-colors"
                >
                  <Sparkles className="size-3.5 text-amber" />
                  <span>Experimentar 30 Dias Grátis</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dúvidas Frequentes */}
      <section id="duvidas" className="py-16 sm:py-20 border-t border-line2/60 bg-card/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amberdeep">
              Perguntas Frequentes
            </span>
            <h2 className="mt-2 text-2xl font-bold text-ink">Dúvidas comuns sobre o sistema</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                p: "Preciso cadastrar cartão de crédito para iniciar os 30 dias gratuitos?",
                r: "Não. Você tem 30 dias de acesso sem necessidade de informar cartão de crédito. Se quiser continuar após o período, você escolhe seu plano.",
              },
              {
                p: "Como funciona a confirmação pelo WhatsApp?",
                r: "O sistema envia um lembrete educado com a data, horário e orientações do exame (como usar camisa de botões no Holter). O paciente responde e a confirmação é registrada automaticamente na agenda.",
              },
              {
                p: "No Plano Avançado, o atendente precisa criar uma nova conta para usar o CRM?",
                r: "Não! O perfil de CRM fica vinculado diretamente na mesma conta. Não é necessário criar outro login, memorizar outra senha ou abrir outra janela.",
              },
              {
                p: "Quais são os únicos serviços oferecidos pelo sistema?",
                r: "Prestamos exclusivamente o Aplicativo completo de agendamento de pacientes, as Confirmações de agendamento via WhatsApp e o CRM completo.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line2/80 bg-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full p-4 sm:p-5 text-left text-sm font-semibold text-ink flex items-center justify-between gap-4"
                >
                  <span>{faq.p}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-inksoft transition-transform shrink-0",
                      faqAberto === i && "rotate-180 text-amberdeep",
                    )}
                  />
                </button>
                {faqAberto === i && (
                  <div className="px-4 pb-5 text-xs sm:text-sm text-inksoft leading-relaxed border-t border-line2/40 pt-3">
                    {faq.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convite Final Calmo */}
      <section className="py-16 sm:py-20 bg-ink text-cream text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Leve tranquilidade e organização para a recepção da sua clínica.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-cream/80 leading-relaxed">
            Comece hoje seus 30 dias de degustação gratuita. Menos faltas, comunicação educada no
            WhatsApp e pacientes fidelizados no CRM.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/cadastro"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber px-6 text-xs sm:text-sm font-semibold text-ink shadow-sm hover:bg-amber/90 transition-colors active:scale-95"
            >
              <span>Começar degustação gratuita de 30 dias</span>
              <ArrowRight className="size-4 text-ink" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cream/20 bg-cream/10 px-5 text-xs sm:text-sm font-medium text-cream hover:bg-cream/15 transition-colors active:scale-95"
            >
              <Lock className="size-3.5 text-amber" />
              <span>Já tenho conta</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Rodapé Simples e Discreto */}
      <footer className="border-t border-line2/60 bg-paper py-8 text-xs text-inksoft">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-amber" />
            <span className="font-semibold text-ink">Agenda Cardio</span>
            <span className="text-line2">•</span>
            <span>Agendamento, Confirmações no WhatsApp e CRM</span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <Link to="/login" className="hover:text-ink transition-colors">
              Acessar
            </Link>
            <Link to="/cadastro" className="hover:text-ink transition-colors">
              Cadastrar
            </Link>
            {isAuthenticated && (
              <Link to="/agenda" className="hover:text-ink transition-colors">
                Agenda
              </Link>
            )}
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
