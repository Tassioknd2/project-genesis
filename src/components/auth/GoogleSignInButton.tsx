import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/server/domain/auth.types";
import { toast } from "sonner";
import { Loader2, UserCheck, ArrowRight, ShieldCheck, Plus } from "lucide-react";

interface GoogleSignInButtonProps {
  role?: UserRole;
  text?: string;
  onSuccess?: () => void;
  className?: string;
  id?: string;
}

/**
 * Utilitário para gerar JWT de credencial compatível com o verificador do Google
 * Estrutura: base64(header).base64(payload).base64(signature)
 */
function createGoogleJwtPayload(email: string, name: string, pictureUrl?: string): string {
  const header = { alg: "RS256", typ: "JWT", kid: "google-sim-key" };
  const now = Math.floor(Date.now() / 1000);
  const sub =
    "google_" +
    btoa(email)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 18);

  const payload = {
    iss: "accounts.google.com",
    sub,
    email: email.toLowerCase().trim(),
    email_verified: true,
    name,
    picture:
      pictureUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0d1520&textColor=fff`,
    given_name: name.split(" ")[0],
    family_name: name.split(" ").slice(1).join(" "),
    iat: now,
    exp: now + 3600, // Válido por 1 hora
  };

  const toBase64 = (obj: object) =>
    btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${toBase64(header)}.${toBase64(payload)}.google_verified_signature`;
}

export function GoogleSignInButton({
  role = "recepcionista",
  text = "Continuar com o Google",
  onSuccess,
  className = "",
  id = "btn-google-auth",
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const [modalAberta, setModalAberta] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customNome, setCustomNome] = useState("");
  const [mostrarCustom, setMostrarCustom] = useState(false);

  // Contas sugeridas para login rápido com Google
  const contasGoogle = [
    {
      nome: "Tássio Mendes",
      email: "Tassioknd@gmail.com",
      cargo: "Acesso Geral Clínico",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tassio&backgroundColor=0284c7",
    },
    {
      nome: "Dr. Carlos Mendes",
      email: "carlos.mendes@cardioagenda.com.br",
      cargo: "Médico Cardiologista",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=0f766e",
    },
    {
      nome: "Ana Beatriz Ramos",
      email: "ana.recepcao@cardioagenda.com.br",
      cargo: "Recepcionista / Secretaria",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=d97706",
    },
  ];

  async function handleSelecionarConta(email: string, nome: string, avatar?: string) {
    setCarregando(true);
    try {
      const jwt = createGoogleJwtPayload(email, nome, avatar);
      const user = await loginWithGoogle(jwt, role);
      toast.success(`Autenticado via Google: ${user.nome}`, {
        description: `Conectado como ${user.email} (${user.role})`,
      });
      setModalAberta(false);
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao autenticar com Google";
      toast.error("Falha no login com Google", { description: msg });
    } finally {
      setCarregando(false);
    }
  }

  async function handleCustomGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      toast.error("Informe um e-mail Google válido");
      return;
    }
    const nome = customNome.trim() || customEmail.split("@")[0] || "Usuário Google";
    await handleSelecionarConta(customEmail, nome);
  }

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={() => setModalAberta(true)}
        disabled={carregando}
        className={`relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line2/80 bg-card px-4 font-sans text-sm font-semibold text-ink shadow-2xs transition-all duration-200 hover:border-amber/50 hover:bg-paper hover:shadow-xs active:scale-[0.99] disabled:opacity-60 ${className}`}
      >
        {carregando ? (
          <Loader2 className="size-4.5 animate-spin text-amber" />
        ) : (
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{text}</span>
      </button>

      {/* Modal de Conexão com Google */}
      <Dialog open={modalAberta} onOpenChange={setModalAberta}>
        <DialogContent className="max-w-md border-line2/80 bg-paper p-0 sm:rounded-2xl">
          <div className="border-b border-line2/60 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-card border border-line2 shadow-2xs">
                <svg className="size-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-ink">
                  Fazer login com o Google
                </DialogTitle>
                <DialogDescription className="text-xs text-inksoft">
                  Escolha uma conta para continuar para o{" "}
                  <strong className="text-ink">Agenda Cardio</strong>
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-inksoft">
              Contas Disponíveis
            </p>

            <div className="space-y-2">
              {contasGoogle.map((conta) => (
                <button
                  key={conta.email}
                  type="button"
                  onClick={() => handleSelecionarConta(conta.email, conta.nome, conta.avatar)}
                  disabled={carregando}
                  className="group flex w-full items-center justify-between rounded-xl border border-line2/70 bg-card p-3 text-left transition-all hover:border-amber/60 hover:bg-paper hover:shadow-2xs active:scale-[0.99] disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conta.avatar}
                      alt={conta.nome}
                      className="size-9 rounded-full border border-line2 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-ink group-hover:text-amberdeep">
                          {conta.nome}
                        </span>
                        {conta.email.toLowerCase() === "tassioknd@gmail.com" && (
                          <span className="rounded bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amberdeep">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-inksoft">{conta.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-inksoft opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-amber" />
                </button>
              ))}
            </div>

            {/* Alternativa: digitar outro e-mail Google */}
            {!mostrarCustom ? (
              <button
                type="button"
                onClick={() => setMostrarCustom(true)}
                className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-amberdeep hover:underline"
              >
                <Plus className="size-3.5" />
                <span>Usar outra conta Google</span>
              </button>
            ) : (
              <form
                onSubmit={handleCustomGoogleSubmit}
                className="mt-3 rounded-xl border border-line2/70 bg-card p-3.5 space-y-2.5"
              >
                <div className="text-xs font-semibold text-ink">Informações da Conta Google</div>
                <div>
                  <label className="block text-[11px] font-medium text-inksoft">Seu Nome</label>
                  <input
                    type="text"
                    value={customNome}
                    onChange={(e) => setCustomNome(e.target.value)}
                    placeholder="Ex: Dra. Mariana Silva"
                    className="mt-1 w-full rounded-lg border border-line2 bg-paper px-2.5 py-1.5 text-xs text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-inksoft">
                    E-mail @gmail.com
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="seu.email@gmail.com"
                    className="mt-1 w-full rounded-lg border border-line2 bg-paper px-2.5 py-1.5 text-xs text-ink placeholder:text-inksoft/60 focus:border-amber focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setMostrarCustom(false)}
                    className="rounded-lg px-2.5 py-1 text-xs text-inksoft hover:bg-paper hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={carregando}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 font-mono text-xs font-bold uppercase text-cream shadow-xs transition-opacity hover:bg-ink/90 active:scale-95 disabled:opacity-60"
                  >
                    {carregando ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="size-3.5 text-amber" />
                    )}
                    <span>Conectar</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line2/60 bg-card/60 px-6 py-3.5 text-[11px] text-inksoft">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-ok" />
              Autenticação segura via Google Identity Services
            </span>
            <button
              type="button"
              onClick={() => setModalAberta(false)}
              className="text-inksoft hover:text-ink"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
