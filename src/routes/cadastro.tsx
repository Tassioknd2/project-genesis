import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { UserRole } from "@/server/domain/auth.types";
import { apiClient } from "@/lib/api-client";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  Gift,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro Clínico e 1º Mês Grátis — Agenda Cardio" },
      {
        name: "description",
        content:
          "Crie sua conta na Agenda Cardio e aproveite 30 dias de acesso gratuito sem necessidade de cartão de crédito.",
      },
    ],
  }),
  component: CadastroPageWithGuard,
});

function CadastroPageWithGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Se o usuário já estiver logado E com o e-mail verificado, vai direto para a agenda
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.emailVerificado) {
      router.navigate({ to: "/agenda" });
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <CadastroPage />;
}

type OnboardingStep = "dados" | "verificar_email" | "boas_vindas_trial";

export function CadastroPage() {
  const router = useRouter();
  const { register, verifyEmail, sendVerificationCode, setCurrentProfile, user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("dados");

  // Dados do Passo 1
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("medico");
  const [crm, setCrm] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Dados do Passo 2 (Código de Verificação de 6 dígitos)
  const [codigoDigitos, setCodigoDigitos] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [segundosParaReenvio, setSegundosParaReenvio] = useState<number>(60);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);

  // Sincroniza se o usuário já estiver logado mas com e-mail não verificado
  useEffect(() => {
    if (user && !user.emailVerificado && step === "dados") {
      setEmail(user.email);
      setNome(user.nome);
      setRole(user.role);
      setStep("verificar_email");
      // Solicita código de teste
      sendVerificationCode(user.email)
        .then((res) => {
          if (res.previewCode) setPreviewCode(res.previewCode);
        })
        .catch(() => {});
    }
  }, [user, step, sendVerificationCode]);

  // Contagem regressiva para reenvio do código
  useEffect(() => {
    if (step === "verificar_email" && segundosParaReenvio > 0) {
      const timer = setTimeout(() => {
        setSegundosParaReenvio((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step, segundosParaReenvio]);

  // Validações em tempo real da senha
  const temOitoCaracteres = password.length >= 8;
  const temMaiuscula = /[A-Z]/.test(password);
  const temNumero = /[0-9]/.test(password);
  const senhasConferem = password === confirmPassword && confirmPassword.length > 0;

  // Formatação da data limite de 30 dias de trial
  const dataFimTrial = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // --- Submissão do Passo 1: Cadastro ---
  async function handleCadastroSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || !email.trim() || !password) {
      setErro("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!temOitoCaracteres || !temMaiuscula || !temNumero) {
      setErro("A senha não atende aos requisitos mínimos de segurança.");
      return;
    }

    if (password !== confirmPassword) {
      setErro("As senhas digitadas não coincidem.");
      return;
    }

    if (!aceitouTermos) {
      setErro("É obrigatório aceitar o termo de conformidade LGPD.");
      return;
    }

    if (role === "medico" && !crm.trim()) {
      setErro("O registro CRM é obrigatório para o perfil Médico.");
      return;
    }

    setCarregando(true);
    try {
      const newUser = await register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        telefone: telefone.trim() || undefined,
        crm: role === "medico" ? crm.trim() : undefined,
      });

      // Dispara envio do código de verificação para o e-mail recém cadastrado
      const codeResult = await sendVerificationCode(newUser.email).catch(() => null);
      if (codeResult?.previewCode) {
        setPreviewCode(codeResult.previewCode);
      }

      toast.success("Conta criada com sucesso!", {
        description: `Enviamos um código de confirmação para ${newUser.email}.`,
      });

      setSegundosParaReenvio(60);
      setStep("verificar_email");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      setErro(msg);
      toast.error("Erro no cadastro", { description: msg });
    } finally {
      setCarregando(false);
    }
  }

  // --- Manipuladores de Input dos 6 dígitos ---
  function handleDigitoChange(index: number, value: string) {
    // Se o usuário digitou múltiplos caracteres (ex: autocompletar ou colar rápido)
    const digitosLimpos = value.replace(/\D/g, "");

    if (digitosLimpos.length > 1) {
      preencherCodigoCompleto(digitosLimpos);
      return;
    }

    const novoCodigo = [...codigoDigitos];
    novoCodigo[index] = digitosLimpos.slice(-1);
    setCodigoDigitos(novoCodigo);

    // Avança para o próximo campo se digitou um valor
    if (digitosLimpos && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !codigoDigitos[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      preencherCodigoCompleto(pastedData);
    }
  }

  function preencherCodigoCompleto(seisDigitos: string) {
    const chars = seisDigitos.split("").slice(0, 6);
    const novoCodigo = ["", "", "", "", "", ""];
    chars.forEach((c, idx) => {
      novoCodigo[idx] = c;
    });
    setCodigoDigitos(novoCodigo);

    // Foca no último campo preenchido ou no botão
    const proximoFoco = Math.min(chars.length, 5);
    inputRefs.current[proximoFoco]?.focus();

    if (chars.length === 6) {
      toast.info("Código preenchido!", {
        description: "Clique em Confirmar E-mail para ativar sua conta.",
      });
    }
  }

  // --- Reenvio de Código ---
  async function handleReenviarCodigo() {
    if (segundosParaReenvio > 0 || reenviandoCodigo) return;

    setReenviandoCodigo(true);
    try {
      const res = await sendVerificationCode(email);
      if (res.previewCode) {
        setPreviewCode(res.previewCode);
      }
      setSegundosParaReenvio(60);
      toast.success("Novo código enviado com sucesso!", {
        description: `Verifique a caixa de entrada de ${email}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao reenviar código";
      toast.error(msg);
    } finally {
      setReenviandoCodigo(false);
    }
  }

  // --- Submissão da Verificação de E-mail ---
  async function handleVerificarCodigo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const codigoCompleto = codigoDigitos.join("");

    if (codigoCompleto.length < 6) {
      toast.error("Preencha todos os 6 dígitos do código enviado para seu e-mail.");
      return;
    }

    setVerificandoCodigo(true);
    try {
      await verifyEmail(codigoCompleto, email);

      // Garante que o perfil primário está carregado e selecionado
      const profiles = await apiClient.getProfiles().catch(() => []);
      if (profiles && profiles.length > 0) {
        const primary = profiles.find((p) => p.isPrimary) || profiles[0];
        setCurrentProfile(primary ?? null);
      }

      toast.success("E-mail verificado com sucesso!", {
        description: "Seu 1º Mês Grátis já está liberado.",
      });

      setStep("boas_vindas_trial");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Código de verificação incorreto.";
      toast.error("Falha na validação", { description: msg });
    } finally {
      setVerificandoCodigo(false);
    }
  }

  // --- Finalização: Acessar Agenda Diretamente ---
  async function handleAcessarAgenda() {
    // Garante que o perfil do titular esteja selecionado
    try {
      const profiles = await apiClient.getProfiles();
      if (profiles && profiles.length > 0) {
        const primary = profiles.find((p) => p.isPrimary) || profiles[0];
        setCurrentProfile(primary ?? null);
      }
    } catch {
      // fallback
    }

    toast.success("Bem-vindo(a) à Agenda Cardiológica!", {
      description: "Aproveite seus 30 dias de degustação gratuita.",
    });

    // Direciona DIRETAMENTE para a Agenda, sem passar pelo seletor estilo Netflix
    router.navigate({ to: "/agenda" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink transition-colors selection:bg-amber/20 selection:text-ink">
      {/* Topo / Barra Institucional */}
      <header className="border-b border-line2/60 bg-paper/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-ink font-mono text-sm font-black text-cream shadow-sm">
              <HeartPulse className="size-5 text-amber" />
              <div className="absolute -bottom-1 -right-1 size-2.5 rounded-full border-2 border-paper bg-ok" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[16px] font-black uppercase tracking-tight text-ink">
                  Agenda<span className="text-amber">Cardio</span>
                </span>
                <span className="rounded-md bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-extrabold uppercase text-amberdeep">
                  Pro
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-inksoft">
                Cardiologia & Diagnóstico
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {step === "dados" && (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line2/80 bg-card px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-2xs transition-all hover:border-amber/60 hover:bg-paper hover:text-amberdeep active:scale-95"
              >
                <ArrowLeft className="size-3.5" />
                <span>Já tenho conta</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Stepper Superior de Acompanhamento */}
      <div className="border-b border-line2/40 bg-card/60 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 font-mono text-xs">
          <div
            className={`flex items-center gap-2 ${step === "dados" ? "text-amber font-bold" : "text-inksoft"}`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                step === "dados"
                  ? "bg-amber text-ink font-black"
                  : step === "verificar_email" || step === "boas_vindas_trial"
                    ? "bg-ok text-cream"
                    : "bg-line2 text-inksoft"
              }`}
            >
              {step === "verificar_email" || step === "boas_vindas_trial" ? (
                <Check className="size-3" />
              ) : (
                "1"
              )}
            </span>
            <span className="hidden sm:inline">Cadastro Clínico</span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-line2" />

          <div
            className={`flex items-center gap-2 ${step === "verificar_email" ? "text-amber font-bold" : "text-inksoft"}`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                step === "verificar_email"
                  ? "bg-amber text-ink font-black"
                  : step === "boas_vindas_trial"
                    ? "bg-ok text-cream"
                    : "bg-line2 text-inksoft"
              }`}
            >
              {step === "boas_vindas_trial" ? <Check className="size-3" /> : "2"}
            </span>
            <span className="hidden sm:inline">Confirmar E-mail</span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-line2" />

          <div
            className={`flex items-center gap-2 ${step === "boas_vindas_trial" ? "text-amber font-bold" : "text-inksoft"}`}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
                step === "boas_vindas_trial"
                  ? "bg-ok text-cream font-black"
                  : "bg-line2 text-inksoft"
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">1º Mês Grátis</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal Adaptativo conforme a Etapa */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* ========================================================================= */}
          {/* ETAPA 1: Formulário de Cadastro Clínico                                    */}
          {/* ========================================================================= */}
          {step === "dados" && (
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-sm sm:p-8">
              {/* Badge de Oferta 1 Mês Grátis Sem Cartão */}
              <div className="mb-6 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber/40 bg-amber/10 px-3.5 py-1 text-xs font-semibold text-amberdeep">
                  <Gift className="size-4 text-amber" />
                  <span>
                    <strong>1 Mês Grátis:</strong> 30 dias sem necessidade de cartão
                  </span>
                </div>
              </div>

              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-ink font-mono text-cream shadow-2xs">
                  <Users className="size-6 text-amber" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  Criar Conta Clínica
                </h1>
                <p className="mt-1 text-xs text-inksoft">
                  Cadastre seu consultório e ative seu período de degustação gratuito de 30 dias
                </p>
              </div>

              {erro && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/20 dark:text-red-300">
                  <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">{erro}</div>
                </div>
              )}

              {/* Cadastro com Google */}
              <div className="mb-6">
                <GoogleSignInButton
                  role={role}
                  id="btn-google-register"
                  text="Cadastrar rapidamente com o Google"
                  onSuccess={() => {
                    toast.success("Conta provisionada com o Google!");
                    setStep("boas_vindas_trial");
                  }}
                />
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line2/60" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                    <span className="bg-card px-3 text-inksoft">ou preencha os dados abaixo</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCadastroSubmit} className="space-y-4">
                {/* Seleção de Perfil */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-inksoft mb-1.5">
                    Perfil de Atuação
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole("medico")}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                        role === "medico"
                          ? "border-amber bg-amber/10 text-ink shadow-2xs font-semibold"
                          : "border-line2/80 bg-paper text-inksoft hover:border-amber/50 hover:text-ink"
                      }`}
                    >
                      <Stethoscope className="size-4.5 text-amber shrink-0" />
                      <div>
                        <div className="text-xs font-bold leading-tight text-ink">
                          Cardiologista
                        </div>
                        <div className="text-[10px] text-inksoft">Atendimento e prontuário</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("recepcionista")}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                        role === "recepcionista"
                          ? "border-amber bg-amber/10 text-ink shadow-2xs font-semibold"
                          : "border-line2/80 bg-paper text-inksoft hover:border-amber/50 hover:text-ink"
                      }`}
                    >
                      <Users className="size-4.5 text-amber shrink-0" />
                      <div>
                        <div className="text-xs font-bold leading-tight text-ink">Recepção</div>
                        <div className="text-[10px] text-inksoft">Agendamentos e triagem</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Nome Completo */}
                <div>
                  <label
                    htmlFor="cad-nome"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                    <input
                      id="cad-nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder={
                        role === "medico" ? "Ex: Dr. Roberto Alcantara" : "Ex: Mariana Silva"
                      }
                      className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                    />
                  </div>
                </div>

                {/* CRM se Médico */}
                {role === "medico" && (
                  <div>
                    <label
                      htmlFor="cad-crm"
                      className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                    >
                      Registro CRM <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <Stethoscope className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                      <input
                        id="cad-crm"
                        type="text"
                        required
                        value={crm}
                        onChange={(e) => setCrm(e.target.value)}
                        placeholder="Ex: SP-123456"
                        className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                      />
                    </div>
                  </div>
                )}

                {/* E-mail */}
                <div>
                  <label
                    htmlFor="cad-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    E-mail Clínico / Profissional <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                    <input
                      id="cad-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doutor@clinicacardio.com.br"
                      className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Enviaremos um código de 6 dígitos para este e-mail para validar sua conta.
                  </p>
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label
                    htmlFor="cad-tel"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Telefone / WhatsApp
                  </label>
                  <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                    <input
                      id="cad-tel"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label
                    htmlFor="cad-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Senha de Acesso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                    <input
                      id="cad-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 dígitos, letra e número"
                      className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-inksoft hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Indicadores de Requisito de Senha */}
                  {password.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-mono">
                      <span
                        className={`flex items-center gap-1 ${temOitoCaracteres ? "text-ok font-bold" : "text-inksoft"}`}
                      >
                        <CheckCircle2 className="size-3" /> 8+ dígitos
                      </span>
                      <span
                        className={`flex items-center gap-1 ${temMaiuscula ? "text-ok font-bold" : "text-inksoft"}`}
                      >
                        <CheckCircle2 className="size-3" /> Letra Maiúscula
                      </span>
                      <span
                        className={`flex items-center gap-1 ${temNumero ? "text-ok font-bold" : "text-inksoft"}`}
                      >
                        <CheckCircle2 className="size-3" /> Número
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label
                    htmlFor="cad-conf-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Confirmar Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                    <input
                      id="cad-conf-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha escolhida"
                      className="w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                    />
                  </div>
                  {confirmPassword.length > 0 && !senhasConferem && (
                    <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                      As senhas não coincidem.
                    </p>
                  )}
                </div>

                {/* Termos de Uso e LGPD */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-inksoft">
                    <input
                      type="checkbox"
                      required
                      checked={aceitouTermos}
                      onChange={(e) => setAceitouTermos(e.target.checked)}
                      className="mt-0.5 rounded border-line2 text-amber focus:ring-amber"
                    />
                    <span>
                      Declaro conformidade com as normas do CFM e termos da LGPD de sigilo médico.
                    </span>
                  </label>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={carregando || !senhasConferem || !aceitouTermos}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-mono text-xs font-black uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-amber" />
                      <span>Gerando Código de Acesso...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Conta & Receber Código por E-mail</span>
                      <ArrowRight className="size-4 text-amber" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 2: Confirmação de E-mail com Código de 6 Dígitos                     */}
          {/* ========================================================================= */}
          {step === "verificar_email" && (
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber/15 text-amberdeep border border-amber/30 shadow-2xs">
                  <Mail className="size-7 text-amber" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  Confirme seu E-mail Clínico
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-inksoft leading-relaxed">
                  Enviamos um código de segurança de 6 dígitos para{" "}
                  <strong className="text-ink font-semibold">{email}</strong>. Digite-o abaixo para
                  validar sua conta.
                </p>
              </div>

              {/* Banner de Dica de Demonstração (Permite teste imediato sem sair da tela) */}
              {previewCode && (
                <div className="mb-6 rounded-xl border border-amber/30 bg-amber/10 p-3.5 text-xs text-amberdeep">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber" />
                      Código de Demonstração Gerado:
                    </span>
                    <button
                      type="button"
                      onClick={() => preencherCodigoCompleto(previewCode)}
                      className="font-mono font-bold text-amber underline hover:text-amberdeep"
                    >
                      Preencher [{previewCode}]
                    </button>
                  </div>
                </div>
              )}

              {/* Caixas de 6 dígitos */}
              <form onSubmit={handleVerificarCodigo} className="space-y-6">
                <div>
                  <label className="block text-center text-xs font-semibold uppercase tracking-wider text-inksoft mb-3">
                    Digite o Código de 6 Dígitos
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {codigoDigitos.map((digito, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digito}
                        onChange={(e) => handleDigitoChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="size-11 sm:size-13 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border border-line2 bg-paper text-ink shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* Botão de Confirmação */}
                <button
                  type="submit"
                  disabled={verificandoCodigo || codigoDigitos.join("").length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-mono text-xs font-black uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {verificandoCodigo ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-amber" />
                      <span>Validando Código...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 text-ok" />
                      <span>Verificar Código e Ativar Conta</span>
                    </>
                  )}
                </button>

                {/* Reenvio com Contador */}
                <div className="pt-2 text-center">
                  {segundosParaReenvio > 0 ? (
                    <p className="font-mono text-xs text-inksoft">
                      Reenviar novo código em:{" "}
                      <strong className="text-ink font-bold">{segundosParaReenvio}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={reenviandoCodigo}
                      onClick={handleReenviarCodigo}
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amber hover:text-amberdeep hover:underline disabled:opacity-50"
                    >
                      {reenviandoCodigo ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Reenviando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="size-3.5" />
                          <span>Reenviar Código por E-mail</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 3: Boas-Vindas ao 1º Mês Grátis (Sem Cartão de Crédito)              */}
          {/* ========================================================================= */}
          {step === "boas_vindas_trial" && (
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-ok/15 text-ok border border-ok/30 shadow-2xs">
                  <CheckCircle2 className="size-8 text-ok" />
                </div>
                <span className="inline-block rounded-full bg-ok/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ok border border-ok/20 mb-2">
                  E-mail Confirmado com Sucesso
                </span>
                <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                  Seu 1º Mês Grátis está Ativado!
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-inksoft max-w-md mx-auto leading-relaxed">
                  Bem-vindo(a),{" "}
                  <strong className="text-ink font-semibold">{nome || "Doutor(a)"}</strong>! Você
                  tem 30 dias de acesso irrestrito sem custo e sem precisar cadastrar cartão.
                </p>
              </div>

              {/* Resumo dos Recursos Liberados */}
              <div className="mb-6 rounded-xl border border-line2/80 bg-paper p-4 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                  <span className="text-inksoft">Período de Degustação:</span>
                  <strong className="font-mono text-ok">30 Dias Gratuitos</strong>
                </div>
                <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                  <span className="text-inksoft">Válido até:</span>
                  <strong className="font-mono text-ink">{dataFimTrial}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-line2/60 pb-2">
                  <span className="text-inksoft">Cartão de Crédito:</span>
                  <strong className="text-ok font-semibold">Não exigido</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-inksoft">Recursos Inclusos:</span>
                  <span className="font-medium text-ink">Agenda, Prontuários & WhatsApp</span>
                </div>
              </div>

              {/* Informação sobre múltiplos perfis */}
              <div className="mb-6 rounded-xl border border-amber/25 bg-amber/5 p-3.5 text-[11px] text-inksoft leading-relaxed">
                <p className="flex items-start gap-2">
                  <Sparkles className="size-4 shrink-0 text-amber mt-0.5" />
                  <span>
                    <strong>Consultório em equipe?</strong> Quando desejar cadastrar outros
                    profissionais com e-mails separados (estilo Netflix), basta selecionar a
                    quantidade desejada na página de Planos.
                  </span>
                </p>
              </div>

              {/* Botão de Acesso Direto à Agenda */}
              <button
                type="button"
                onClick={handleAcessarAgenda}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 font-mono text-xs font-black uppercase tracking-wider text-cream shadow-md transition-all hover:bg-ink/90 active:scale-[0.99]"
              >
                <Calendar className="size-4 text-amber" />
                <span>Acessar Minha Agenda Cardiológica</span>
                <ArrowRight className="size-4 text-amber" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
