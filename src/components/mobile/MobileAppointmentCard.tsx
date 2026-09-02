import {
  Activity,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  HeartPulse,
  MessageCircle,
  Phone,
  RotateCcw,
  Send,
  Stethoscope,
  Tag,
  UserCheck,
  Waves,
  X,
} from "lucide-react";
import type { Appointment, AppointmentStatus, Etiqueta, TipoAtendimento } from "@/lib/agenda-data";
import { calcularIdade, classeDaCor } from "@/lib/agenda-data";
import { StatusBadge } from "@/components/StatusBadge";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import { cn } from "@/lib/utils";

export interface MobileAction {
  label: string;
  status?: AppointmentStatus;
  primary?: boolean;
  icon?: typeof Send;
  variant?: "primary" | "secondary" | "danger" | "success";
}

function getTipoIcon(tipo: TipoAtendimento) {
  switch (tipo) {
    case "Consulta":
    case "Retorno":
      return Stethoscope;
    case "Eletrocardiograma":
      return HeartPulse;
    case "Ecocardiograma":
      return Waves;
    case "Teste ergométrico":
      return Flame;
    case "Holter 24h":
      return CalendarClock;
    case "MAPA":
      return Gauge;
    default:
      return Activity;
  }
}

function acoesMobilePara(status: AppointmentStatus): MobileAction[] {
  switch (status) {
    case "agendado":
      return [
        { label: "WhatsApp", status: "aguardando", primary: true, variant: "primary", icon: Send },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
      ];
    case "aguardando":
      return [
        {
          label: "Confirmar",
          status: "confirmado",
          primary: true,
          variant: "success",
          icon: UserCheck,
        },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
      ];
    case "confirmado":
      return [
        {
          label: "Concluir",
          status: "concluido",
          primary: true,
          variant: "success",
          icon: BadgeCheck,
        },
        { label: "Falta", status: "falta", variant: "danger", icon: X },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
      ];
    case "recusado":
      return [
        {
          label: "Remarcar",
          status: "remarcado",
          primary: true,
          variant: "primary",
          icon: RotateCcw,
        },
        { label: "WhatsApp", variant: "secondary", icon: MessageCircle },
      ];
    case "falha_envio":
      return [
        { label: "Reenviar", status: "aguardando", primary: true, variant: "primary", icon: Send },
        { label: "Ligar", variant: "secondary", icon: Phone },
      ];
    case "falta":
      return [
        {
          label: "Remarcar",
          status: "remarcado",
          primary: true,
          variant: "primary",
          icon: RotateCcw,
        },
      ];
    default:
      return [];
  }
}

export interface MobileAppointmentCardProps {
  appointment: Appointment;
  index: number;
  onAction: (appointment: Appointment, action: MobileAction) => void;
  notas?: string[];
  etiquetas?: Etiqueta[];
  onEditar?: () => void;
  onRemarcar?: (appointment: Appointment) => void;
}

export function MobileAppointmentCard({
  appointment,
  index,
  onAction,
  notas = [],
  etiquetas = [],
  onEditar,
  onRemarcar,
}: MobileAppointmentCardProps) {
  const { paciente } = appointment;
  const particular = paciente.convenio.toLowerCase().includes("particular");
  const concluido = appointment.status === "concluido";
  const acoes = acoesMobilePara(appointment.status);
  const idadePaciente = calcularIdade(paciente.dataNascimento, paciente.idade);

  const procedimentos: TipoAtendimento[] =
    appointment.tipos && appointment.tipos.length > 0 ? appointment.tipos : [appointment.tipo];

  const mensagemWhatsApp = `Olá ${paciente.nome.split(" ")[0]}, confirmamos seu atendimento de ${procedimentos.join(" + ")} com ${appointment.medico} às ${appointment.hora}.`;

  return (
    <article
      id={`mobile-card-${appointment.id}`}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-3.5 transition-all active:scale-[0.99]",
        concluido ? "border-ok/30 bg-card/95" : "border-line2/80 shadow-2xs",
      )}
      style={{ animationDelay: `${50 + index * 25}ms` }}
    >
      {/* Faixa superior de horário, status e edição */}
      <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-lg bg-paper px-2 py-0.5 font-mono text-sm font-black text-ink shadow-2xs">
            <Clock className="size-3 text-amberdeep" />
            {appointment.hora}
          </span>
          <span className="font-mono text-[10px] text-inksoft">{appointment.duracaoMin} min</span>
        </div>

        <div className="flex items-center gap-1.5">
          <StatusBadge status={appointment.status} showDot={false} />
          {onEditar && <BotaoCaneta onClick={onEditar} rotulo="Editar" className="size-7" />}
        </div>
      </div>

      {/* Identificação do Paciente */}
      <div className="mt-2.5 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-bold tracking-tight text-ink">{paciente.nome}</h3>
          <span className="font-mono text-xs text-inksoft shrink-0">
            {idadePaciente} {idadePaciente === 1 ? "ano" : "anos"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-inksoft">
          <span
            className={cn(
              "rounded-full px-2 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider",
              particular
                ? "border border-amber/30 bg-amber/10 text-amberdeep"
                : "border border-line2 bg-mutbg/60 text-inksoft",
            )}
          >
            {paciente.convenio}
          </span>
          <span className="text-[11px]">{appointment.medico}</span>
        </div>
      </div>

      {/* Procedimentos */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {procedimentos.map((proc) => {
          const ProcIcon = getTipoIcon(proc);
          return (
            <span
              key={proc}
              className="inline-flex items-center gap-1 rounded-md border border-line2/50 bg-paper/60 px-2 py-0.5 text-[10px] font-semibold text-ink"
            >
              <ProcIcon className="size-3 text-amberdeep" />
              <span>{proc}</span>
            </span>
          );
        })}

        {etiquetas.map((et) => (
          <span
            key={et.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase",
              classeDaCor(et.cor),
            )}
          >
            <Tag className="size-2.5" />
            {et.texto}
          </span>
        ))}
      </div>

      {/* Ações Rápidas Móveis (Área de Toque Generosa) */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
        <a
          href={`https://wa.me/55${paciente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
            mensagemWhatsApp,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 min-w-[44px] items-center justify-center gap-1 rounded-xl border border-line2 bg-paper px-3 text-xs font-bold text-inksoft transition-colors hover:text-ok active:scale-95"
        >
          <MessageCircle className="size-4 text-ok" />
          <span className="text-[11px]">WhatsApp</span>
        </a>

        <div className="flex items-center gap-1.5">
          {acoes.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.primary;
            const isRemarcar =
              action.status === "remarcado" || action.label.toLowerCase().includes("remarcar");

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (isRemarcar && onRemarcar) {
                    onRemarcar(appointment);
                  } else {
                    onAction(appointment, action);
                  }
                }}
                className={cn(
                  "flex h-9 min-w-[44px] items-center justify-center gap-1 rounded-xl px-3 text-xs font-bold transition-all active:scale-95",
                  isPrimary && action.variant === "success" && "bg-ok text-cream shadow-xs",
                  isPrimary && action.variant === "primary" && "bg-ink text-cream shadow-xs",
                  !isPrimary &&
                    action.variant === "danger" &&
                    "border border-bad/30 bg-bad/10 text-bad",
                  !isPrimary &&
                    action.variant !== "danger" &&
                    "border border-line2 bg-card text-inksoft",
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
