import { Link } from "@tanstack/react-router";
import { HeartPulse, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Appointment } from "@/lib/agenda-data";

export interface MobileAppHeaderProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  agendaDoDia?: (iso: string) => Appointment[];
}

export function MobileAppHeader(_props: MobileAppHeaderProps = {}) {
  const { user, logout } = useAuth();

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
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu do Usuário"
                  className="flex size-8 items-center justify-center rounded-lg border border-line2/80 bg-card font-mono text-[11px] font-bold text-ink shadow-2xs active:scale-95"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.nome}
                      className="size-8 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.nome.substring(0, 2).toUpperCase()
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="text-xs font-bold text-ink truncate">{user.nome}</div>
                  <div className="text-[10px] text-inksoft truncate">{user.email}</div>
                  <div className="mt-1">
                    <span className="rounded bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-amberdeep">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    toast.info("Sessão finalizada");
                  }}
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>Sair da conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="flex size-8 items-center justify-center rounded-lg border border-line2/80 bg-card text-ink"
            >
              <UserIcon className="size-4 text-amber" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
