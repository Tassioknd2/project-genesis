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
  signInWithGoogle: () => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
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
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nome, role, criado_em, atualizado_em")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("[Auth] Não foi possível carregar perfil do banco:", error.message);
        }

        if (data) {
          setProfile(data as UserProfile);
        } else {
          // Perfil temporário seguro enquanto trigger no banco executa
          const metadataName =
            typeof userMetadata?.nome === "string"
              ? userMetadata.nome
              : typeof userMetadata?.full_name === "string"
                ? userMetadata.full_name
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
      // 1. Obter sessão inicial
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

      // 2. Escuta mudanças de estado da autenticação
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
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
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
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error:
          "Supabase não está configurado. Defina as chaves de API nas configurações do aplicativo.",
      };
    }

    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
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
        redirectTo: redirectUrl,
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
