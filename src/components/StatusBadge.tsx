import {
  Check,
  Clock,
  X,
  AlertCircle,
  Circle,
  RefreshCcw,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import { statusInfo, type AppointmentStatus } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  AppointmentStatus,
  { classes: string; dotClass: string; icon: typeof Check }
> = {
  agendado: {
    classes: "bg-mutbg/80 text-mut border-line2/70",
    dotClass: "bg-mut",
    icon: Circle,
  },
  aguardando: {
    classes: "bg-amber/10 text-amberdeep border-amber/30 dark:bg-amber/15",
    dotClass: "bg-amber animate-pulse",
    icon: Clock,
  },
  confirmado: {
    classes: "bg-okbg/90 text-ok border-ok/30 dark:bg-okbg/60",
    dotClass: "bg-ok",
    icon: Check,
  },
  recusado: {
    classes: "bg-badbg/90 text-bad border-bad/30 dark:bg-badbg/60",
    dotClass: "bg-bad",
    icon: X,
  },
  falha_envio: {
    classes: "bg-badbg/90 text-bad border-bad/30 dark:bg-badbg/60",
    dotClass: "bg-bad animate-ping",
    icon: PhoneCall,
  },
  concluido: {
    classes: "bg-okbg/70 text-ok border-ok/30 dark:bg-okbg/50",
    dotClass: "bg-ok",
    icon: CheckCircle2,
  },
  falta: {
    classes: "bg-badbg/90 text-bad border-bad/30 dark:bg-badbg/60",
    dotClass: "bg-bad",
    icon: AlertCircle,
  },
  remarcado: {
    classes: "bg-mutbg/80 text-mut border-line2/70",
    dotClass: "bg-mut",
    icon: RefreshCcw,
  },
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: {
  status: AppointmentStatus;
  className?: string;
  showDot?: boolean;
}) {
  const info = statusInfo[status];
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span
      title={info.descricao}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs transition-colors",
        style.classes,
        className,
      )}
    >
      {showDot && (
        <span className="relative flex size-1.5 shrink-0 items-center justify-center">
          <span className={cn("size-1.5 rounded-full", style.dotClass)} />
        </span>
      )}
      <Icon className="size-3 shrink-0" aria-hidden />
      <span>{info.rotulo}</span>
    </span>
  );
}
