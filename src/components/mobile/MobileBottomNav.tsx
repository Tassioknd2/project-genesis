import { Link, useRouterState } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileBottomNavProps {
  totalPendencias?: number;
  onNovoAgendamento?: () => void;
  onFiltroPendencias?: () => void;
  isFiltroPendenciasAtivo?: boolean;
}

export function MobileBottomNav({
  totalPendencias = 0,
  onNovoAgendamento,
  onFiltroPendencias,
  isFiltroPendenciasAtivo = false,
}: MobileBottomNavProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line2/80 bg-paper/95 px-3 py-2 backdrop-blur-lg md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {/* Agenda */}
        <Link
          to="/"
          className={cn(
            "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95",
            pathname === "/" && !isFiltroPendenciasAtivo
              ? "text-amberdeep"
              : "text-inksoft hover:text-ink",
          )}
        >
          <CalendarDays className="size-5" />
          <span>Agenda</span>
        </Link>

        {/* Pendências */}
        {pathname === "/" && onFiltroPendencias ? (
          <button
            type="button"
            onClick={onFiltroPendencias}
            className={cn(
              "relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95",
              isFiltroPendenciasAtivo ? "text-amberdeep font-black" : "text-inksoft hover:text-ink",
            )}
          >
            <AlertTriangle className="size-5" />
            <span>Pendentes</span>
            {totalPendencias > 0 && (
              <span className="absolute -top-1 right-2 flex size-4.5 items-center justify-center rounded-full bg-amber text-[9px] font-black text-ink shadow-2xs">
                {totalPendencias}
              </span>
            )}
          </button>
        ) : (
          <Link
            to="/"
            className="relative flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft transition-colors active:scale-95"
          >
            <AlertTriangle className="size-5" />
            <span>Pendentes</span>
            {totalPendencias > 0 && (
              <span className="absolute -top-1 right-2 flex size-4.5 items-center justify-center rounded-full bg-amber text-[9px] font-black text-ink shadow-2xs">
                {totalPendencias}
              </span>
            )}
          </Link>
        )}

        {/* Botão Central de Novo Agendamento */}
        {onNovoAgendamento && (
          <button
            type="button"
            onClick={onNovoAgendamento}
            title="Criar novo agendamento"
            aria-label="Criar novo agendamento"
            className="flex size-11 items-center justify-center rounded-2xl bg-ink text-cream shadow-md transition-transform hover:scale-105 active:scale-90"
          >
            <Plus className="size-6 text-amber stroke-[2.5]" />
          </button>
        )}

        {/* Pacientes */}
        <Link
          to="/pacientes"
          className={cn(
            "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95",
            pathname === "/pacientes" ? "text-amberdeep" : "text-inksoft hover:text-ink",
          )}
        >
          <Users className="size-5" />
          <span>Pacientes</span>
        </Link>
      </div>
    </nav>
  );
}
