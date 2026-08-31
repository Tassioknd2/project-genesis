import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HOJE_ISO, fromISODate } from "@/lib/agenda-data";
import {
  NovoAgendamentoWizard,
  type NovoAgendamentoDraft,
} from "@/components/NovoAgendamentoWizard";

interface AppHeaderProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onNovoAgendamento?: (draft: NovoAgendamentoDraft) => void;
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function AppHeader({
  selectedDate,
  onSelectDate,
  onNovoAgendamento,
}: AppHeaderProps = {}) {
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState<Date>(new Date());
  const [dataLocal, setDataLocal] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [wizardAberto, setWizardAberto] = useState(false);

  const data = selectedDate ?? dataLocal;
  const selecionar = onSelectDate ?? setDataLocal;

  function abrir(open: boolean) {
    // Sempre reabre no mês atual, como pedido.
    if (open) setMes(new Date());
    setAberto(open);
  }

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
            onClick={() => selecionar(addDays(data, -1))}
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-all hover:bg-card/60 active:scale-90"
          >
            <ChevronLeft className="size-4" />
          </button>

          <Popover open={aberto} onOpenChange={abrir}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Abrir calendário do mês"
                className={cn(
                  "min-w-[160px] rounded-lg px-4 py-1 text-center transition-colors hover:bg-card/60",
                  aberto && "bg-card/70",
                )}
              >
                <div className="text-[13px] font-bold tracking-tight">
                  {data.getDate()} de {MESES[data.getMonth()]},{" "}
                  {data.getFullYear()}
                </div>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-widest text-amber">
                  {DIAS[data.getDay()]}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
              <Calendar
                mode="single"
                locale={ptBR}
                month={mes}
                onMonthChange={setMes}
                selected={data}
                onSelect={(d) => {
                  if (!d) return;
                  selecionar(d);
                  setAberto(false);
                }}
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="flex items-center justify-between border-t border-line2/50 px-3 py-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                  Escolha um dia
                </span>
                <button
                  type="button"
                  onClick={() => {
                    selecionar(new Date());
                    setAberto(false);
                  }}
                  className="text-[11px] font-bold uppercase tracking-wider text-amber hover:text-amberdeep"
                >
                  Hoje
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            aria-label="Próximo dia"
            onClick={() => selecionar(addDays(data, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-all hover:bg-card/60 active:scale-90"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="header-item flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/pacientes"
            className="hidden text-xs font-bold uppercase tracking-wider text-inksoft transition-colors hover:text-amber md:block"
          >
            Pacientes
          </Link>

<button
            type="button"
            onClick={() => setWizardAberto(true)}
            className="h-9 rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:translate-y-px"
          >
            Novo agendamento
          </button>
        </div>
      </div>

      <NovoAgendamentoWizard
        open={wizardAberto}
        onOpenChange={setWizardAberto}
        dataInicial={data}
        onSalvar={(draft) => {
          if (onNovoAgendamento) {
            onNovoAgendamento(draft);
          } else {
            toast.info("Esta ação exige confirmação humana", {
              description: "Disponível na versão conectada.",
            });
          }
          setWizardAberto(false);
        }}
      />
    </header>
  );
}
