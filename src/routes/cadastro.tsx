import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, PublicOnlyRoute } from "@/lib/auth-context";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { UserRole } from "@/server/domain/auth.types";
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
} from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro Clínico — Agenda Cardio" },
      {
        name: "description",
        content: "Criação de conta para equipe médica e recepcionistas da Agenda Cardio.",
      },
    ],
  }),
  component: CadastroPageWithGuard,
});

function CadastroPageWithGuard() {
  return (
    <PublicOnlyRoute>
      <CadastroPage />
    </PublicOnlyRoute>
  );
}

function CadastroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("recepcionista");
  const [crm, setCrm] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Validações em tempo real da senha
  const temOitoCaracteres = password.length >= 8;
  const temMaiuscula = /[A-Z]/.test(password);
  const temNumero = /[0-9]/.test(password);
  const senhasConferem = password === confirmPassword && confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
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
      const user = await register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        telefone: telefone.trim() || undefined,
        crm: role === "medico" ? crm.trim() : undefined,
      });

      toast.success("Conta criada com sucesso!", {
        description: `Bem-vindo(a), ${user.nome}! Seu acesso clínico foi liberado.`,
      });

      router.navigate({ to: "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta";
      setErro(msg);
      toast.error("Erro no cadastro", { description: msg });
    } finally {
      setCarregando(false);
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
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line2/80 bg-card px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-2xs transition-all hover:border-amber/60 hover:bg-paper hover:text-amberdeep active:scale-95"
            >
              <ArrowLeft className="size-3.5" />
              <span>Já tenho conta</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          {/* Card Principal */}
          <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-ink font-mono text-cream shadow-2xs">
                <Users className="size-6 text-amber" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Novo Cadastro Clínico
              </h1>
              <p className="mt-1 text-xs text-inksoft">
                Crie seu perfil profissional para operar o sistema da clínica
              </p>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-900 dark:border-red-950/60 dark:bg-red-950/20 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">{erro}</div>
              </div>
            )}

            {/* Cadastro com Google Rápido */}
            <div className="mb-6">
              <GoogleSignInButton
                role={role}
                id="btn-google-register"
                text="Cadastrar rapidamente com o Google"
                onSuccess={() => router.navigate({ to: "/" })}
              />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line2/60" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                  <span className="bg-card px-3 text-inksoft">ou preencha os dados</span>
                </div>
              </div>
            </div>

            {/* Formulário de Cadastro */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seleção de Papel / Perfil */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-inksoft mb-1.5">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("recepcionista")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      role === "recepcionista"
                        ? "border-amber bg-amber/10 text-ink shadow-2xs font-semibold"
                        : "border-line2/80 bg-paper text-inksoft hover:border-amber/50 hover:text-ink"
                    }`}
                  >
                    <Users className="size-4.5 text-amber" />
                    <div>
                      <div className="text-xs font-bold leading-tight text-ink">Recepção</div>
                      <div className="text-[10px] text-inksoft">Agendamentos e triagem</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("medico")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      role === "medico"
                        ? "border-amber bg-amber/10 text-ink shadow-2xs font-semibold"
                        : "border-line2/80 bg-paper text-inksoft hover:border-amber/50 hover:text-ink"
                    }`}
                  >
                    <Stethoscope className="size-4.5 text-amber" />
                    <div>
                      <div className="text-xs font-bold leading-tight text-ink">Cardiologista</div>
                      <div className="text-[10px] text-inksoft">Atendimento e prontuário</div>
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
                  Nome completo
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <User className="size-4" />
                  </div>
                  <input
                    id="cad-nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Dra. Mariana Albuquerque"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label
                  htmlFor="cad-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                >
                  E-mail profissional
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="cad-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mariana@cardioagenda.com.br"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* CRM (Condicional se for Médico) */}
              {role === "medico" && (
                <div>
                  <label
                    htmlFor="cad-crm"
                    className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                  >
                    Registro CRM (Conselho Regional de Medicina)
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                      <Stethoscope className="size-4" />
                    </div>
                    <input
                      id="cad-crm"
                      type="text"
                      required
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      placeholder="Ex: SP-987654"
                      className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Telefone / WhatsApp */}
              <div>
                <label
                  htmlFor="cad-telefone"
                  className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                >
                  Telefone / WhatsApp (Opcional)
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Phone className="size-4" />
                  </div>
                  <input
                    id="cad-telefone"
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="cad-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                >
                  Senha de acesso
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="cad-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-inksoft hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Indicadores de Requisitos da Senha */}
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono ${
                      temOitoCaracteres ? "bg-ok/15 text-ok font-bold" : "bg-paper text-inksoft"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    8+ caracteres
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono ${
                      temMaiuscula ? "bg-ok/15 text-ok font-bold" : "bg-paper text-inksoft"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />1 letra maiúscula
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono ${
                      temNumero ? "bg-ok/15 text-ok font-bold" : "bg-paper text-inksoft"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />1 número
                  </span>
                </div>
              </div>

              {/* Confirmação de Senha */}
              <div>
                <label
                  htmlFor="cad-confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-inksoft"
                >
                  Confirmar senha
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-inksoft">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="cad-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="block w-full rounded-xl border border-line2/80 bg-paper py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-inksoft/50 shadow-2xs transition-all focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-hidden"
                  />
                </div>
                {confirmPassword.length > 0 && !senhasConferem && (
                  <p className="mt-1 text-[11px] text-red-500">As senhas não conferem.</p>
                )}
              </div>

              {/* Termos de Privacidade e LGPD */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-line2 text-amber focus:ring-amber/30"
                  />
                  <span className="text-inksoft leading-relaxed">
                    Concordo com os Termos de Uso e com a Política de Proteção de Dados Médicos
                    (LGPD), mantendo sigilo de prontuários e agendamentos.
                  </span>
                </label>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                id="btn-submit-cadastro"
                disabled={carregando || !aceitouTermos}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-[0.99] disabled:opacity-60"
              >
                {carregando ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-amber" />
                    <span>Criando sua conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Conta Clínica</span>
                    <ArrowRight className="size-4 text-amber" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rodapé da Tela de Cadastro */}
          <div className="mt-6 text-center text-xs text-inksoft">
            Já possui cadastro clínico ativo?{" "}
            <Link to="/login" className="font-bold text-ink hover:text-amberdeep hover:underline">
              Fazer login
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-inksoft">
            <ShieldCheck className="size-3.5 text-ok" />
            <span>Ambiente seguro certificado para clínicas de cardiologia</span>
          </div>
        </div>
      </main>
    </div>
  );
}
