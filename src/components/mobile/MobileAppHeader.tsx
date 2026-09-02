import { Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Appointment } from "@/lib/agenda-data";

export interface MobileAppHeaderProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  agendaDoDia?: (iso: string) => Appointment[];
}

export function MobileAppHeader(_props: MobileAppHeaderProps = {}) {
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
        </div>
      </div>
    </header>
  );
}
