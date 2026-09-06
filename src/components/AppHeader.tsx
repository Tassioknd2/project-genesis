import { DesktopAppHeader } from "./desktop/DesktopAppHeader";
import { MobileAppHeader } from "./mobile/MobileAppHeader";
import type { NovoAgendamentoDraft } from "./NovoAgendamentoWizard";
import type { Appointment } from "@/lib/agenda-data";

export interface AppHeaderProps {
  selectedDate?: Date | undefined;
  onSelectDate?: ((date: Date) => void) | undefined;
  onNovoAgendamento?: ((draft: NovoAgendamentoDraft) => void) | undefined;
  /** Resolve a agenda de uma data (inclui alterações feitas na sessão). */
  agendaDoDia?: ((iso: string) => Appointment[]) | undefined;
}

export function AppHeader({
  selectedDate,
  onSelectDate,
  onNovoAgendamento,
  agendaDoDia,
}: AppHeaderProps) {
  return (
    <>
      {/* Desktop Header (Módulos Desktop - 100% isolado) */}
      <div className="hidden md:block">
        <DesktopAppHeader
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onNovoAgendamento={onNovoAgendamento}
          agendaDoDia={agendaDoDia}
        />
      </div>

      {/* Mobile Header (Módulos Mobile - Base dedicada) */}
      <div className="block md:hidden">
        <MobileAppHeader
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          agendaDoDia={agendaDoDia}
        />
      </div>
    </>
  );
}
