import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import { apiClient, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "./api-client";
import { UserSafeProfile, UserRole } from "../server/domain/auth.types";
import { Profile, SubscriptionSummaryResponse } from "../server/domain/subscription.types";
import { HeartPulse } from "lucide-react";

export const AUTH_PROFILE_KEY = "agenda_cardio_active_profile";

interface AuthContextType {
  user: UserSafeProfile | null;
  token: string | null;
  currentProfile: Profile | null;
  subscriptionSummary: SubscriptionSummaryResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setCurrentProfile: (profile: Profile | null) => void;
  refreshSubscription: () => Promise<SubscriptionSummaryResponse | null>;
  login: (credentials: { email: string; password: string }) => Promise<UserSafeProfile>;
  register: (data: {
    nome: string;
    email: string;
    password: string;
    role?: UserRole;
    telefone?: string;
    crm?: string;
  }) => Promise<UserSafeProfile>;
  loginWithGoogle: (credential: string, role?: UserRole) => Promise<UserSafeProfile>;
  sendVerificationCode: (
    email?: string,
  ) => Promise<{ success: boolean; message: string; previewCode?: string }>;
  verifyEmail: (
    code: string,
    email?: string,
  ) => Promise<{ success: boolean; user: UserSafeProfile; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSafeProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTH_USER_KEY);
        if (stored) return JSON.parse(stored) as UserSafeProfile;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return apiClient.getToken();
    }
    return null;
  });

  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTH_PROFILE_KEY);
        if (stored) return JSON.parse(stored) as Profile;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [subscriptionSummary, setSubscriptionSummary] =
    useState<SubscriptionSummaryResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setCurrentProfile = useCallback((profile: Profile | null) => {
    setCurrentProfileState(profile);
    if (typeof window !== "undefined") {
      try {
        if (profile) {
          localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
        } else {
          localStorage.removeItem(AUTH_PROFILE_KEY);
        }
      } catch {
        // storage fallback
      }
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!apiClient.getToken()) {
      setSubscriptionSummary(null);
      return null;
    }
    try {
      const summary = await apiClient.getSubscriptionSummary();
      setSubscriptionSummary(summary);
      return summary;
    } catch {
      return null;
    }
  }, []);

  // Validação da sessão com o backend na inicialização
  const refreshUser = useCallback(async () => {
    const currentToken = apiClient.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setCurrentProfileState(null);
      setSubscriptionSummary(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.getMe();
      setUser(res.user);
      setToken(currentToken);
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      } catch {
        // storage fallback
      }
      // Carrega resumo da assinatura e perfis para garantir estado consistente
      const [sub, profiles] = await Promise.all([
        apiClient.getSubscriptionSummary().catch(() => null),
        apiClient.getProfiles().catch(() => []),
      ]);

      if (sub) {
        setSubscriptionSummary(sub);
      }

      // Se não houver perfil selecionado e não for multi-perfil contratado, seleciona o titular automaticamente
      if (!currentProfile && profiles && profiles.length > 0) {
        const isMultiPerfil =
          sub?.plan?.permiteMultiplosPerfis === true &&
          (sub?.subscription?.totalPerfisPermitidos ?? 1) > 1;

        if (!isMultiPerfil || profiles.length === 1) {
          const primary = profiles.find((p) => p.isPrimary) || profiles[0];
          setCurrentProfileState(primary);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(primary));
            } catch {
              // fallback
            }
          }
        }
      }
    } catch (error) {
      console.warn("Sessão inválida ou expirada:", error);
      apiClient.setToken(null);
      setUser(null);
      setToken(null);
      setCurrentProfileState(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: { email: string; password: string }): Promise<UserSafeProfile> => {
      setIsLoading(true);
      try {
        const res = await apiClient.login(credentials);
        setUser(res.user);
        setToken(res.token);

        // Auto-seleciona perfil do titular para planos normais
        try {
          const [sub, profiles] = await Promise.all([
            apiClient.getSubscriptionSummary(),
            apiClient.getProfiles(),
          ]);
          setSubscriptionSummary(sub);
          const isMultiPerfil =
            sub?.plan?.permiteMultiplosPerfis === true &&
            (sub?.subscription?.totalPerfisPermitidos ?? 1) > 1;

          if ((!isMultiPerfil || profiles.length === 1) && profiles.length > 0) {
            const primary = profiles.find((p) => p.isPrimary) || profiles[0];
            setCurrentProfile(primary);
          }
        } catch {
          // fallback
        }

        return res.user;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentProfile],
  );

  const register = useCallback(
    async (data: {
      nome: string;
      email: string;
      password: string;
      role?: UserRole;
      telefone?: string;
      crm?: string;
    }): Promise<UserSafeProfile> => {
      setIsLoading(true);
      try {
        const res = await apiClient.register(data);
        setUser(res.user);
        setToken(res.token);

        // Cria e seleciona o perfil titular automaticamente para o novo usuário
        try {
          const [sub, profiles] = await Promise.all([
            apiClient.getSubscriptionSummary(),
            apiClient.getProfiles(),
          ]);
          setSubscriptionSummary(sub);
          if (profiles.length > 0) {
            const primary = profiles.find((p) => p.isPrimary) || profiles[0];
            setCurrentProfile(primary);
          }
        } catch {
          // fallback
        }

        return res.user;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentProfile],
  );

  const loginWithGoogle = useCallback(
    async (credential: string, role?: UserRole): Promise<UserSafeProfile> => {
      setIsLoading(true);
try {
        const res = await apiClient.loginWithGoogle(
          role ? { credential, role } : { credential },
        );
        setUser(res.user);
        setToken(res.token);

        try {
          const [sub, profiles] = await Promise.all([
            apiClient.getSubscriptionSummary(),
            apiClient.getProfiles(),
          ]);
          setSubscriptionSummary(sub);
          const isMultiPerfil =
            sub?.plan?.permiteMultiplosPerfis === true &&
            (sub?.subscription?.totalPerfisPermitidos ?? 1) > 1;

          if ((!isMultiPerfil || profiles.length === 1) && profiles.length > 0) {
            const primary = profiles.find((p) => p.isPrimary) || profiles[0];
            setCurrentProfile(primary);
          }
        } catch {
          // fallback
        }

        return res.user;
      } finally {
        setIsLoading(false);
      }
    },
    [setCurrentProfile],
  );

  const sendVerificationCode = useCallback(async (email?: string) => {
    return apiClient.sendVerificationCode(email);
  }, []);

  const verifyEmail = useCallback(async (code: string, email?: string) => {
    const res = await apiClient.verifyEmail(code, email);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      setToken(null);
      setCurrentProfileState(null);
      setSubscriptionSummary(null);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(AUTH_PROFILE_KEY);
        } catch {
          // storage fallback
        }
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      currentProfile,
      subscriptionSummary,
      isLoading,
      isAuthenticated: Boolean(user && token),
      setCurrentProfile,
      refreshSubscription,
      login,
      register,
      loginWithGoogle,
      sendVerificationCode,
      verifyEmail,
      logout,
      refreshUser,
    }),
    [
      user,
      token,
      currentProfile,
      subscriptionSummary,
      isLoading,
      setCurrentProfile,
      refreshSubscription,
      login,
      register,
      loginWithGoogle,
      sendVerificationCode,
      verifyEmail,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}

/**
 * Componente que bloqueia o acesso a páginas privadas
 * Se o usuário não estiver autenticado, redireciona para /login
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-ink font-mono text-xl font-black text-cream shadow-md">
          <HeartPulse className="size-8 animate-pulse text-amber" />
          <div className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-paper bg-ok" />
        </div>
        <h2 className="mt-4 text-base font-black uppercase tracking-tight text-ink">
          Agenda<span className="text-amber">Cardio</span>
        </h2>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-inksoft">
          Verificando credenciais clínicas...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Componente para rotas públicas (Login e Cadastro)
 * Se já estiver autenticado, redireciona para a página principal (/)
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-ink font-mono text-sm font-black text-cream shadow-sm">
          <HeartPulse className="size-6 animate-pulse text-amber" />
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-inksoft">
          Carregando...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
