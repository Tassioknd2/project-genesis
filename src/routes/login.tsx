import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, PublicOnlyRoute } from "@/lib/auth-context";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  KeyRound,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Agenda Cardio" },
      {
        name: "description",
        content: "Acesso seguro ao painel clínico de agendamentos e pacientes da Agenda Cardio.",
      },
    ],
  }),
  component: LoginPageWithGuard,
});

function LoginPageWithGuard() {
  return (
    <PublicOnlyRoute>
      <LoginPage />
    </PublicOnlyRoute>
  );
}

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Modal de Recuperação de Senha
  const [modalEsqueciSenha, setModalEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!email.trim() || !password) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setCarregando(true);
    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      toast.success(`Bem-vindo(a), ${user.nome}!`, {
        description: `Sessão iniciada com sucesso como ${user.role}.`,
      });

      router.navigate({ to: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao realizar login";
      setErro(msg);
      toast.error("Falha na autenticação", { description: msg });
    } finally {
      setCarregando(false);
    }
  }

  // Preenchimento rápido para avaliação
  function aplicarCredenciaisTeste(emailTeste: string, senhaTeste = "Cardio@2026") {
    setEmail(emailTeste);
    setPassword(senhaTeste);
    setErro(null);
  }

  async function handleSolicitarRecuperacao(e: React.FormEvent) {
    e.preventDefault();
    if (!emailRecuperacao.trim()) return;

    setEnviandoRecuperacao(true);
    try {
      const res = await apiClient.requestPasswordReset(emailRecuperacao.trim());
      toast.success("Instruções geradas", {
        description: res.message,
      });
      if (res.previewToken) {
        setPreviewToken(res.previewToken);
      } else {
        setModalEsqueciSenha(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao solicitar recuperação";
      toast.error("Erro", { description: msg });
    } finally {
      setEnviandoRecuperacao(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink transition-colors selection:bg-amber/20 selection:text-ink">
      {/* Topo / Barra de Ferramentas */}
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
            <Link
              to="/cadastro"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line2/80 bg-card px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-2xs transition-all hover:border-amber/60 hover:bg-paper hover:text-amberdeep active:scale-95"
            >
              <span>Criar Conta</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card Principal */}
          <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-ink font-mono text-cream shadow-2xs">
                <HeartPulse className="size-6 text-amber" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Acesso ao Sistema
              </h1>
              <p className="mt-1 text-xs text-inksoft">
                Entre com suas credenciais para gerenciar a agenda clínica
              </p>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/20 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">{erro}</div>
              </div>
            )}

            {/* Formulário de Login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                >
                  E-mail institucional
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="medico@cardioagenda.com.br"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailRecuperacao(email);
                      setModalEsqueciSenha(true);
                    }}
                    className="text-xs font-medium text-amberdeep hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-inksoft hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lembrarMe}
                    onChange={(e) => setLembrarMe(e.target.checked)}
                    className="size-4 rounded border-line2 text-amber focus:ring-amber/30"
                  />
                  <span>Lembrar minhas credenciais</span>
                </label>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                disabled={carregando}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-60"
              >
                {carregando ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-amber" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4 text-amber" />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line2/60" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                <span className="bg-card px-3 text-inksoft">ou acesse com</span>
              </div>
            </div>

            {/* Botão Oficial Google */}
            <GoogleSignInButton
              id="btn-google-login"
              text="Entrar com o Google"
              onSuccess={() => router.navigate({ to: "/" })}
            />

            {/* Acesso Rápido para Avaliação e Demonstração */}
            <div className="mt-6 rounded-xl border border-line2/60 bg-paper/60 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Contas de Teste Pré-configuradas
                </span>
                <span className="rounded bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amberdeep">
                  Senha: Cardio@2026
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => aplicarCredenciaisTeste("carlos.mendes@cardioagenda.com.br")}
                  className="flex flex-col items-start rounded-lg border border-line2/70 bg-card p-2 text-left transition-colors hover:border-amber/50 hover:bg-paper active:scale-95"
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-ink">
                    <Stethoscope className="size-3 text-amber" />
                    Dr. Carlos Mendes
                  </span>
                  <span className="text-[10px] text-inksoft">Médico (CRM SP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => aplicarCredenciaisTeste("ana.recepcao@cardioagenda.com.br")}
                  className="flex flex-col items-start rounded-lg border border-line2/70 bg-card p-2 text-left transition-colors hover:border-amber/50 hover:bg-paper active:scale-95"
                >
                  <span className="flex items-center gap-1 text-[11px] font-bold text-ink">
                    <UserCheck className="size-3 text-ok" />
                    Ana Beatriz
                  </span>
                  <span className="text-[10px] text-inksoft">Recepção / Triagem</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé da Tela de Login */}
          <div className="mt-6 text-center text-xs text-inksoft">
            Não tem uma conta clínica?{" "}
            <Link
              to="/cadastro"
              className="font-bold text-ink hover:text-amberdeep hover:underline"
            >
              Criar cadastro agora
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-inksoft">
            <ShieldCheck className="size-3.5 text-ok" />
            <span>Transmissão criptografada em conformidade com a LGPD</span>
          </div>
        </div>
      </main>

      {/* Modal de Esqueci Minha Senha */}
      <Dialog open={modalEsqueciSenha} onOpenChange={setModalEsqueciSenha}>
        <DialogContent className="max-w-md bg-paper p-6 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">Recuperar Senha</DialogTitle>
            <DialogDescription className="text-xs text-inksoft">
              Informe seu e-mail institucional para receber as instruções de redefinição de acesso.
            </DialogDescription>
          </DialogHeader>

          {previewToken ? (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-ok/30 bg-ok/10 p-3 text-xs text-ink">
                <p className="font-semibold text-ok">Token de Recuperação Gerado:</p>
                <p className="mt-1 break-all font-mono text-[11px] text-ink">{previewToken}</p>
                <p className="mt-2 text-[10px] text-inksoft">
                  Em ambiente de teste/demonstração, copie este token para redefinir a senha via API
                  ou no console.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewToken(null);
                  setModalEsqueciSenha(false);
                }}
                className="w-full rounded-xl bg-ink py-2 font-mono text-xs font-bold uppercase text-cream hover:bg-ink/90"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSolicitarRecuperacao} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-inksoft">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  placeholder="seu.email@cardioagenda.com.br"
                  className="mt-1 w-full rounded-xl border border-line2 bg-card px-3 py-2 text-xs text-ink focus:border-amber focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEsqueciSenha(false)}
                  className="rounded-xl px-3 py-1.5 text-xs text-inksoft hover:bg-card hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoRecuperacao}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 font-mono text-xs font-bold uppercase text-cream shadow-xs transition-opacity hover:bg-ink/90 active:scale-95 disabled:opacity-60"
                >
                  {enviandoRecuperacao ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  <span>Enviar Instruções</span>
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
