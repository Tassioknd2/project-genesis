import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HOJE_ISO, fromISODate, toISODate } from "@/lib/agenda-data";

export interface MobileDateNavigatorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  className?: string;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function MobileDateNavigator({
  selectedDate,
  onSelectDate,
  className,
}: MobileDateNavigatorProps) {
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState<Date>(() => selectedDate);

  const isToday = toISODate(selectedDate) === HOJE_ISO;

  function abrir(open: boolean) {
    if (open) setMes(selectedDate);
    setAberto(open);
  }

  return (
    <div
      id="mobile-date-navigator"
      className={cn(
        "flex items-center justify-between gap-1 rounded-2xl border border-line2/80 bg-card p-1.5 shadow-2xs",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Dia anterior"
        onClick={() => onSelectDate(addDays(selectedDate, -1))}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line2/60 bg-paper text-ink transition-all hover:bg-card active:scale-95"
      >
        <ChevronLeft className="size-4.5" />
      </button>

      <Popover open={aberto} onOpenChange={abrir}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-center transition-all active:scale-98",
              isToday
                ? "border-amber/60 bg-amber/15 text-ink"
                : "border-line2/70 bg-paper text-ink",
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-amberdeep" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-black capitalize leading-none tracking-tight text-ink">
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-inksoft">
                {isToday ? "Hoje (Atual)" : "Alterar data"}
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto p-0 shadow-lg">
          <div className="border-b border-line2/60 bg-cream/60 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                onSelectDate(fromISODate(HOJE_ISO));
                setAberto(false);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber/50 bg-amber/20 py-1.5 font-mono text-xs font-bold text-amberdeep transition-all active:scale-95"
            >
              <Sparkles className="size-3.5" />
              Ir para Hoje (
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}
              )
            </button>
          </div>
          <Calendar
            mode="single"
            locale={ptBR}
            selected={selectedDate}
            month={mes}
            onMonthChange={setMes}
            onSelect={(d) => {
              if (d) {
                onSelectDate(d);
                setAberto(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <button
        type="button"
        aria-label="Próximo dia"
        onClick={() => onSelectDate(addDays(selectedDate, 1))}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line2/60 bg-paper text-ink transition-all hover:bg-card active:scale-95"
      >
        <ChevronRight className="size-4.5" />
      </button>
    </div>
  );
}
