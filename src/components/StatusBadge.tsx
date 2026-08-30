import { Check, Clock, X, Zap, AlertTriangle, Circle, RefreshCcw } from "lucide-react";
import { statusInfo, type AppointmentStatus } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<AppointmentStatus, { classes: string; icon: typeof Check }> = {
  agendado: { classes: "bg-mutbg text-mut border-ink/5", icon: Circle },
  aguardando: { classes: "bg-warnbg text-warn border-warn/20", icon: Clock },
  confirmado: { classes: "bg-okbg text-ok border-ok/20", icon: Check },
  recusado: { classes: "bg-badbg text-bad border-bad/20", icon: X },
  falha_envio: { classes: "bg-badbg text-bad border-bad/20", icon: Zap },
  concluido: { classes: "bg-okbg text-ok border-ok/20", icon: Check },
  falta: { classes: "bg-badbg text-bad border-bad/20", icon: AlertTriangle },
  remarcado: { classes: "bg-mutbg text-mut border-ink/5", icon: RefreshCcw },
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const info = statusInfo[status];
  const style = statusStyles[status];
  const Icon = style.icon;
  return (
    <span
      title={info.descricao}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
        style.classes,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {info.rotulo}
    </span>
  );
}
