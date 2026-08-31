import { useState } from "react";
import { Mail, MailOpen, Plus, StickyNote, Tag, X } from "lucide-react";
import type { Appointment, AppointmentStatus, Etiqueta, EtiquetaCor } from "@/lib/agenda-data";
import { ETIQUETA_CORES, classeDaCor } from "@/lib/agenda-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onAction: (appointment: Appointment, action: Action) => void;
  notas?: string[];
  etiquetas?: Etiqueta[];
  onAddNota?: (texto: string) => void;
  onRemoveNota?: (indice: number) => void;
  onAddEtiqueta?: (texto: string, cor: EtiquetaCor) => void;
  onRemoveEtiqueta?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  index,
  onAction,
  notas = [],
  etiquetas = [],
  onAddNota,
  onRemoveNota,
  onAddEtiqueta,
  onRemoveEtiqueta,
}: AppointmentCardProps) {
  const { paciente } = appointment;
  const particular = paciente.convenio === "Particular";
  const concluido = appointment.status === "concluido";

  const [envelopeAberto, setEnvelopeAberto] = useState(false);
  const [notasAbertas, setNotasAbertas] = useState(false);
  const [novaNota, setNovaNota] = useState("");
  const [etiquetaAberta, setEtiquetaAberta] = useState(false);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");
  const [corEtiqueta, setCorEtiqueta] = useState<EtiquetaCor>("ambar");

  const todasNotas = [...(paciente.observacoes ? [paciente.observacoes] : []), ...notas];
  const selado = concluido && !envelopeAberto;

  function salvarNota() {
    const texto = novaNota.trim();
    if (!texto) return;
    onAddNota?.(texto);
    setNovaNota("");
    setNotasAbertas(false);
  }

  function salvarEtiqueta() {
    const texto = novaEtiqueta.trim();
    if (!texto) return;
    onAddEtiqueta?.(texto, corEtiqueta);
    setNovaEtiqueta("");
    setEtiquetaAberta(false);
  }

  return (
    <article
      className={cn(
        "card-rise group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        concluido
          ? "border-ok/40 hover:border-ok/60"
          : "border-line2/50 hover:border-amber/30",
      )}
      style={{ animationDelay: `${300 + index * 50}ms` }}
    >
      <div className="flex">
        <div
          className={cn(
            "flex w-24 shrink-0 flex-col items-center justify-center border-r py-5",
            concluido ? "border-ok/25 bg-ok/10" : "border-line bg-line/20",
          )}
        >
          <span className="font-mono text-lg font-bold tracking-tighter">
            {appointment.hora}
          </span>
          <span className="font-mono text-[10px] uppercase text-inksoft/60">
            {appointment.duracaoMin} min
          </span>
        </div>

        <div className="flex-1 p-5">
          {/* Etiquetas (estilo Trello) */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {etiquetas.map((et) => (
              <span
                key={et.id}
                className={cn(
                  "group/tag inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  classeDaCor(et.cor),
                )}
              >
                <Tag className="size-2.5" aria-hidden />
                {et.texto}
                {onRemoveEtiqueta && (
                  <button
                    type="button"
                    aria-label={`Remover etiqueta ${et.texto}`}
                    onClick={() => onRemoveEtiqueta(et.id)}
                    className="opacity-0 transition-opacity group-hover/tag:opacity-70 hover:opacity-100"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </span>
            ))}

            <Popover open={etiquetaAberta} onOpenChange={setEtiquetaAberta}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Adicionar etiqueta"
                  title="Adicionar etiqueta"
                  className="flex size-5 items-center justify-center rounded-md border border-dashed border-line2 text-inksoft transition-all hover:border-amber hover:text-amber active:scale-90"
                >
                  <Plus className="size-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 space-y-3 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                  Nova etiqueta
                </p>
                <input
                  autoFocus
                  value={novaEtiqueta}
                  onChange={(e) => setNovaEtiqueta(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && salvarEtiqueta()}
                  placeholder="Ex.: Prioridade, Jejum..."
                  className="h-9 w-full rounded-lg border border-line2 bg-card px-3 text-xs font-medium focus:border-amber focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {ETIQUETA_CORES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={c.rotulo}
                      onClick={() => setCorEtiqueta(c.id)}
                      className={cn(
                        "size-6 rounded-md border-2 transition-transform active:scale-90",
                        c.classe,
                        corEtiqueta === c.id ? "border-ink" : "border-transparent",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={salvarEtiqueta}
                  className="h-8 w-full rounded-lg bg-ink text-[11px] font-bold uppercase tracking-wider text-cream transition-colors hover:bg-ink/90"
                >
                  Adicionar
                </button>
              </PopoverContent>
            </Popover>
          </div>

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

            <div className="flex items-center gap-2">
              {concluido && (
                <button
                  type="button"
                  onClick={() => setEnvelopeAberto((v) => !v)}
                  aria-expanded={envelopeAberto}
                  title={selado ? "Atendimento concluído — abrir envelope" : "Fechar envelope"}
                  className="flex items-center gap-1.5 rounded-lg border border-ok/30 bg-ok/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ok transition-all hover:bg-ok/25 active:scale-95"
                >
                  {selado ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />}
                  {selado ? "Selado" : "Aberto"}
                </button>
              )}
              <StatusBadge status={appointment.status} />
            </div>
          </div>

          {/* Observações visíveis no cartão */}
          {todasNotas.length > 0 && !selado && (
            <ul className="mt-3 space-y-1.5">
              {todasNotas.map((nota, i) => (
                <li
                  key={`${nota}-${i}`}
                  className="flex items-start gap-2 rounded-lg border border-warn/25 bg-warnbg/60 px-3 py-2 text-xs leading-snug text-ink"
                >
                  <StickyNote className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden />
                  <span className="flex-1">{nota}</span>
                  {onRemoveNota && i >= todasNotas.length - notas.length && (
                    <button
                      type="button"
                      aria-label="Remover observação"
                      onClick={() => onRemoveNota(i - (todasNotas.length - notas.length))}
                      className="text-inksoft opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {/* Botão de observação — sempre visível, com contagem */}
            <Popover open={notasAbertas} onOpenChange={setNotasAbertas}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-[11px] font-semibold uppercase tracking-wide text-inksoft transition-colors hover:border-ink/30"
                >
                  <StickyNote className="size-3.5" aria-hidden />
                  Observação
                  {todasNotas.length > 0 && (
                    <span className="rounded-full bg-warnbg px-1.5 font-mono text-[10px] font-bold tabular-nums text-warn">
                      {todasNotas.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 space-y-3 p-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                  Observações de {paciente.nome.split(" ")[0]}
                </p>
                {todasNotas.length === 0 && (
                  <p className="text-xs text-inksoft">Nenhuma observação registrada.</p>
                )}
                <textarea
                  value={novaNota}
                  onChange={(e) => setNovaNota(e.target.value)}
                  rows={3}
                  placeholder="Escreva uma observação..."
                  className="w-full resize-none rounded-lg border border-line2 bg-card p-2 text-xs focus:border-amber focus:outline-none"
                />
                <button
                  type="button"
                  onClick={salvarNota}
                  className="h-8 w-full rounded-lg bg-ink text-[11px] font-bold uppercase tracking-wider text-cream transition-colors hover:bg-ink/90"
                >
                  Salvar observação
                </button>
              </PopoverContent>
            </Popover>

            <span className="flex flex-wrap items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export type { Action };
