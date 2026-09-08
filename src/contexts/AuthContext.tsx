import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  nome: string;
  role: "medico" | "recepcao" | "admin" | string;
  criado_em?: string;
  atualizado_em?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    nome: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null; providerNotConfigured?: boolean }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
  activateWithUrlOrToken: (input: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega perfil a partir de public.profiles usando a sessão segura
  const fetchProfile = useCallback(
    async (userId: string, userMetadata?: Record<string, unknown>) => {
      if (!isSupabaseConfigured) return;
      try {
        // A tabela public.profiles pode não constar nos tipos gerados; usa acesso não tipado
        const untyped = supabase as unknown as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (
                col: string,
                val: string,
              ) => {
                maybeSingle: () => Promise<{
                  data: UserProfile | null;
                  error: { message: string } | null;
                }>;
              };
            };
          };
        };
        const { data, error } = await untyped
          .from("profiles")
          .select("id, nome, role, criado_em, atualizado_em")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("[Auth] Não foi possível carregar perfil do banco:", error.message);
        }

        if (data) {
          setProfile(data);
        } else {
          // Perfil temporário seguro enquanto trigger no banco executa
          const metadataName =
            typeof userMetadata?.["nome"] === "string"
              ? (userMetadata["nome"] as string)
              : typeof userMetadata?.["full_name"] === "string"
                ? (userMetadata["full_name"] as string)
                : "Usuário Médico";

          setProfile({
            id: userId,
            nome: metadataName,
            role: "medico",
          });
        }
      } catch (err) {
        console.warn("[Auth] Erro ao buscar perfil:", err);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // 1. Detecta se a URL contém código PKCE (?code=) e faz a troca automática
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");
        if (authCode) {
          supabase.auth
            .exchangeCodeForSession(authCode)
            .then(({ data, error }) => {
              if (!isMounted) return;
              if (error) {
                console.warn("[Auth] Erro ao trocar código por sessão:", error.message);
              } else if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
                if (data.session.user) {
                  fetchProfile(data.session.user.id, data.session.user.user_metadata);
                }
                // Limpa o parâmetro code da URL
                urlParams.delete("code");
                const remaining = urlParams.toString();
                const cleanUrl =
                  window.location.pathname +
                  (remaining ? `?${remaining}` : "") +
                  window.location.hash;
                window.history.replaceState({}, document.title, cleanUrl);
              }
            })
            .catch((err) => console.warn("[Auth] Exceção ao trocar código:", err));
        }
      }

      // 2. Obter sessão inicial
      supabase.auth
        .getSession()
        .then(({ data: { session: initialSession }, error }) => {
          if (!isMounted) return;
          if (error) {
            console.warn("[Auth] Erro ao obter sessão inicial:", error.message);
          }
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            fetchProfile(initialSession.user.id, initialSession.user.user_metadata);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn("[Auth] Exceção ao obter sessão inicial:", err);
          setLoading(false);
        });

      // 3. Escuta mudanças de estado da autenticação
      const authStateResult = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!isMounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
          }
        } else if (event === "SIGNED_OUT") {
          setProfile(null);
        }

        setLoading(false);
      });

      subscription = authStateResult?.data?.subscription ?? null;
    } catch (err) {
      console.warn("[Auth] Falha ao inicializar listener de autenticação:", err);
      setLoading(false);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchProfile]);

  // Função auxiliar para traduzir erros comuns de autenticação do Supabase
  const formatAuthError = (err: unknown): string => {
    if (!err) return "Ocorreu um erro inesperado.";
    const message = err instanceof Error ? err.message : String(err);
    const msg = message.toLowerCase();

    if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
      return "E-mail ou senha incorretos. Por favor, verifique suas credenciais.";
    }
    if (msg.includes("email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada para ativar a conta.";
    }
    if (msg.includes("user already registered") || msg.includes("already registered")) {
      return "Já existe uma conta cadastrada com este endereço de e-mail.";
    }
    if (msg.includes("password should be at least") || msg.includes("weak_password")) {
      return "A senha deve ter no mínimo 6 caracteres para sua segurança.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "Muitas tentativas em pouco tempo. Por segurança, aguarde alguns minutos.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Falha de conexão com os serviços de autenticação. Verifique sua internet.";
    }
    if (
      msg.includes("provider is not enabled") ||
      msg.includes("unsupported provider") ||
      msg.includes("validation_failed")
    ) {
      return "O login com o Google ainda não foi ativado no painel do Supabase. Habilite o provedor em Authentication > Providers > Google.";
    }
    return message;
  };

  // Login com e-mail e senha
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error:
          "Supabase não está configurado. Defina as chaves de API nas configurações do aplicativo.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.user_metadata);
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: formatAuthError(err) };
    }
  };

  // Cadastro com e-mail e senha e confirmação obrigatória de e-mail
  const signUpWithEmail = async (
    email: string,
    password: string,
    nome: string,
  ): Promise<{ error: string | null; needsEmailConfirmation: boolean }> => {
    if (!isSupabaseConfigured) {
      return {
        error:
          "Supabase não está configurado. Defina as chaves de API nas configurações do aplicativo.",
        needsEmailConfirmation: false,
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome: nome.trim() || "Usuário Médico",
          },
          ...(typeof window !== "undefined"
            ? { emailRedirectTo: `${window.location.origin}/auth` }
            : {}),
        },
      });

      if (error) {
        return { error: formatAuthError(error), needsEmailConfirmation: false };
      }

      // Se identities estiver vazio, a conta já existia no banco
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          error: "Já existe uma conta cadastrada com este endereço de e-mail.",
          needsEmailConfirmation: false,
        };
      }

      // Se a confirmação de e-mail estiver ativa no Supabase, a sessão é null até a confirmação
      const needsConfirmation = !data.session;
      return { error: null, needsEmailConfirmation: needsConfirmation };
    } catch (err: unknown) {
      return { error: formatAuthError(err), needsEmailConfirmation: false };
    }
  };

  // Login com Google via Supabase OAuth (PKCE nativo)
  const signInWithGoogle = async (): Promise<{
    error: string | null;
    providerNotConfigured?: boolean;
  }> => {
    if (!isSupabaseConfigured) {
      return {
        error:
          "Supabase não está configurado. Defina as chaves de API nas configurações do aplicativo.",
      };
    }

    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          ...(redirectUrl ? { redirectTo: redirectUrl } : {}),
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        const formatted = formatAuthError(error);
        return {
          error: formatted,
          providerNotConfigured:
            formatted.includes("painel do Supabase") ||
            error.message.toLowerCase().includes("not enabled"),
        };
      }

      if (!data?.url) {
        return { error: "Não foi possível iniciar a autenticação com o Google." };
      }

      // Validação defensiva pré-redirecionamento:
      // Se o provedor Google não estiver ativado no painel do Supabase,
      // a rota /authorize retorna HTTP 400 {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}.
      // Fazemos uma verificação prévia para evitar redirecionar o navegador para a tela de erro bruto do Supabase.
      try {
        const checkRes = await fetch(data.url, {
          method: "GET",
          redirect: "manual",
        });

        if (checkRes.status === 400) {
          const body = (await checkRes.json().catch(() => null)) as {
            code?: number;
            msg?: string;
            error_code?: string;
          } | null;

          if (
            body?.msg?.toLowerCase().includes("not enabled") ||
            body?.msg?.toLowerCase().includes("unsupported provider") ||
            body?.error_code === "validation_failed"
          ) {
            return {
              error:
                "O login com o Google ainda não foi ativado no painel do Supabase. Habilite o provedor em Authentication > Providers > Google.",
              providerNotConfigured: true,
            };
          }
        }
      } catch (checkErr) {
        // Se houver restrição de rede no preflight, prossegue com segurança
        console.warn("[Auth] Verificação de provedor Google OAuth:", checkErr);
      }

      // Se o provedor estiver ativo ou redirecionar normalmente, envia para a tela de login do Google
      if (typeof window !== "undefined") {
        window.location.assign(data.url);
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: formatAuthError(err) };
    }
  };

  // Solicitação de redefinição de senha com resposta genérica anti-enumeração
  const sendPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error:
          "Supabase não está configurado. Defina as chaves de API nas configurações do aplicativo.",
      };
    }

    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/auth?type=recovery` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        ...(redirectUrl ? { redirectTo: redirectUrl } : {}),
      });

      if (error) {
        // Para segurança contra enumeração de contas, não expor se o e-mail existe
        console.warn("[Auth] Erro ao enviar recuperação:", error.message);
      }

      return { error: null };
    } catch (err: unknown) {
      console.warn("[Auth] Exceção na recuperação:", err);
      return { error: null };
    }
  };

  // Atualização de senha do usuário autenticado após recuperação
  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: "Supabase não está configurado.",
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: formatAuthError(err) };
    }
  };

  // Reenvio controlado de e-mail de confirmação
  const resendConfirmationEmail = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: "Supabase não está configurado.",
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (err: unknown) {
      return { error: formatAuthError(err) };
    }
  };

  // Ativação manual através de URL (ex: redirecionamento que caiu em localhost) ou código PKCE
  const activateWithUrlOrToken = async (input: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase não está configurado." };
    }
    const trimmed = input.trim();
    if (!trimmed) {
      return { error: "Por favor, cole a URL de confirmação ou o código." };
    }

    try {
      let code: string | null = null;
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      // 1. Extrai código ?code= ou &code=
      if (trimmed.includes("code=")) {
        const match = trimmed.match(/[?&#]code=([^&#]+)/);
        if (match && match[1]) {
          code = decodeURIComponent(match[1]);
        }
      }

      // 2. Extrai tokens de hash (#access_token=...&refresh_token=...)
      if (trimmed.includes("access_token=")) {
        const matchAccess = trimmed.match(/[?&#]access_token=([^&#]+)/);
        const matchRefresh = trimmed.match(/[?&#]refresh_token=([^&#]+)/);
        if (matchAccess && matchAccess[1]) {
          accessToken = decodeURIComponent(matchAccess[1]);
        }
        if (matchRefresh && matchRefresh[1]) {
          refreshToken = decodeURIComponent(matchRefresh[1]);
        }
      }

      // Se achou código PKCE, troca por sessão
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          return { error: formatAuthError(error) };
        }
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user) {
            await fetchProfile(data.session.user.id, data.session.user.user_metadata);
          }
          return { error: null };
        }
      }

      // Se achou tokens no hash, define sessão
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          return { error: formatAuthError(error) };
        }
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user) {
            await fetchProfile(data.session.user.id, data.session.user.user_metadata);
          }
          return { error: null };
        }
      }

      // Caso tenha colado apenas o código diretamente (sem URL)
      if (!trimmed.includes("http") && !trimmed.includes("/") && trimmed.length > 10) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(trimmed);
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user) {
            await fetchProfile(data.session.user.id, data.session.user.user_metadata);
          }
          return { error: null };
        }
      }

      return {
        error:
          "Não foi possível extrair os dados de autenticação. Copie toda a URL presente na barra de endereços da aba com o erro do localhost.",
      };
    } catch (err: unknown) {
      return { error: formatAuthError(err) };
    }
  };

  // Logout seguro com limpeza de estado
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[Auth] Erro durante signOut:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.info("Você saiu da sua conta.");
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.user_metadata);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        updatePassword,
        resendConfirmationEmail,
        activateWithUrlOrToken,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
