import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
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
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso à Plataforma — AgendaCardio PRO" },
      {
        name: "description",
        content:
          "Acesso seguro e restrito para corpo clínico, cardiologistas e equipe de recepção. Autenticação oficial com Supabase Auth sob diretrizes CFM e LGPD.",
      },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "login" | "register" | "forgot" | "reset" | "confirm_pending";

function AuthPage() {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    updatePassword,
    resendConfirmationEmail,
    signOut,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Register
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form states - Forgot & Reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states - Email confirmation pending & cooldown
  const [pendingEmail, setPendingEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState<string | null>(null);

  // Detecta fluxo de recuperação de senha por parâmetros de URL ou hash do Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes("type=recovery") || hash.includes("type=recovery")) {
        setMode("reset");
      }
    }
  }, []);

  // Timer de cooldown para reenvio de confirmação
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Se o usuário já estiver autenticado e não estiver no fluxo de redefinição de senha
  useEffect(() => {
    if (user && !authLoading && mode !== "reset") {
      toast.info("Você já está autenticado.", {
        description: `Conectado como ${user.user_metadata?.nome || user.email}.`,
      });
      navigate({ to: "/agenda" });
    }
  }, [user, authLoading, mode, navigate]);

  // Submissão de Login com Supabase Auth
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Preencha seu e-mail institucional e senha para entrar.");
      return;
    }

    setIsSubmitting(true);
    setSubmittingType("login");

    try {
      const { error } = await signInWithEmail(loginEmail, loginPassword);
      if (error) {
        toast.error(error);
        if (error.toLowerCase().includes("confirmado")) {
          setPendingEmail(loginEmail.trim());
          setMode("confirm_pending");
        }
      } else {
        toast.success("Login efetuado com sucesso!", {
          icon: <CheckCircle2 className="size-4 text-[#3E6748]" />,
        });
        navigate({ to: "/agenda" });
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  // Submissão de Cadastro com confirmação obrigatória de e-mail
  const handleRegister = async (e: FormEvent) => {
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

    setIsSubmitting(true);
    setSubmittingType("register");

    try {
      const { error, needsEmailConfirmation } = await signUpWithEmail(
        registerEmail,
        registerPassword,
        registerName,
      );

      if (error) {
        toast.error(error);
      } else if (needsEmailConfirmation) {
        setPendingEmail(registerEmail.trim());
        setMode("confirm_pending");
        toast.success("Conta criada! Confirmação enviada por e-mail.", {
          description: "Verifique sua caixa de entrada para ativar o acesso ao sistema.",
        });
      } else {
        toast.success("Conta criada com sucesso! Seja bem-vindo à AgendaCardio PRO.", {
          icon: <CheckCircle2 className="size-4 text-[#3E6748]" />,
        });
        navigate({ to: "/agenda" });
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  // Submissão de Recuperação de Senha anti-enumeração
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Informe seu e-mail cadastrado.");
      return;
    }

    setIsSubmitting(true);
    setSubmittingType("forgot");

    try {
      await sendPasswordReset(forgotEmail);
      setForgotSubmitted(true);
      toast.success("Instruções de redefinição enviadas para seu e-mail!");
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  // Submissão de Redefinição de Senha após recuperação
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas digitadas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    setSubmittingType("reset");

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Senha alterada com sucesso! Você já pode entrar com a nova senha.");
        setMode("login");
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  // Reenvio controlado de e-mail de confirmação
  const handleResendConfirmation = async () => {
    if (!pendingEmail) {
      toast.error("E-mail não identificado para reenvio.");
      return;
    }
    if (cooldown > 0) {
      toast.info(`Aguarde ${cooldown}s para solicitar um novo envio.`);
      return;
    }

    setIsSubmitting(true);
    setSubmittingType("resend");

    try {
      const { error } = await resendConfirmationEmail(pendingEmail);
      if (error) {
        toast.error(error);
      } else {
        toast.success("E-mail de confirmação reenviado com sucesso!");
        setCooldown(60);
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  // Login com Google via Supabase OAuth
  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setSubmittingType("google");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FBF7F0] text-[#2C2018] antialiased selection:bg-[#8E3E1E]/20 selection:text-[#8E3E1E] dark:bg-[#16130f] dark:text-[#f3ede1]">
      {/* Background Decorativo Médico */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/2 translate-x-1/2 size-[650px] rounded-full bg-[#8E3E1E]/5 blur-3xl dark:bg-[#8E3E1E]/10" />
        <div className="absolute top-1/3 left-10 size-96 rounded-full bg-[#3E6748]/4 blur-3xl dark:bg-[#3E6748]/8" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-[#B4691B]/5 blur-3xl dark:bg-[#B4691B]/10" />
        <div className="absolute top-28 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E5DCBA]/70 to-transparent dark:via-[#3a3528]" />
      </div>

      {/* Barra de Navegação Superior */}
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
              Autenticação Oficial Supabase TLS 1.3
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Conteúdo Central: Card de Autenticação */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-6 sm:px-0">
        {/* Banner Informativo se o Supabase precisar de chaves */}
        {!isConfigured && (
          <div className="mb-4 rounded-2xl border border-[#B4691B]/30 bg-[#FCF5E8] p-4 text-xs text-[#B4691B] dark:border-[#B4691B]/40 dark:bg-[#231b12] dark:text-[#e09848] shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-4.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conexão Supabase Pendente</p>
                <p className="mt-1 leading-relaxed opacity-90">
                  Para habilitar login, cadastro e envio de e-mails em produção, configure a
                  variável{" "}
                  <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-[10px] dark:bg-white/10">
                    VITE_SUPABASE_PUBLISHABLE_KEY
                  </code>{" "}
                  no painel de configurações ou no arquivo <code>.env</code>.
                </p>
              </div>
            </div>
          </div>
        )}

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
              {mode === "forgot" && "Recuperar Senha"}
              {mode === "reset" && "Definir Nova Senha"}
              {mode === "confirm_pending" && "Confirme seu E-mail"}
            </h1>
            <p className="mt-1 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              {mode === "login" &&
                "Entre com suas credenciais médicas para gerenciar a agenda diária."}
              {mode === "register" &&
                "Crie sua conta profissional e inicie seu 1 mês de teste gratuito."}
              {mode === "forgot" && "Enviaremos um link de redefinição seguro para seu e-mail."}
              {mode === "reset" && "Digite uma nova senha segura para acessar sua conta."}
              {mode === "confirm_pending" &&
                "Verifique o e-mail de ativação que enviamos para sua conta."}
            </p>

            {/* Alternador de Modos (Fazer Login / Criar Conta) */}
            {(mode === "login" || mode === "register") && (
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
            {/* BOTÃO LOGIN COM CONTA GOOGLE (OAuth PKCE) */}
            {(mode === "login" || mode === "register") && (
              <div className="mb-5">
                <button
                  type="button"
                  id="auth-google-button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5DCBA] bg-white py-2.5 px-4 text-xs font-bold text-[#2C2018] shadow-xs transition-all duration-200 hover:border-[#8E3E1E]/40 hover:bg-[#FBF7F0] hover:shadow-sm active:scale-[0.99] disabled:opacity-60 dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:hover:bg-[#2e281e]"
                >
                  {isSubmitting && submittingType === "google" ? (
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

                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-full border-t border-[#E5DCBA] dark:border-[#3a3528]" />
                  <span className="absolute bg-white px-3 text-[11px] font-medium text-[#968374] dark:bg-[#1f1b14] dark:text-[#7f7163]">
                    ou continue com e-mail
                  </span>
                </div>
              </div>
            )}

            {/* CASO 1: FORMULÁRIO DE LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    E-mail institucional
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="medico@clinica.cardio.br"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54] dark:focus:border-[#d97750] dark:focus:ring-[#d97750]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                    >
                      Senha de acesso
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
                      autoComplete="current-password"
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
                    Sessão segura
                  </span>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isSubmitting}
                  className="btn-shimmer-effect mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
                >
                  {isSubmitting && submittingType === "login" ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <HeartPulse className="size-4" />
                      <span>Acessar Consultório & Agenda</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* CASO 2: FORMULÁRIO DE CRIAR CONTA */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
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
                      placeholder="Ex: Dr. Fernando Cardoso ou Cardiologia Central"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:placeholder:text-[#6b5f54]"
                    />
                  </div>
                </div>

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
                        autoComplete="new-password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Mín. 6 caracteres"
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
                        autoComplete="new-password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 px-3 text-xs text-[#2C2018] placeholder:text-[#968374] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] transition-all dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                      />
                    </div>
                  </div>
                </div>

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
                    <span>{showRegisterPassword ? "Ocultar senhas" : "Ver senhas"}</span>
                  </button>
                </div>

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

                <button
                  type="submit"
                  id="btn-submit-register"
                  disabled={isSubmitting}
                  className="btn-shimmer-effect mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
                >
                  {isSubmitting && submittingType === "register" ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Cadastrando...</span>
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

            {/* CASO 3: CONFIRMAÇÃO OBRIGATÓRIA DE E-MAIL */}
            {mode === "confirm_pending" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#3E6748]/10 text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                  <Mail className="size-7" />
                </div>
                <h3 className="text-base font-bold text-[#2C2018] dark:text-[#f3ede1]">
                  Confirme seu E-mail
                </h3>
                <p className="text-xs leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                  Enviamos uma mensagem com link de ativação para{" "}
                  <strong className="text-[#2C2018] dark:text-[#f3ede1]">
                    {pendingEmail || "seu e-mail"}
                  </strong>
                  . Acesse sua caixa de entrada para validar sua conta antes de entrar.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isSubmitting || cooldown > 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5DCBA] bg-white py-2.5 px-4 text-xs font-bold text-[#2C2018] shadow-xs hover:border-[#8E3E1E] disabled:opacity-50 dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                  >
                    {isSubmitting && submittingType === "resend" ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    <span>
                      {cooldown > 0
                        ? `Aguarde ${cooldown}s para reenviar`
                        : "Reenviar e-mail de confirmação"}
                    </span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8E3E1E] hover:underline dark:text-[#d97750]"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Já confirmou? Ir para o login</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASO 4: FORMULÁRIO DE ESQUECEU A SENHA */}
            {mode === "forgot" && (
              <div className="space-y-4">
                {forgotSubmitted ? (
                  <div className="rounded-2xl border border-[#3E6748]/30 bg-[#3E6748]/10 p-5 text-center dark:border-[#3E6748]/40 dark:bg-[#3E6748]/20">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#3E6748] text-white shadow-xs">
                      <Check className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                      Solicitação Registrada
                    </h3>
                    <p className="mt-1.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
                      Se o e-mail informado estiver cadastrado em nossa base médica, enviamos o link
                      para redefinição de senha.
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
                          Para segurança do prontuário médico, enviaremos um link de uso único e
                          expiração automática.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                      >
                        E-mail Cadastrado
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
                      disabled={isSubmitting}
                      className="btn-shimmer-effect flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 dark:bg-[#a34824]"
                    >
                      {isSubmitting && submittingType === "forgot" ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Enviando...</span>
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

            {/* CASO 5: FORMULÁRIO DE REDEFINIÇÃO DE SENHA (RESET) */}
            {mode === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="rounded-xl border border-[#3E6748]/30 bg-[#3E6748]/10 p-3 text-[11px] text-[#3E6748] dark:text-[#67a074]">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <span>Sua sessão de recuperação foi validada. Defina uma nova senha.</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    Nova Senha
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="reset-new-password"
                      type={showNewPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-10 pl-9.5 text-xs text-[#2C2018] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#968374] hover:text-[#2C2018]"
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold text-[#2C2018] dark:text-[#f3ede1]"
                  >
                    Confirmar Nova Senha
                  </label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#968374]" />
                    <input
                      id="reset-confirm-password"
                      type={showNewPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2.5 pr-4 pl-9.5 text-xs text-[#2C2018] focus:border-[#8E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-reset"
                  disabled={isSubmitting}
                  className="btn-shimmer-effect flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:bg-[#773318] disabled:opacity-60 dark:bg-[#a34824]"
                >
                  {isSubmitting && submittingType === "reset" ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Atualizando Senha...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Salvar Nova Senha</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Rodapé de Confiança e Certificação CFM */}
          <div className="border-t border-[#E5DCBA]/70 bg-[#FBF7F0]/70 p-4 text-center dark:border-[#3a3528] dark:bg-[#1a1712]/80">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#3E6748] dark:text-[#67a074]">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Conformidade Médica CFM 2.314/2022 & LGPD</span>
            </div>
            <p className="mt-0.5 text-[10px] text-[#968374] dark:text-[#7f7163]">
              Dados de saúde e agendas clínicas protegidos por criptografia e RLS oficial.
            </p>
          </div>
        </div>

        {/* Rodapé Externo com Copyright */}
        <div className="mt-6 text-center text-xs text-[#968374] dark:text-[#7f7163]">
          <p>© 2026 AgendaCardio PRO. Todos os direitos reservados.</p>
        </div>
      </main>

      <div className="h-6" />
    </div>
  );
}
