import { Link } from "@tanstack/react-router";
import { HeartPulse, LogOut, User as UserIcon, Users, CreditCard } from "lucide-react";
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
  selectedDate?: Date | undefined;
  onSelectDate?: ((date: Date) => void) | undefined;
  agendaDoDia?: ((iso: string) => Appointment[]) | undefined;
}

export function MobileAppHeader(_props: MobileAppHeaderProps = {}) {
  const { user, logout, currentProfile } = useAuth();

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
                  style={{
                    backgroundColor: currentProfile?.avatarColor || undefined,
                  }}
                  className={`flex size-8 items-center justify-center rounded-lg border border-line2/80 font-mono text-[11px] font-bold shadow-2xs active:scale-95 ${
                    currentProfile?.avatarColor ? "text-white" : "bg-card text-ink"
                  }`}
                >
                  {currentProfile ? (
                    currentProfile.nome.substring(0, 2).toUpperCase()
                  ) : user.avatarUrl ? (
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
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5 bg-paper/60 rounded-lg mb-1">
                  <div className="text-xs font-bold text-ink truncate">
                    {currentProfile?.nome || user.nome}
                  </div>
                  <div className="text-[10px] text-inksoft truncate">
                    {currentProfile?.email || user.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="rounded bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-amberdeep">
                      {currentProfile?.role || user.role}
                    </span>
                    {(currentProfile?.crm || user.crm) && (
                      <span className="font-mono text-[9px] text-inksoft">
                        CRM {currentProfile?.crm || user.crm}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link
                    to="/perfis"
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 text-xs font-medium text-ink hover:bg-paper rounded-md"
                  >
                    <Users className="size-4 text-amberdeep" />
                    <span>Trocar Perfil (Netflix)</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/assinatura"
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 text-xs font-medium text-ink hover:bg-paper rounded-md"
                  >
                    <CreditCard className="size-4 text-amberdeep" />
                    <span>Aba de Assinatura</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/planos"
                    className="cursor-pointer flex items-center gap-2 px-2 py-2 text-xs font-medium text-ink hover:bg-paper rounded-md"
                  >
                    <CreditCard className="size-4 text-emerald-600" />
                    <span>Planos & Upgrade</span>
                  </Link>
                </DropdownMenuItem>

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
