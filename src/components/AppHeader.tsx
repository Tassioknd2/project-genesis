import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line2/50 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-5 lg:px-8">
        <Link to="/" className="header-item flex items-center gap-3">
          <div className="relative">
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink font-mono text-sm font-bold text-cream shadow-sm">
              AC
            </div>
            <div className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-paper bg-amber" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[16px] font-extrabold uppercase leading-none tracking-tighter">
              Agenda<span className="text-amber">Cardio</span>
            </h1>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-inksoft">
              Clínica de Cardiologia
            </p>
          </div>
        </Link>

        <div className="header-item flex items-center rounded-xl border border-line2/40 bg-line2/20 p-1">
          <button
            type="button"
            aria-label="Dia anterior"
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-all hover:bg-card/60 active:scale-90"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="min-w-[160px] px-4 text-center">
            <div className="text-[13px] font-bold tracking-tight">
              29 de Agosto, 2026
            </div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-widest text-amber">
              Sábado
            </div>
          </div>
          <button
            type="button"
            aria-label="Próximo dia"
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-all hover:bg-card/60 active:scale-90"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="header-item flex items-center gap-3">
          <Link
            to="/pacientes"
            className="hidden text-xs font-bold uppercase tracking-wider text-inksoft transition-colors hover:text-amber md:block"
          >
            Pacientes
          </Link>
          <button
            type="button"
            className="h-9 rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:translate-y-px"
          >
            Novo agendamento
          </button>
        </div>
      </div>
    </header>
  );
}
