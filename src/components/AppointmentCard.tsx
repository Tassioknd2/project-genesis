import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gauge,
  HeartPulse,
  Mail,
  MailOpen,
  MessageCircle,
  MessageSquareText,
  Phone,
  Plus,
  RotateCcw,
  Send,
  Stethoscope,
  StickyNote,
  Tag,
  UserCheck,
  Waves,
  X,
} from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
  Etiqueta,
  EtiquetaCor,
  TipoAtendimento,
} from "@/lib/agenda-data";
import { ETIQUETA_CORES, classeDaCor } from "@/lib/agenda-data";
import { StatusBadge } from "@/components/StatusBadge";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Action {
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

function acoesPara(status: AppointmentStatus): Action[] {
  switch (status) {
    case "agendado":
      return [
        {
          label: "Enviar WhatsApp",
          status: "aguardando",
          primary: true,
          variant: "primary",
          icon: Send,
        },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
        { label: "Cancelar", variant: "danger", icon: X },
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
        { label: "Reenviar lembrete", variant: "secondary", icon: Send },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
      ];
    case "confirmado":
      return [
        {
          label: "Concluir atendimento",
          status: "concluido",
          primary: true,
          variant: "success",
          icon: BadgeCheck,
        },
        { label: "Marcar falta", status: "falta", variant: "danger", icon: X },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
      ];
    case "recusado":
      return [
        {
          label: "Remarcar horário",
          status: "remarcado",
          primary: true,
          variant: "primary",
          icon: RotateCcw,
        },
        { label: "Contatar WhatsApp", variant: "secondary", icon: MessageCircle },
        { label: "Cancelar", variant: "danger", icon: X },
      ];
    case "falha_envio":
      return [
        {
          label: "Tentar reenviar",
          status: "aguardando",
          primary: true,
          variant: "primary",
          icon: Send,
        },
        { label: "Ligar para paciente", variant: "secondary", icon: Phone },
        { label: "Remarcar", status: "remarcado", variant: "secondary", icon: RotateCcw },
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
        { label: "Ligar", variant: "secondary", icon: Phone },
      ];
    case "concluido":
      return [{ label: "Ver histórico", variant: "secondary", icon: ExternalLink }];
    default:
      return [{ label: "Ver histórico", variant: "secondary", icon: ExternalLink }];
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
  onEditar?: () => void;
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
  onEditar,
}: AppointmentCardProps) {
  const { paciente } = appointment;
  const particular = paciente.convenio.toLowerCase().includes("particular");
  const concluido = appointment.status === "concluido";
  const aguardando = appointment.status === "aguardando";
  const confirmado = appointment.status === "confirmado";
  const recusado = appointment.status === "recusado";
  const falha = appointment.status === "falha_envio";
  const falta = appointment.status === "falta";

  const [envelopeAberto, setEnvelopeAberto] = useState(false);
  const [notasAbertas, setNotasAbertas] = useState(false);
  const [novaNota, setNovaNota] = useState("");
  const [etiquetaAberta, setEtiquetaAberta] = useState(false);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");
  const [corEtiqueta, setCorEtiqueta] = useState<EtiquetaCor>("ambar");

  const todasNotas = [...(paciente.observacoes ? [paciente.observacoes] : []), ...notas];
  const selado = concluido && !envelopeAberto;
  const TipoIcon = getTipoIcon(appointment.tipo);
  const acoes = acoesPara(appointment.status);

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

  // Procedimentos agendados (único ou múltiplos)
  const procedimentos: TipoAtendimento[] =
    appointment.tipos && appointment.tipos.length > 0 ? appointment.tipos : [appointment.tipo];

  // Gera mensagem simulada de WhatsApp para o paciente
  const nomesProcedimentos = procedimentos.join(" + ");
  const mensagemWhatsApp = `Olá ${paciente.nome.split(" ")[0]}, confirmamos seu atendimento de ${nomesProcedimentos} com ${appointment.medico} às ${appointment.hora}. Responda 1 para confirmar ou 2 para remarcar.`;

  return (
    <article
      className={cn(
        "card-rise group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-md",
        concluido && "border-ok/40 bg-card/95 hover:border-ok/60",
        confirmado && "border-line2/70 hover:border-ok/40",
        aguardando && "border-amber/30 hover:border-amber/60 bg-amber/[0.02]",
        recusado && "border-bad/30 hover:border-bad/50 bg-bad/[0.02]",
        falha && "border-bad/40 hover:border-bad/60 bg-bad/[0.03]",
        falta && "border-bad/40 opacity-80 hover:opacity-100",
        appointment.status === "agendado" && "border-line2/70 hover:border-line2",
      )}
      style={{ animationDelay: `${100 + index * 35}ms` }}
    >
      {/* Barra superior de status sutil */}
      <div
        className={cn(
          "h-1 w-full transition-colors",
          concluido && "bg-ok/60",
          confirmado && "bg-ok/80",
          aguardando && "bg-amber",
          recusado && "bg-bad/80",
          falha && "bg-bad",
          falta && "bg-bad/70",
          appointment.status === "agendado" && "bg-mut/40",
        )}
      />

      <div className="flex flex-col sm:flex-row">
        {/* Trilho de Horário */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-b px-4 py-3 sm:w-28 sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:py-5",
            concluido
              ? "border-ok/25 bg-ok/5 sm:items-center sm:justify-center"
              : "border-line bg-paper/40 sm:gap-1.5",
          )}
        >
          {concluido ? (
            <div
              className="flex w-full items-center justify-center py-1 sm:py-2"
              title="Atendimento concluído"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-ok/15 text-ok ring-1 ring-ok/30 shadow-2xs transition-transform group-hover:scale-105">
                <CheckCircle2 className="size-6 stroke-[2.25] text-ok" aria-hidden />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 sm:flex-col sm:gap-0.5">
                <span className="font-mono text-base font-black tracking-tight text-ink sm:text-lg">
                  {appointment.hora}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-inksoft">
                  <Clock className="size-2.5 opacity-60" aria-hidden />
                  {appointment.duracaoMin} min
                </span>
              </div>

              <div className="sm:mt-1">
                <StatusBadge status={appointment.status} showDot={false} />
              </div>
            </>
          )}
        </div>

        {/* Informações Principais */}
        <div className="flex-1 p-4 sm:p-5">
          {/* Topo: Etiquetas e Ações de Cabeçalho */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Badges de Procedimentos */}
              {procedimentos.map((proc) => {
                const ProcIcon = getTipoIcon(proc);
                return (
                  <span
                    key={proc}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line2/60 bg-paper/60 px-2.5 py-1 text-[11px] font-bold text-ink shadow-2xs"
                  >
                    <ProcIcon className="size-3.5 text-amberdeep" aria-hidden />
                    <span>{proc}</span>
                  </span>
                );
              })}

              {/* Etiquetas personalizadas */}
              {etiquetas.map((et) => (
                <span
                  key={et.id}
                  className={cn(
                    "group/tag inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-2xs",
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
                      className="ml-0.5 text-ink/60 transition-opacity hover:text-ink"
                    >
                      <X className="size-2.5" />
                    </button>
                  )}
                </span>
              ))}

              {/* Adicionar etiqueta */}
              <Popover open={etiquetaAberta} onOpenChange={setEtiquetaAberta}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Adicionar etiqueta"
                    title="Adicionar etiqueta"
                    className="flex size-6 items-center justify-center rounded-md border border-dashed border-line2 text-inksoft transition-colors hover:border-amber hover:text-amber active:scale-95"
                  >
                    <Plus className="size-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 space-y-3 p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    Nova etiqueta rápida
                  </p>
                  <input
                    autoFocus
                    value={novaEtiqueta}
                    onChange={(e) => setNovaEtiqueta(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && salvarEtiqueta()}
                    placeholder="Ex.: Prioridade, Jejum..."
                    className="h-8.5 w-full rounded-lg border border-line2 bg-card px-2.5 text-xs font-medium text-ink focus:border-amber focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {ETIQUETA_CORES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        aria-label={c.rotulo}
                        onClick={() => setCorEtiqueta(c.id)}
                        className={cn(
                          "size-5.5 rounded-md border-2 transition-transform active:scale-90",
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
                    Adicionar etiqueta
                  </button>
                </PopoverContent>
              </Popover>
            </div>

            {/* Controles de Registro: Editar / Envelope */}
            <div className="flex items-center gap-1.5">
              {onEditar && <BotaoCaneta onClick={onEditar} rotulo="Editar dados" />}
              {concluido && (
                <button
                  type="button"
                  onClick={() => setEnvelopeAberto((v) => !v)}
                  aria-expanded={envelopeAberto}
                  title={selado ? "Atendimento concluído — abrir detalhes" : "Ocultar detalhes"}
                  className="flex items-center gap-1.5 rounded-lg border border-ok/30 bg-ok/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ok transition-colors hover:bg-ok/20"
                >
                  {selado ? <Mail className="size-3" /> : <MailOpen className="size-3" />}
                  <span>{selado ? "Selado" : "Aberto"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Dados do Paciente e Médico */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[16px] font-bold tracking-tight text-ink">{paciente.nome}</h3>
                <span className="font-mono text-[11px] font-medium text-inksoft">
                  {paciente.idade} anos
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                    particular
                      ? "border border-amber/30 bg-amber/10 text-amberdeep"
                      : "border border-line2 bg-mutbg/60 text-inksoft",
                  )}
                >
                  {paciente.convenio}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-inksoft">
                <span className="font-medium">{appointment.medico}</span>
                <span className="size-1 rounded-full bg-line2" />
                <span className="font-mono text-[11px]">{paciente.telefone}</span>
              </div>
            </div>

            {/* Aviso de pendência WhatsApp se houver */}
            {appointment.pendencia && (
              <div className="mt-2 sm:mt-0">
                {appointment.pendencia === "recusado" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-bad/30 bg-bad/10 px-2.5 py-1 text-[11px] font-semibold text-bad">
                    <X className="size-3" /> Paciente cancelou no WhatsApp
                  </span>
                )}
                {appointment.pendencia === "sem_resposta" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber/30 bg-amber/10 px-2.5 py-1 text-[11px] font-semibold text-amberdeep">
                    <Clock className="size-3" /> Aguardando resposta do WhatsApp
                  </span>
                )}
                {appointment.pendencia === "falha_envio" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-bad/30 bg-bad/10 px-2.5 py-1 text-[11px] font-semibold text-bad">
                    <Send className="size-3" /> Falha no envio da mensagem
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Observações Clínicas */}
          {todasNotas.length > 0 && !selado && (
            <div className="mt-3 space-y-1.5 rounded-xl border border-line bg-paper/50 p-2.5">
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-inksoft">
                <StickyNote className="size-3 text-amber" />
                <span>Observações Clínicas</span>
              </div>
              <ul className="space-y-1">
                {todasNotas.map((nota, i) => (
                  <li
                    key={`${nota}-${i}`}
                    className="flex items-start justify-between gap-2 text-xs leading-relaxed text-ink/85"
                  >
                    <span>• {nota}</span>
                    {onRemoveNota && i >= todasNotas.length - notas.length && (
                      <button
                        type="button"
                        aria-label="Remover observação"
                        onClick={() => onRemoveNota(i - (todasNotas.length - notas.length))}
                        className="text-inksoft/60 transition-colors hover:text-bad"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rodapé do Card: Ações Rápidas Ergonomicamente Visíveis */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3">
            <div className="flex items-center gap-2">
              {/* Adicionar Observação */}
              <Popover open={notasAbertas} onOpenChange={setNotasAbertas}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Adicionar observação"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line2/70 bg-card px-2.5 text-xs font-semibold text-inksoft transition-colors hover:border-amber/40 hover:text-ink active:scale-95"
                  >
                    <MessageSquareText className="size-3.5 text-amberdeep" aria-hidden />
                    <span>Nota</span>
                    {todasNotas.length > 0 && (
                      <span className="rounded-full bg-mutbg px-1.5 font-mono text-[10px] font-bold text-ink">
                        {todasNotas.length}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="w-72 space-y-3 p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    Observação de {paciente.nome.split(" ")[0]}
                  </p>
                  <textarea
                    value={novaNota}
                    onChange={(e) => setNovaNota(e.target.value)}
                    rows={3}
                    placeholder="Escreva uma observação clínica ou administrativa..."
                    className="w-full resize-none rounded-lg border border-line2 bg-card p-2.5 text-xs font-medium text-ink focus:border-amber focus:outline-none"
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

              {/* Botão de WhatsApp direto */}
              <a
                href={`https://wa.me/55${paciente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  mensagemWhatsApp,
                )}`}
                target="_blank"
                rel="noreferrer"
                title="Abrir conversa no WhatsApp Web"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line2/70 bg-card px-2.5 text-xs font-semibold text-inksoft transition-colors hover:border-ok/50 hover:text-ok active:scale-95"
              >
                <MessageCircle className="size-3.5 text-ok" aria-hidden />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>

            {/* Ações de Status com Visibilidade Imediata */}
            <div className="flex flex-wrap items-center gap-1.5">
              {acoes.map((action) => {
                const Icon = action.icon;
                const isPrimary = action.primary;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onAction(appointment, action)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all active:scale-95",
                      isPrimary &&
                        action.variant === "success" &&
                        "bg-ok text-cream shadow-xs hover:bg-ok/90",
                      isPrimary &&
                        action.variant === "primary" &&
                        "bg-ink text-cream shadow-xs hover:bg-ink/90",
                      !isPrimary &&
                        action.variant === "danger" &&
                        "border border-bad/30 bg-bad/5 text-bad hover:bg-bad/15",
                      !isPrimary &&
                        action.variant !== "danger" &&
                        "border border-line2 bg-card text-inksoft hover:border-ink/30 hover:text-ink",
                    )}
                  >
                    {Icon && <Icon className="size-3.5 shrink-0" aria-hidden />}
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export type { Action };
