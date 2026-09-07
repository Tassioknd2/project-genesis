import { Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import type { Appointment } from "@/lib/agenda-data";

export interface MobileAppHeaderProps {
  selectedDate?: Date | undefined;
  onSelectDate?: ((date: Date) => void) | undefined;
  agendaDoDia?: ((iso: string) => Appointment[]) | undefined;
}

export function MobileAppHeader(_props: MobileAppHeaderProps = {}) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso.");
    navigate({ to: "/auth" });
  };

  return (
    <header
      id="mobile-app-header"
      className="sticky top-0 z-30 border-b border-line2/60 bg-paper/95 px-3.5 py-2.5 backdrop-blur-md md:hidden"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Marca Compacta */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-ink font-mono text-xs font-black text-cream shadow-xs">
            <HeartPulse className="size-4 text-amber" />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-tight text-ink">
              Agenda<span className="text-amber">Cardio</span>
            </span>
          </div>
        </Link>

        {/* Ações Rápidas no Cabeçalho */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-1 pl-1 border-l border-line2/60">
              <span className="max-w-[80px] truncate text-[11px] font-semibold text-ink">
                {profile?.nome || (user.user_metadata?.["nome"] as string | undefined) || user.email?.split("@")[0] || "Médico"}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Encerrar sessão"
                className="flex size-8 items-center justify-center rounded-lg border border-line2/80 bg-card text-muted hover:text-red-700 dark:hover:text-red-400 active:scale-95"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
