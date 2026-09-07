import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso à Plataforma — AgendaCardio PRO" },
      {
        name: "description",
        content:
          "Acesso seguro e restrito para corpo clínico, cardiologistas e equipe de recepção. Padrão CFM e LGPD com autenticação criptografada.",
      },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "register" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Loading indicator
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Simular Login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Preencha seu e-mail institucional e senha para entrar.");
      return;
    }

    setIsLoading(true);
    setLoadingType("login");

    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      toast.success("Login efetuado com sucesso! Redirecionando para a agenda...", {
        icon: <CheckCircle2 className="size-4 text-[#3E6748]" />,
      });
      navigate({ to: "/agenda" });
    }, 900);
  };

  // Simular Cadastro
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    if (registerPassword.length < 6) {
      toast.error("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      toast.error("As senhas informadas não conferem.");
      return;
    }
    if (!acceptTerms) {
      toast.error("É necessário concordar com os Termos de Uso e Sigilo Médico LGPD.");
      return;
    }

    setIsLoading(true);
    setLoadingType("register");

    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      toast.success("Conta criada com sucesso! Seja bem-vindo à AgendaCardio PRO.", {
        icon: <CheckCircle2 className="size-4 text-[#3E6748]" />,
      });
      navigate({ to: "/agenda" });
    }, 1100);
  };

  // Simular Recuperação de Senha
  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Informe seu e-mail institucional ou CRM cadastrado.");
      return;
    }

    setIsLoading(true);
    setLoadingType("forgot");

    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      setForgotSubmitted(true);
      toast.success("Instruções de redefinição enviadas para seu e-mail!");
    }, 850);
  };

  // Simular Login com Google
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setLoadingType("google");

    setTimeout(() => {
      setIsLoading(false);
      setLoadingType(null);
      toast.success("Autenticação com Google autorizada. Entrando na clínica...", {
        icon: <CheckCircle2 className="size-4 text-[#3E6748]" />,
      });
      navigate({ to: "/agenda" });
    }, 1000);
  };

  // Acesso rápido de demonstração médica
  const handleQuickDemo = (role: "medico" | "recepcao") => {
    if (role === "medico") {
      setLoginEmail("dr.roberto@clinica.cardio.br");
      setLoginPassword("CardioPro@2026");
      toast.info("Credenciais de Demonstração (Médico) preenchidas.");
    } else {
      setLoginEmail("recepcao@clinica.cardio.br");
      setLoginPassword("Recepcao@2026");
      toast.info("Credenciais de Demonstração (Recepção) preenchidas.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FBF7F0] text-[#2C2018] antialiased selection:bg-[#8E3E1E]/20 selection:text-[#8E3E1E] dark:bg-[#16130f] dark:text-[#f3ede1]">
      {/* Background Decorativo Médico — Sutil e Não Ofuscante */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/2 translate-x-1/2 size-[650px] rounded-full bg-[#8E3E1E]/5 blur-3xl dark:bg-[#8E3E1E]/10" />
        <div className="absolute top-1/3 left-10 size-96 rounded-full bg-[#3E6748]/4 blur-3xl dark:bg-[#3E6748]/8" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-[#B4691B]/5 blur-3xl dark:bg-[#B4691B]/10" />

        {/* Linha de Traçado Eletrocardiograma Decorativa */}
        <div className="absolute top-28 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5DCBA]/70 to-transparent dark:via-[#3a3528]" />
      </div>

      {/* Barra de Navegação Superior Minimalista */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Voltar ao início</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-medium text-[#968374] dark:text-[#7f7163] sm:inline-block">
              Ambiente Criptografado TLS 1.3
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Conteúdo Central: Card de Autenticação */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-6 sm:px-0">
        <div className="overflow-hidden rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-xl backdrop-blur-md transition-all duration-300 dark:border-[#3a3528] dark:bg-[#1f1b14]">
          {/* Topo do Card com Identidade da Clínica */}
          <div className="border-b border-[#E5DCBA]/70 bg-gradient-to-b from-[#FBF7F0] to-[#FFFFFF] p-6 text-center dark:border-[#3a3528] dark:from-[#252018] dark:to-[#1f1b14]">
            <div className="mx-auto mb-3 flex items-center justify-center">
              <Link to="/" className="inline-block transition-transform hover:scale-105">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WSB58ZRsIdvurQE-aa7TCY80ztZrq6IibfHZ9R8pmqbSTndk7ix7aKgANe4FPzK2P_FBAQvItY5KVJ_etMqr6I9RPsJlINGCRor1GZqnQWFyPjR-SCWaI4ymo5h7isL3FMs1dgqexq4UP7SWv4zT0MOEySu2l-Rm9HhXxbxF_aKLoC-jHeIUTzPYQdZxfOb8HLWJiHiZyY0r_HBHeh4WzkELoekl4x6ZlXwtht_6dWPQDsAF-bgGC2rQ"
                  alt="AgendaCardio PRO"
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>

            <h1 className="font-sans text-xl font-bold tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
              {mode === "login" && "Acesse sua Clínica"}
              {mode === "register" && "Cadastre sua Clínica"}
              {mode === "forgot" && "Recuperar Credenciais"}
            </h1>
            <p className="mt-1 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              {mode === "login" &&
                "Entre com suas credenciais médicas para gerenciar a agenda diária."}
              {mode === "register" &&
                "Crie sua conta profissional e inicie seu 1 mês de teste gratuito."}
              {mode === "forgot" && "Enviaremos um link de redefinição com chave temporária."}
            </p>

            {/* Alternador de Modos (Fazer Login / Criar Conta) */}
            {mode !== "forgot" && (
              <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#E5DCBA] bg-[#F3ECE0] p-1 text-xs font-semibold dark:border-[#3a3528] dark:bg-[#28221a]">
                <button
                  type="button"
                  id="auth-tab-login"
                  onClick={() => setMode("login")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all duration-200",
                    mode === "login"
                      ? "bg-[#FFFFFF] text-[#8E3E1E] shadow-xs font-bold dark:bg-[#1f1b14] dark:text-[#d97750]"
                      : "text-[#6B5A4E] hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]",
                  )}
                >
                  <Lock className="size-3.5" />
                  <span>Fazer Login</span>
                </button>

                <button
                  type="button"
                  id="auth-tab-register"
                  onClick={() => setMode("register")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all duration-200",
                    mode === "register"
                      ? "bg-[#FFFFFF] text-[#8E3E1E] shadow-xs font-bold dark:bg-[#1f1b14] dark:text-[#d97750]"
                      : "text-[#6B5A4E] hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]",
                  )}
                >
                  <User className="size-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>
            )}
          </div>

          {/* Corpo do Formulário */}
          <div className="p-6 sm:p-7">
            {/* BOTÃO LOGIN COM CONTA GOOGLE (Visível em login e cadastro) */}
            {mode !== "forgot" && (
              <div className="mb-5">
                <button
                  type="button"
                  id="auth-google-button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5DCBA] bg-white py-2.5 px-4 text-xs font-bold text-[#2C2018] shadow-xs transition-all duration-200 hover:border-[#8E3E1E]/40 hover:bg-[#FBF7F0] hover:shadow-sm active:scale-[0.99] disabled:opacity-60 dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:hover:bg-[#2e281e]"
                >
                  {isLoading && loadingType === "google" ? (
                    <RefreshCw className="size-4 animate-spin text-[#8E3E1E] dark:text-[#d97750]" />
                  ) : (
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="size-4 shrink-0 transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span>
                    {mode === "login"
                      ? "Entrar com a Conta Google"
                      : "Cadastrar com a Conta Google"}
                  </span>
                </button>
              </div>
            )}

            {/* CASO 1: FORMULÁRIO DE LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Campo E-mail / CRM */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    E-mail ou CRM
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="login-email"
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="exemplo@clinica.cardio.br ou CRM/SP 123456"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54] dark:focus:border-[#d97750] dark:focus:ring-[#d97750]"
                    />
                  </div>
                </div>

                {/* Campo Senha com Mostrar/Ocultar */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                    >
                      Senha de Acesso
                    </label>
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] font-semibold text-[#8E3E1E] hover:underline dark:text-[#d97750]"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-10 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54] dark:focus:border-[#d97750] dark:focus:ring-[#d97750]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968374] hover:text-[#2C2018] dark:hover:text-[#f3ede1]"
                      title={showLoginPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Checkbox "Permanecer conectado" */}
                <div className="flex items-center justify-between pt-1">
                  <label
                    htmlFor="remember-me"
                    className="flex cursor-pointer select-none items-center gap-2"
                  >
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-[#E5DCBA] text-[#8E3E1E] focus:ring-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#252018]"
                    />
                    <span className="text-xs text-[#6B5A4E] dark:text-[#baa998]">
                      Permanecer conectado
                    </span>
                  </label>

                  <span className="text-[10px] text-[#968374] dark:text-[#7f7163]">
                    30 dias de sessão
                  </span>
                </div>

                {/* Botão de Submissão Login */}
                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isLoading}
                  className="btn-shimmer-effect mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
                >
                  {isLoading && loadingType === "login" ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Validando Acesso...</span>
                    </>
                  ) : (
                    <>
                      <HeartPulse className="size-4" />
                      <span>Acessar Consultório & Agenda</span>
                    </>
                  )}
                </button>

                {/* Acesso rápido para testes em modo dev */}
                <div className="mt-4 rounded-xl border border-[#E5DCBA]/60 bg-[#FBF7F0]/80 p-3 dark:border-[#3a3528] dark:bg-[#1a1712]">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#968374] dark:text-[#7f7163]">
                    Atalhos de Acesso Rápido (Demonstração):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("medico")}
                      className="rounded-lg border border-[#E5DCBA] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2C2018] hover:border-[#8E3E1E] hover:text-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:hover:border-[#d97750] dark:hover:text-[#d97750]"
                    >
                      🩺 Cardiologista (Dr. Roberto)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo("recepcao")}
                      className="rounded-lg border border-[#E5DCBA] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2C2018] hover:border-[#3E6748] hover:text-[#3E6748] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:hover:border-[#67a074] dark:hover:text-[#67a074]"
                    >
                      📋 Recepção Clínica
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* CASO 2: FORMULÁRIO DE CRIAR CONTA */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Usuário ou Nome do Médico */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    Usuário ou nome do médico
                  </label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Ex: Dr. Fernando ou recepcao.cardio"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54]"
                    />
                  </div>
                </div>

                {/* E-mail Profissional */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    E-mail Profissional
                  </label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="contato@clinicacardio.com.br"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54]"
                    />
                  </div>
                </div>

                {/* Senhas */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="register-password"
                      className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                    >
                      Criar Senha
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Mín. 6 dígitos"
                        className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 px-3 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                    >
                      Confirmar Senha
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="register-confirm-password"
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 px-3 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                      />
                    </div>
                  </div>
                </div>

                {/* Alternador de exibição de senha */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="flex items-center gap-1 text-[11px] text-[#968374] hover:text-[#2C2018] dark:hover:text-[#f3ede1]"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    <span>{showRegisterPassword ? "Ocultar senhas" : "Ver senhas digitadas"}</span>
                  </button>
                </div>

                {/* Termos CFM & LGPD */}
                <div className="rounded-xl border border-[#E5DCBA]/70 bg-[#FBF7F0]/60 p-3 dark:border-[#3a3528] dark:bg-[#1a1712]">
                  <label htmlFor="accept-terms" className="flex items-start gap-2 cursor-pointer">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-[#E5DCBA] text-[#8E3E1E] focus:ring-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#252018]"
                    />
                    <span className="text-[11px] leading-tight text-[#6B5A4E] dark:text-[#baa998]">
                      Concordo com os <strong>Termos de Uso</strong> e confirmo responsabilidade
                      médica sob a resolução <strong>CFM 2.314/2022</strong> e sigilo{" "}
                      <strong>LGPD</strong>.
                    </span>
                  </label>
                </div>

                {/* Botão de Submissão Cadastro */}
                <button
                  type="submit"
                  id="btn-submit-register"
                  disabled={isLoading}
                  className="btn-shimmer-effect mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
                >
                  {isLoading && loadingType === "register" ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Criando sua Clínica...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Criar Conta e Iniciar 1 Mês de Teste Gratuito</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* CASO 3: FORMULÁRIO DE ESQUECEU A SENHA */}
            {mode === "forgot" && (
              <div className="space-y-4">
                {forgotSubmitted ? (
                  <div className="rounded-2xl border border-[#3E6748]/30 bg-[#3E6748]/10 p-5 text-center dark:border-[#3E6748]/40 dark:bg-[#3E6748]/20">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#3E6748] text-white shadow-xs">
                      <Check className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                      E-mail de Recuperação Enviado
                    </h3>
                    <p className="mt-1.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
                      Enviamos um link seguro para <strong>{forgotEmail}</strong> com token válido
                      por 30 minutos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSubmitted(false);
                        setMode("login");
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2C2018] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#8E3E1E] dark:bg-[#8E3E1E] dark:hover:bg-[#a34824]"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Voltar para o Login</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="rounded-xl border border-[#B4691B]/30 bg-[#FCF5E8] p-3 text-[11px] text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#d48c3b]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <span>
                          Para segurança do prontuário médico, enviaremos um link de redefinição com
                          autenticação de duplo fator.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                      >
                        E-mail Institucional ou CRM
                      </label>
                      <div className="relative mt-1.5">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                        <input
                          id="forgot-email"
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="seu.email@clinica.cardio.br"
                          className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-submit-forgot"
                      disabled={isLoading}
                      className="btn-shimmer-effect flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824]"
                    >
                      {isLoading && loadingType === "forgot" ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Gerando Link Seguro...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="size-4" />
                          <span>Enviar Link de Recuperação</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B5A4E] hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
                      >
                        <ArrowLeft className="size-3.5" />
                        <span>Lembrou da senha? Voltar ao login</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Rodapé de Confiança e Certificação CFM */}
          <div className="border-t border-[#E5DCBA]/70 bg-[#FBF7F0]/70 p-4 text-center dark:border-[#3a3528] dark:bg-[#1a1712]/80">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#3E6748] dark:text-[#67a074]">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Conformidade Médica CFM 2.314/2022 & LGPD</span>
            </div>
            <p className="mt-0.5 text-[10px] text-[#968374] dark:text-[#7f7163]">
              Dados de saúde e agendas clínicas protegidos por criptografia de ponta a ponta.
            </p>
          </div>
        </div>

        {/* Rodapé Externo com Copyright */}
        <div className="mt-6 text-center text-xs text-[#968374] dark:text-[#7f7163]">
          <p>© 2026 AgendaCardio PRO. Todos os direitos reservados.</p>
        </div>
      </main>

      {/* Espaço Vazio de Balanceamento */}
      <div className="h-6" />
    </div>
  );
}
