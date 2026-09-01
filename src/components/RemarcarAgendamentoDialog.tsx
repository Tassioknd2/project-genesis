import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HOJE_ISO,
  TIPOS_CONSULTA,
  TIPOS_EXAME,
  duracaoDe,
  duracaoDosTipos,
  formatarTipos,
  fromISODate,
  pacientes,
  toISODate,
  type Appointment,
  type Patient,
  type TipoAtendimento,
} from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export interface RemarcacaoResultado {
  appointment: Appointment;
  novaData: Date;
  novoHorario: string;
  paciente: Patient;
  tipos: TipoAtendimento[];
  duracaoMin: number;
  motivo?: string;
}

interface RemarcarAgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  dataAtual: Date;
  onConfirmarRemarcacao: (resultado: RemarcacaoResultado) => void;
  onCancelarAgendamento: (appointment: Appointment, motivo?: string) => void;
}

const HORARIOS_DISPONIVEIS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export function RemarcarAgendamentoDialog({
  open,
  onOpenChange,
  appointment,
  dataAtual,
  onConfirmarRemarcacao,
  onCancelarAgendamento,
}: RemarcarAgendamentoDialogProps) {
  const [data, setData] = useState<Date>(() => {
    const amanha = new Date(dataAtual);
    amanha.setDate(amanha.getDate() + 1);
    if (amanha.getDay() === 0) amanha.setDate(amanha.getDate() + 1); // pular domingo
    return amanha;
  });

  const [hora, setHora] = useState<string>(appointment?.hora || "09:00");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Patient>(
    appointment?.paciente || pacientes[0]!,
  );
  const [trocarPaciente, setTrocarPaciente] = useState(false);
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [tipos, setTipos] = useState<TipoAtendimento[]>(() => {
    if (appointment?.tipos && appointment.tipos.length > 0) return appointment.tipos;
    if (appointment?.tipo) return [appointment.tipo];
    return ["Consulta"];
  });
  const [motivo, setMotivo] = useState("");
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);

  // Inicializar estado sempre que abrir ou trocar de agendamento
  useEffect(() => {
    if (open && appointment) {
      const proximoDia = new Date(dataAtual);
      proximoDia.setDate(proximoDia.getDate() + 1);
      if (proximoDia.getDay() === 0) proximoDia.setDate(proximoDia.getDate() + 1);

      setData(proximoDia);
      setHora(appointment.hora || "09:00");
      setPacienteSelecionado(appointment.paciente);
      setTrocarPaciente(false);
      setBuscaPaciente("");
      setTipos(
        appointment.tipos && appointment.tipos.length > 0 ? appointment.tipos : [appointment.tipo],
      );
      setMotivo("");
      setConfirmandoCancelamento(false);
    }
  }, [open, appointment, dataAtual]);

  const duracaoTotal = useMemo(() => duracaoDosTipos(tipos), [tipos]);

  // Lista filtrada de pacientes para troca
  const pacientesFiltrados = useMemo(() => {
    const q = buscaPaciente.toLowerCase().trim();
    if (!q) return pacientes.slice(0, 6);
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.telefone.includes(q) ||
        p.convenio.toLowerCase().includes(q),
    );
  }, [buscaPaciente]);

if (!appointment) return null;
  const appt = appointment;

  function toggleTipo(t: TipoAtendimento) {
    setTipos((prev) => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // manter ao menos 1
        return prev.filter((x) => x !== t);
      }
      return [...prev, t];
    });
  }

  // Atalhos rápidos de data
  function selecionarAtalhoData(diasAdicionais: number) {
    const d = new Date();
    d.setDate(d.getDate() + diasAdicionais);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // evitar domingo
    setData(d);
  }

  function handleSalvar() {
    if (!hora || tipos.length === 0 || !pacienteSelecionado) return;

onConfirmarRemarcacao({
      appt,
      novaData: data,
      novoHorario: hora,
      paciente: pacienteSelecionado,
      tipos,
      duracaoMin: duracaoTotal,
      motivo: motivo.trim() || undefined,
    });
    onOpenChange(false);
  }

  function handleExecutarCancelamento() {
    onCancelarAgendamento(appt, motivo.trim() || "Cancelado pelo usuário ao remarcar");
    onOpenChange(false);
  }

  const isoData = toISODate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl border-line2 bg-card p-0 shadow-xl">
        {/* Cabeçalho */}
        <div className="border-b border-line2/70 bg-paper/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber text-ink shadow-xs">
                <RotateCcw className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-ink">
                  Remarcar Agendamento
                </DialogTitle>
                <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                  Defina a nova data, horário e confirme os dados do paciente
                </DialogDescription>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-line2 bg-card px-2.5 py-1 font-mono text-[10px] font-bold text-inksoft">
              <Clock className="size-3 text-amberdeep" />
              Atual: {appointment.hora}
            </span>
          </div>
        </div>

        {/* Corpo com scroll seguro */}
        <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Seção 1: Paciente Agendado */}
          <div className="rounded-2xl border border-line2/80 bg-paper/30 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-line2/50">
              <div className="flex items-center gap-2">
                <User className="size-4 text-amberdeep" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Paciente Agendado
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTrocarPaciente(!trocarPaciente)}
                className="text-xs font-bold text-amberdeep hover:underline"
              >
                {trocarPaciente ? "Manter paciente atual" : "Alterar paciente"}
              </button>
            </div>

            {!trocarPaciente ? (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-line2 bg-card font-mono text-sm font-black text-ink">
                    {pacienteSelecionado.nome
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <div className="text-sm font-black text-ink">{pacienteSelecionado.nome}</div>
                    <div className="text-xs text-inksoft">
                      {pacienteSelecionado.idade} anos · {pacienteSelecionado.telefone} ·{" "}
                      <span className="font-semibold text-ink">{pacienteSelecionado.convenio}</span>
                    </div>
                  </div>
                </div>

                <span className="rounded-md bg-ok/10 px-2 py-1 text-[11px] font-bold text-ok">
                  Identificado
                </span>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-inksoft" />
                  <input
                    type="text"
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    placeholder="Buscar outro paciente por nome, telefone ou convênio..."
                    className="h-9 w-full rounded-xl border border-line2 bg-card pl-9 pr-3 text-xs font-medium text-ink placeholder:text-inksoft/50 focus:border-amber focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {pacientesFiltrados.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPacienteSelecionado(p);
                        setTrocarPaciente(false);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2.5 text-left text-xs transition-all",
                        pacienteSelecionado.id === p.id
                          ? "border-ink bg-ink text-cream"
                          : "border-line2/70 bg-card hover:border-amber/40",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-bold truncate">{p.nome}</div>
                        <div
                          className={cn(
                            "text-[10px]",
                            pacienteSelecionado.id === p.id ? "text-cream/70" : "text-inksoft",
                          )}
                        >
                          {p.telefone} · {p.convenio}
                        </div>
                      </div>
                      {pacienteSelecionado.id === p.id && (
                        <Check className="size-4 shrink-0 text-amber" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seção 2: Nova Data */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                Nova Data do Atendimento
              </label>
              <span className="font-mono text-xs font-bold capitalize text-ink">
                {data.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Atalhos rápidos de data */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => selecionarAtalhoData(1)}
                className="rounded-lg border border-line2 bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-paper active:scale-95"
              >
                Amanhã
              </button>
              <button
                type="button"
                onClick={() => selecionarAtalhoData(2)}
                className="rounded-lg border border-line2 bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-paper active:scale-95"
              >
                Em 2 dias
              </button>
              <button
                type="button"
                onClick={() => selecionarAtalhoData(7)}
                className="rounded-lg border border-line2 bg-card px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-paper active:scale-95"
              >
                Próxima semana (+7d)
              </button>
            </div>

            {/* Input nativo com estilo elegante */}
            <div className="mt-2">
              <input
                type="date"
                value={isoData}
                min={HOJE_ISO}
                onChange={(e) => {
                  if (e.target.value) {
                    setData(fromISODate(e.target.value));
                  }
                }}
                className="h-10 w-full rounded-xl border border-line2 bg-card px-3 text-sm font-medium text-ink shadow-xs focus:border-amber focus:outline-none"
              />
            </div>
          </div>

          {/* Seção 3: Novo Horário */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                Novo Horário
              </label>
              {hora && (
                <span className="font-mono text-xs font-bold text-amberdeep">
                  Marcado para as {hora}h ({duracaoTotal} min)
                </span>
              )}
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
              {HORARIOS_DISPONIVEIS.map((h) => {
                const isSelected = hora === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-mono font-bold transition-all active:scale-95",
                      isSelected
                        ? "border-ink bg-ink text-cream shadow-xs"
                        : "border-line2/70 bg-card text-ink hover:border-amber/50 hover:bg-paper/40",
                    )}
                  >
                    <span>{h}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 4: Procedimentos Agendados */}
          <div className="rounded-2xl border border-line2/80 bg-paper/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-amberdeep" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Procedimentos & Exames ({tipos.length})
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-ink">
                {duracaoTotal} min total
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
{[...TIPOS_CONSULTA, ...TIPOS_EXAME].map((t) => {
                const isSelected = tipos.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTipo(t)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-2.5 py-2 text-left text-xs transition-all active:scale-95",
                      isSelected
                        ? "border-ink bg-ink text-cream shadow-2xs font-bold"
                        : "border-line2 bg-card text-ink hover:border-amber/40",
                    )}
                  >
                    <span className="truncate">{t}</span>
                    <span
                      className={cn(
                        "ml-1 font-mono text-[9px] shrink-0",
                        isSelected ? "text-cream/70" : "text-inksoft",
                      )}
                    >
                      {duracaoDe(t)}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 5: Motivo da Remarcação (Opcional) */}
          <div>
            <label
              htmlFor="motivo-remarcacao"
              className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
            >
              Motivo ou observação da remarcação (opcional)
            </label>
            <textarea
              id="motivo-remarcacao"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              placeholder="Ex.: Paciente solicitou transferência de data; viagem de trabalho; etc..."
              className="w-full resize-none rounded-xl border border-line2 bg-card p-3 text-xs font-medium text-ink placeholder:text-inksoft/40 focus:border-amber focus:outline-none"
            />
          </div>

          {/* Seção de Cancelamento Direto */}
          {confirmandoCancelamento ? (
            <div className="rounded-2xl border border-bad/30 bg-bad/5 p-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 text-bad" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-bad">
                    Confirmar cancelamento do agendamento?
                  </div>
                  <div className="text-xs text-inksoft">
                    O horário de {appointment.hora} de {appointment.paciente.nome} será liberado na
                    agenda.
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmandoCancelamento(false)}
                  className="rounded-lg border border-line2 bg-card px-3 py-1.5 text-xs font-bold text-ink hover:bg-paper"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleExecutarCancelamento}
                  className="rounded-lg bg-bad px-3 py-1.5 text-xs font-bold text-cream hover:bg-bad/90"
                >
                  Sim, cancelar agendamento
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setConfirmandoCancelamento(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-bad hover:underline"
              >
                <Trash2 className="size-3.5" />
                <span>Cancelar este agendamento</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between border-t border-line2/70 bg-paper/60 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-line2 bg-card px-4 py-2.5 text-xs font-bold text-inksoft transition-colors hover:border-ink/30 hover:text-ink active:scale-95"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleSalvar}
            disabled={!hora || tipos.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-cream shadow-xs transition-all hover:bg-ink/90 active:scale-95 disabled:opacity-50"
          >
            <Check className="size-4" />
            <span>Confirmar Remarcação</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
