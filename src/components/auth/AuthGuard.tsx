import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { HeartPulse, Lock } from "lucide-react";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o Supabase estiver configurado e a verificação de sessão tiver terminado sem usuário:
    if (!loading && isConfigured && !user) {
      toast.error("Acesso restrito", {
        description: "Faça login com sua conta médica para acessar este painel clínico.",
      });
      router.navigate({ to: "/auth" });
    }
  }, [user, loading, isConfigured, router]);

  // Se ainda estiver carregando a sessão criptográfica:
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-ink shadow-md animate-pulse">
          <HeartPulse
            className="size-8 text-amber animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <div className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-paper bg-amber" />
        </div>
        <p className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-ink">
          Validando credenciais médicas...
        </p>
        <p className="mt-1 font-sans text-xs text-inksoft">
          Protegendo acesso aos prontuários e registros de pacientes.
        </p>
      </div>
    );
  }

  // Se o Supabase estiver configurado e não houver usuário autenticado:
  if (isConfigured && !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-line2 bg-card text-ink shadow-sm">
          <Lock className="size-6 text-amber" />
        </div>
        <h2 className="mt-4 font-mono text-base font-bold uppercase tracking-tight text-ink">
          Sessão Não Autenticada
        </h2>
        <p className="mt-2 max-w-sm text-sm text-inksoft">
          Redirecionando com segurança para a tela de autenticação médica...
        </p>
      </div>
    );
  }

  // Usuário autenticado ou ambiente sem Supabase configurado (para desenvolvimento inicial)
  return <>{children}</>;
}
