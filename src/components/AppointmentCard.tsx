import type { Appointment, AppointmentStatus } from "@/lib/agenda-data";
import { StatusBadge } from "@/components/StatusBadge";

interface Action {
  label: string;
  status?: AppointmentStatus;
  primary?: boolean;
}

function acoesPara(status: AppointmentStatus): Action[] {
  switch (status) {
    case "agendado":
      return [
        { label: "Enviar confirmação", status: "aguardando", primary: true },
        { label: "Remarcar", status: "remarcado" },
        { label: "Cancelar" },
      ];
    case "aguardando":
      return [
        { label: "Confirmar manualmente", status: "confirmado", primary: true },
        { label: "Reenviar lembrete" },
        { label: "Remarcar", status: "remarcado" },
      ];
    case "confirmado":
      return [
        { label: "Concluir", status: "concluido", primary: true },
        { label: "Marcar falta", status: "falta" },
        { label: "Remarcar", status: "remarcado" },
      ];
    case "recusado":
      return [
        { label: "Remarcar", status: "remarcado", primary: true },
        { label: "Cancelar" },
        { label: "Contatar" },
      ];
    case "falha_envio":
      return [
        { label: "Reenviar", status: "aguardando", primary: true },
        { label: "Ligar" },
        { label: "Remarcar", status: "remarcado" },
      ];
    case "falta":
      return [{ label: "Remarcar", status: "remarcado", primary: true }, { label: "Ligar" }];
    case "concluido":
      return [{ label: "Ver histórico" }];
    default:
      return [{ label: "Ver histórico" }];
  }
}

export function AppointmentCard({
  appointment,
  index,
  onAction,
}: {
  appointment: Appointment;
  index: number;
  onAction: (appointment: Appointment, action: Action) => void;
}) {
  const { paciente } = appointment;
  const particular = paciente.convenio === "Particular";

  return (
    <article
      className="card-rise group overflow-hidden rounded-2xl border border-line2/50 bg-card transition-all hover:border-amber/30 hover:shadow-md"
      style={{ animationDelay: `${300 + index * 50}ms` }}
    >
      <div className="flex">
        <div className="flex w-24 shrink-0 flex-col items-center justify-center border-r border-line bg-line/20 py-5">
          <span className="font-mono text-lg font-bold tracking-tighter">
            {appointment.hora}
          </span>
          <span className="font-mono text-[10px] uppercase text-inksoft/60">
            {appointment.duracaoMin} min
          </span>
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-[15px] font-bold tracking-tight">{paciente.nome}</h3>
                <span className="font-mono text-[10px] text-inksoft">{paciente.idade} anos</span>
                <span
                  className={
                    particular
                      ? "rounded-full border border-amber/20 bg-amber/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amberdeep"
                      : "rounded-full border border-ink/5 bg-mutbg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-inksoft"
                  }
                >
                  {paciente.convenio}
                </span>
              </div>
              <p className="flex items-center gap-2 text-xs text-inksoft">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  {appointment.tipo}
                </span>
                <span className="size-1 rounded-full bg-line2" />
                <span>{appointment.medico}</span>
              </p>
            </div>

            <StatusBadge status={appointment.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {acoesPara(appointment.status).map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onAction(appointment, action)}
                className={
                  action.primary
                    ? "h-8 rounded-lg bg-ink px-3 text-[11px] font-bold uppercase tracking-wide text-cream transition-colors hover:bg-ink/90"
                    : "h-8 rounded-lg border border-line bg-card px-3 text-[11px] font-semibold uppercase tracking-wide text-inksoft transition-colors hover:border-ink/30"
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export type { Action };
