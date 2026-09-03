import { useCallback, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Plus,
  Users,
  LogOut,
  User as UserIcon,
  Stethoscope,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  HOJE_ISO,
  fromISODate,
  getAgendaPorData,
  toISODate,
  type Appointment,
} from "@/lib/agenda-data";
import { CalendarioPainel } from "@/components/CalendarioPainel";
import { VisaoDoMesDialog } from "@/components/VisaoDoMesDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NovoAgendamentoWizard,
  type NovoAgendamentoDraft,
} from "@/components/NovoAgendamentoWizard";

export interface DesktopAppHeaderProps {
  selectedDate?: Date | undefined;
  onSelectDate?: ((date: Date) => void) | undefined;
  onNovoAgendamento?: ((draft: NovoAgendamentoDraft) => void) | undefined;
  /** Resolve a agenda de uma data (inclui alterações feitas na sessão). */
  agendaDoDia?: ((iso: string) => Appointment[]) | undefined;
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

export function DesktopAppHeader({
  selectedDate,
  onSelectDate,
  onNovoAgendamento,
  agendaDoDia,
}: DesktopAppHeaderProps = {}) {
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [dataLocal, setDataLocal] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [wizardAberto, setWizardAberto] = useState(false);
  const [visaoMesAberta, setVisaoMesAberta] = useState(false);
  const [hojeISO, setHojeISO] = useState(HOJE_ISO);

  // O "hoje" real da máquina só é lido após a hidratação (evita divergência no SSR).
  useEffect(() => {
    setHojeISO(toISODate(new Date()));
  }, []);

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { user, logout } = useAuth();

  const data = selectedDate ?? dataLocal;
  const selecionar = onSelectDate ?? setDataLocal;

  const resolverAgenda = useCallback(
    (iso: string) => (agendaDoDia ? agendaDoDia(iso) : getAgendaPorData(iso)),
    [agendaDoDia],
  );

  function abrir(open: boolean) {
    if (open) setMes(data);
    setAberto(open);
  }

  const isToday = toISODate(data) === hojeISO;

  return (
    <header
      id="desktop-app-header"
      className="sticky top-0 z-30 border-b border-line2/60 bg-paper/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-6 lg:px-8">
        {/* Marca da Clínica */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-ink font-mono text-sm font-black text-cream shadow-sm">
            <HeartPulse className="size-5 text-amber" />
            <div className="absolute -bottom-1 -right-1 size-2.5 rounded-full border-2 border-paper bg-ok" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px] font-black uppercase tracking-tight text-ink">
                Agenda<span className="text-amber">Cardio</span>
              </span>
              <span className="rounded-md bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-extrabold uppercase text-amberdeep">
                Pro
              </span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-inksoft">
              Cardiologia & Diagnóstico
            </p>
          </div>
        </Link>

        {/* Navegador de Data Desktop com CalendarioPainel */}
        <div className="flex items-center rounded-xl border border-line2 bg-card/80 p-1 shadow-2xs">
          <button
            type="button"
            aria-label="Dia anterior"
            title="Dia anterior"
            onClick={() => selecionar(addDays(data, -1))}
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-colors hover:bg-paper hover:text-ink active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>

          <Popover open={aberto} onOpenChange={abrir}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Abrir calendário do mês"
                className={cn(
                  "flex min-w-[180px] flex-col items-center justify-center rounded-lg px-3 py-1 transition-colors hover:bg-paper",
                  aberto && "bg-paper",
                )}
              >
                <div className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight text-ink">
                  <CalendarIcon className="size-3 text-amber" />
                  <span>
                    {data.getDate()} de {MESES[data.getMonth()]}, {data.getFullYear()}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amberdeep">
                  <span>{DIAS[data.getDay()]}</span>
                  {isToday && (
                    <span className="rounded-full bg-amber/15 px-1 py-0.2 text-[8px] font-black text-amberdeep">
                      Hoje
                    </span>
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-auto p-0">
              <CalendarioPainel
                mes={mes}
                onMesChange={setMes}
                selecionada={data}
                onSelecionar={(d) => {
                  selecionar(d);
                  setAberto(false);
                }}
                hojeISO={hojeISO}
                agendaDoDia={resolverAgenda}
                onAbrirVisaoMes={() => {
                  setAberto(false);
                  setVisaoMesAberta(true);
                }}
                onIrParaHoje={() => {
                  const hoje = fromISODate(hojeISO);
                  selecionar(hoje);
                  setMes(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
                  setAberto(false);
                }}
              />
            </PopoverContent>
          </Popover>

          <button
            type="button"
            aria-label="Próximo dia"
            title="Próximo dia"
            onClick={() => selecionar(addDays(data, 1))}
            className="flex size-8 items-center justify-center rounded-lg text-inksoft transition-colors hover:bg-paper hover:text-ink active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Ações e Navegação Desktop */}
        <div className="flex items-center gap-3">
          <Link
            to="/pacientes"
            aria-label="Acessar diretório de pacientes"
            className={cn(
              "inline-flex h-9.5 items-center gap-2 rounded-xl border px-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95",
              pathname === "/pacientes"
                ? "border-ink bg-ink text-cream shadow-xs"
                : "border-line2/80 bg-card text-ink shadow-2xs hover:border-amber/60 hover:bg-paper hover:text-amberdeep",
            )}
          >
            <Users
              className={cn(
                "size-4 shrink-0 transition-colors",
                pathname === "/pacientes" ? "text-amber" : "text-amberdeep",
              )}
            />
            <span>Pacientes</span>
          </Link>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setWizardAberto(true)}
            className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-ink px-4 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-95"
          >
            <Plus className="size-4 text-amber" />
            <span>Novo agendamento</span>
          </button>

          {/* Perfil do Usuário e Logout */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  id="user-profile-menu-button"
                  className="flex items-center gap-2 rounded-xl border border-line2/80 bg-card p-1.5 pr-3 shadow-2xs transition-all hover:border-amber/60 hover:bg-paper active:scale-95"
                >
                  <div className="relative flex size-7 items-center justify-center rounded-lg bg-ink text-xs font-bold text-cream">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.nome}
                        className="size-7 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.nome.substring(0, 2).toUpperCase()
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-card bg-ok" />
                  </div>
                  <div className="text-left leading-tight hidden lg:block">
                    <div className="text-xs font-bold text-ink max-w-[110px] truncate">
                      {user.nome}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-amberdeep">
                      {user.role === "medico" ? "Cardiologista" : "Recepção"}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="text-xs font-bold text-ink">{user.nome}</div>
                  <div className="text-[11px] text-inksoft truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="rounded bg-amber/15 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-amberdeep">
                      {user.role}
                    </span>
                    {user.crm && (
                      <span className="font-mono text-[9px] text-inksoft">CRM {user.crm}</span>
                    )}
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
              className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-line2/80 bg-card px-3 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-2xs hover:border-amber/60 hover:bg-paper hover:text-amberdeep"
            >
              <UserIcon className="size-3.5 text-amber" />
              <span>Entrar</span>
            </Link>
          )}
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
            toast.info("Agendamento criado com sucesso", {
              description: `${draft.paciente.nome} · ${draft.tipo} às ${draft.hora}`,
            });
          }
          setWizardAberto(false);
        }}
      />

      <VisaoDoMesDialog
        open={visaoMesAberta}
        onOpenChange={setVisaoMesAberta}
        mes={mes}
        onMesChange={setMes}
        selecionada={data}
        onSelecionarDia={selecionar}
        hojeISO={hojeISO}
        agendaDoDia={resolverAgenda}
      />
    </header>
  );
}
