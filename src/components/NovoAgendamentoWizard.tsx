import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Search,
  Stethoscope,
  User,
} from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  HOJE_ISO,
  MEDICO,
  duracaoDe,
  fromISODate,
  pacientes,
  type Patient,
  type TipoAtendimento,
} from "@/lib/agenda-data";

export interface NovoAgendamentoDraft {
  paciente: Patient;
  tipo: TipoAtendimento;
  data: Date;
  hora: string;
  duracaoMin: number;
  observacoes?: string;
}

interface NovoAgendamentoWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataInicial?: Date;
  onSalvar: (draft: NovoAgendamentoDraft) => void;
}

const TIPOS_CONSULTA: TipoAtendimento[] = ["Consulta", "Retorno"];
const TIPOS_EXAME: TipoAtendimento[] = [
  "Eletrocardiograma",
  "Ecocardiograma",
  "Teste ergométrico",
  "Holter 24h",
  "MAPA",
];

const HORARIOS = Array.from({ length: 22 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

const PASSOS = [
  { rotulo: "Paciente", Icon: User },
  { rotulo: "Atendimento", Icon: Stethoscope },
  { rotulo: "Revisão", Icon: ClipboardList },
] as const;

type ModoPaciente = "existente" | "novo";

function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!)
    .join("")
    .toUpperCase();
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft">
        {rotulo}
      </div>
      <div className="mt-0.5 text-sm font-semibold capitalize text-ink">{valor}</div>
    </div>
  );
}

export function NovoAgendamentoWizard({
  open,
  onOpenChange,
  dataInicial,
  onSalvar,
}: NovoAgendamentoWizardProps) {
  const [passo, setPasso] = useState(0);
  const [modo, setModo] = useState<ModoPaciente>("existente");
  const [busca, setBusca] = useState("");
  const [pacienteId, setPacienteId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoIdade, setNovoIdade] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoConvenio, setNovoConvenio] = useState("");
  const [tipo, setTipo] = useState<TipoAtendimento | null>(null);
  const [data, setData] = useState<Date>(() => new Date());
  const [mes, setMes] = useState<Date>(() => new Date());
  const [hora, setHora] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");

  // Sempre reabre zerado, no mês atual.
  useEffect(() => {
    if (!open) return;
    setPasso(0);
    setModo("existente");
    setBusca("");
    setPacienteId(null);
    setNovoNome("");
    setNovoIdade("");
    setNovoTelefone("");
    setNovoConvenio("");
    setTipo(null);
    const base = dataInicial ?? fromISODate(HOJE_ISO);
    const dia = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    setData(dia);
    setMes(new Date(base.getFullYear(), base.getMonth(), 1));
    setHora(null);
    setObservacoes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resultados = useMemo(() => {
    const q = busca.toLowerCase();
    return pacientes.filter(
      (p) => !q || p.nome.toLowerCase().includes(q) || p.telefone.includes(q),
    );
  }, [busca]);

  const pacienteSelecionado = pacienteId
    ? (pacientes.find((p) => p.id === pacienteId) ?? null)
    : null;

  const pacienteFinal: Patient | null =
    modo === "novo"
      ? novoNome.trim()
        ? {
            id: `p${Date.now()}`,
            nome: novoNome.trim(),
            idade: Number(novoIdade) || 0,
            telefone: novoTelefone.trim() || "—",
            convenio: novoConvenio.trim() || "Particular",
          }
        : null
      : pacienteSelecionado;

  const passoValido =
    passo === 0
      ? modo === "existente"
        ? !!pacienteId
        : novoNome.trim().length > 0
      : passo === 1
        ? !!tipo && !!hora
        : true;

  function confirmar() {
    if (!pacienteFinal || !tipo || !hora) return;
    onSalvar({
      paciente: pacienteFinal,
      tipo,
      data,
      hora,
      duracaoMin: duracaoDe(tipo),
      observacoes: observacoes.trim() || undefined,
    });
    onOpenChange(false);
  }

  const inputCls =
    "h-11 w-full rounded-xl border border-line2 bg-card px-3.5 text-sm font-medium text-ink shadow-sm transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {/* Cabeçalho com stepper */}
        <div className="border-b border-line2/50 px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-extrabold uppercase tracking-tighter text-ink">
                Novo agendamento
              </DialogTitle>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-inksoft">
                {MEDICO} · Clínica de Cardiologia
              </p>
            </div>
            <HeartPulse className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
          </div>

          <div className="relative mt-6">
            <div className="absolute left-8 right-8 top-4 h-0.5 bg-line2/60" />
            <div
              className="absolute top-4 h-0.5 bg-amber transition-all duration-500 ease-out"
              style={{
                left: "32px",
                width: `calc(${(passo / (PASSOS.length - 1)) * 100}% - ${
                  (passo / (PASSOS.length - 1)) * 64
                }px)`,
              }}
            />
            <div className="relative flex justify-between">
              {PASSOS.map(({ rotulo, Icon }, i) => {
                const done = passo > i;
                const current = passo === i;
                return (
                  <div key={rotulo} className="flex w-20 flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border transition-all duration-300",
                        done && "border-amber bg-amber text-cream",
                        current && "border-ink bg-ink text-cream shadow-sm",
                        !done && !current && "border-line2 bg-card text-inksoft",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Icon className="size-4" aria-hidden />
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[9px] font-bold uppercase tracking-widest",
                        current ? "text-amberdeep" : "text-inksoft",
                      )}
                    >
                      {rotulo}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conteúdo das etapas */}
        <div className="max-h-[62vh] space-y-6 overflow-y-auto px-6 py-6">
          {passo === 0 && (
            <>
              <div className="flex rounded-xl border border-line2 bg-card p-1">
                {(["existente", "novo"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModo(m)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors",
                      modo === m
                        ? "bg-ink text-cream"
                        : "text-inksoft hover:bg-line/20",
                    )}
                  >
                    {m === "existente" ? "Buscar paciente" : "Novo paciente"}
                  </button>
                ))}
              </div>

              {modo === "existente" ? (
                <>
                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-inksoft/50"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Nome ou telefone..."
                      className={cn(inputCls, "pl-10")}
                    />
                  </div>
                  <div className="-mt-2 max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {resultados.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPacienteId(p.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                          pacienteId === p.id
                            ? "border-amber bg-amber/5"
                            : "border-line2 bg-card hover:border-amberdeep/30",
                        )}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mutbg font-mono text-[11px] font-bold text-inksoft">
                          {iniciais(p.nome)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-bold text-ink">
                            {p.nome}
                          </span>
                          <span className="block font-mono text-[10px] text-inksoft">
                            {p.idade} anos · {p.telefone}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                            p.convenio === "Particular"
                              ? "bg-amber/10 text-amberdeep"
                              : "bg-mutbg text-inksoft",
                          )}
                        >
                          {p.convenio}
                        </span>
                        {pacienteId === p.id && (
                          <Check className="size-4 shrink-0 text-amberdeep" aria-hidden />
                        )}
                      </button>
                    ))}
                    {resultados.length === 0 && (
                      <p className="px-2 py-6 text-center text-xs text-inksoft">
                        Nenhum paciente encontrado.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Nome completo *
                    </span>
                    <input
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex.: Antônio Cardoso"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Idade
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={novoIdade}
                      onChange={(e) => setNovoIdade(e.target.value)}
                      placeholder="Ex.: 58"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Telefone
                    </span>
                    <input
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      placeholder="(11) 90000-0000"
                      className={inputCls}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Convênio
                    </span>
                    <input
                      value={novoConvenio}
                      onChange={(e) => setNovoConvenio(e.target.value)}
                      placeholder="Ex.: Unimed (ou Particular)"
                      className={inputCls}
                    />
                  </label>
                </div>
              )}
            </>
          )}

          {passo === 1 && (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="size-3.5 text-amberdeep" aria-hidden />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    Consultas
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TIPOS_CONSULTA.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-xs font-bold transition-all active:scale-95",
                        tipo === t
                          ? "border-ink bg-ink text-cream shadow-sm"
                          : "border-line2 bg-card text-ink hover:border-amberdeep/40",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <FlaskConical className="size-3.5 text-amberdeep" aria-hidden />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    Exames
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {TIPOS_EXAME.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-xs font-bold transition-all active:scale-95",
                        tipo === t
                          ? "border-ink bg-ink text-cream shadow-sm"
                          : "border-line2 bg-card text-ink hover:border-amberdeep/40",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Data do atendimento
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-line2 bg-card px-3.5 text-sm font-semibold text-ink shadow-sm transition-all hover:border-amberdeep/40"
                    >
                      <span className="capitalize">
                        {data.toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <CalendarDays className="size-4 text-amberdeep" aria-hidden />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      month={mes}
                      onMonthChange={setMes}
                      selected={data}
                      onSelect={(d) => d && setData(d)}
                      className="p-3"
                    />
                    <div className="flex items-center justify-between border-t border-line2/50 px-3 py-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
                        Data do atendimento
                      </span>
                      <button
                        type="button"
                        onClick={() => setData(new Date())}
                        className="text-[11px] font-bold uppercase tracking-wider text-amber hover:text-amberdeep"
                      >
                        Hoje
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Horário
                </span>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {HORARIOS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHora(h)}
                      className={cn(
                        "rounded-lg border px-1 py-2 font-mono text-[11px] font-bold tabular-nums transition-all active:scale-95",
                        hora === h
                          ? "border-amber bg-amber/10 text-amberdeep"
                          : "border-line2 bg-card text-inksoft hover:border-amberdeep/40",
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {passo === 2 && pacienteFinal && tipo && hora && (
            <>
              <div className="overflow-hidden rounded-2xl border border-line2/60 bg-card">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
                  <Linha rotulo="Paciente" valor={pacienteFinal.nome} />
                  <Linha rotulo="Telefone" valor={pacienteFinal.telefone} />
                  <Linha
                    rotulo="Atendimento"
                    valor={`${tipo} · ${duracaoDe(tipo)} min`}
                  />
                  <Linha rotulo="Convênio" valor={pacienteFinal.convenio} />
                  <Linha
                    rotulo="Data"
                    valor={data.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <Linha rotulo="Horário" valor={hora} />
                </div>
                <div className="flex items-center gap-2 border-t border-line2/50 px-4 py-3 text-xs text-inksoft">
                  <MessageCircle className="size-3.5 shrink-0 text-ok" aria-hidden />
                  A confirmação por WhatsApp será enviada ao paciente.
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Observações (opcional)
                </span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ex.: paciente hipertenso; trazer exames anteriores."
                  className="w-full resize-none rounded-xl border border-line2 bg-card px-3.5 py-2.5 text-sm font-medium text-ink shadow-sm transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
                />
              </label>
            </>
          )}
        </div>

        {/* Rodapé de navegação */}
        <div className="flex items-center justify-between gap-3 border-t border-line2/50 bg-card/60 px-6 py-4">
          <button
            type="button"
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-line2 bg-card px-4 text-[11px] font-bold uppercase tracking-wider text-inksoft transition-all hover:border-ink/30 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Voltar
          </button>

          {passo < PASSOS.length - 1 ? (
            <button
              type="button"
              onClick={() => setPasso((p) => p + 1)}
              disabled={!passoValido}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-5 text-[11px] font-bold uppercase tracking-wider text-cream shadow-sm transition-all hover:bg-ink/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              Continuar
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmar}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-amber px-5 text-[11px] font-black uppercase tracking-wider text-cream shadow-md transition-all hover:bg-amberdeep active:scale-95"
            >
              <Check className="size-4" aria-hidden />
              Confirmar agendamento
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}