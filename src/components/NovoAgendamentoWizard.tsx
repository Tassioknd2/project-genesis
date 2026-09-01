import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Flame,
  Gauge,
  HeartPulse,
  MessageCircle,
  Moon,
  Search,
  Stethoscope,
  Sun,
  User,
  Waves,
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
  duracaoDosTipos,
  formatarTipos,
  fromISODate,
  pacientes,
  type Patient,
  type TipoAtendimento,
} from "@/lib/agenda-data";

export interface NovoAgendamentoDraft {
  paciente: Patient;
  tipo: TipoAtendimento;
  tipos: TipoAtendimento[];
  data: Date;
  hora: string;
  duracaoMin: number;
  observacoes?: string;
}

interface NovoAgendamentoWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataInicial?: Date;
  pacienteInicial?: Patient | null;
  onSalvar: (draft: NovoAgendamentoDraft) => void;
}

const TIPOS_CONSULTA: { tipo: TipoAtendimento; desc: string; duracao: number }[] = [
  { tipo: "Consulta", desc: "Avaliação inicial ou rotina cardiológica", duracao: 45 },
  { tipo: "Retorno", desc: "Acompanhamento de exames e condutas", duracao: 30 },
];

const TIPOS_EXAME: {
  tipo: TipoAtendimento;
  desc: string;
  duracao: number;
  Icon: typeof Activity;
}[] = [
  {
    tipo: "Eletrocardiograma",
    desc: "ECG de repouso (12 derivações)",
    duracao: 20,
    Icon: HeartPulse,
  },
  { tipo: "Ecocardiograma", desc: "Eco Transtorácico Doppler", duracao: 40, Icon: Waves },
  { tipo: "Teste ergométrico", desc: "Esteira com esforço contínuo", duracao: 45, Icon: Flame },
  { tipo: "Holter 24h", desc: "Instalação do monitor portátil", duracao: 30, Icon: Activity },
  { tipo: "MAPA", desc: "Monitorização Ambulatorial de PA", duracao: 30, Icon: Gauge },
];

const HORARIOS_MANHA = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];

const HORARIOS_TARDE = [
  "13:00",
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

const PASSOS = [
  { rotulo: "Paciente", Icon: User, desc: "Identificação" },
  { rotulo: "Atendimento", Icon: Stethoscope, desc: "Procedimento & Horário" },
  { rotulo: "Revisão", Icon: ClipboardList, desc: "Confirmação final" },
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
    <div className="rounded-xl border border-line/60 bg-paper/40 p-2.5">
      <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft">
        {rotulo}
      </div>
      <div className="mt-0.5 text-[13px] font-bold text-ink">{valor}</div>
    </div>
  );
}

export function NovoAgendamentoWizard({
  open,
  onOpenChange,
  dataInicial,
  pacienteInicial,
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
  const [tipos, setTipos] = useState<TipoAtendimento[]>([]);
  const [data, setData] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [mes, setMes] = useState<Date>(() => fromISODate(HOJE_ISO));
  const [hora, setHora] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    setPasso(0);
    setModo("existente");
    setBusca("");
    setPacienteId(pacienteInicial ? pacienteInicial.id : null);
    setNovoNome("");
    setNovoIdade("");
    setNovoTelefone("");
    setNovoConvenio("");
    setTipos([]);
    const base = dataInicial ?? fromISODate(HOJE_ISO);
    const dia = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    setData(dia);
    setMes(new Date(base.getFullYear(), base.getMonth(), 1));
    setHora(null);
    setObservacoes("");
  }, [open, dataInicial, pacienteInicial]);

  function toggleTipo(t: TipoAtendimento) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  const duracaoTotal = useMemo(() => duracaoDosTipos(tipos), [tipos]);

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
        ? tipos.length > 0 && !!hora
        : true;

  function confirmar() {
    if (!pacienteFinal || tipos.length === 0 || !hora) return;
    const primaryTipo = tipos[0] || "Consulta";
    const textoObs = observacoes.trim();
    onSalvar({
      paciente: pacienteFinal,
      tipo: primaryTipo,
      tipos,
      data,
      hora,
      duracaoMin: duracaoTotal,
      ...(textoObs ? { observacoes: textoObs } : {}),
    });
    onOpenChange(false);
  }

  const inputCls =
    "h-11 w-full rounded-xl border border-line2 bg-card px-3.5 text-sm font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {/* Cabeçalho com Stepper */}
        <div className="border-b border-line2/60 bg-paper/60 px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-ink">
                Novo agendamento clínico
              </DialogTitle>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-inksoft">
                {MEDICO} · Cardiologia
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-amber">
              <HeartPulse className="size-5" aria-hidden />
            </div>
          </div>

          {/* Stepper Visual */}
          <div className="relative mt-6">
            <div className="absolute left-8 right-8 top-4 h-0.5 bg-line2/70" />
            <div
              className="absolute top-4 h-0.5 bg-amber transition-all duration-300 ease-out"
              style={{
                left: "32px",
                width: `calc(${(passo / (PASSOS.length - 1)) * 100}% - ${
                  (passo / (PASSOS.length - 1)) * 64
                }px)`,
              }}
            />
            <div className="relative flex justify-between">
              {PASSOS.map(({ rotulo, desc, Icon }, i) => {
                const done = passo > i;
                const current = passo === i;
                return (
                  <div key={rotulo} className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border text-xs font-bold transition-all",
                        done && "border-ok bg-ok text-cream",
                        current && "border-ink bg-ink text-cream shadow-xs",
                        !done && !current && "border-line2 bg-card text-inksoft",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Icon className="size-4" aria-hidden />
                      )}
                    </span>
                    <div>
                      <span
                        className={cn(
                          "block font-mono text-[10px] font-bold uppercase tracking-wider",
                          current ? "text-amberdeep" : "text-inksoft",
                        )}
                      >
                        {rotulo}
                      </span>
                      <span className="hidden font-mono text-[8px] text-inksoft/70 sm:block">
                        {desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conteúdo das etapas */}
        <div className="max-h-[62vh] space-y-5 overflow-y-auto px-6 py-6">
          {/* Passo 0: Paciente */}
          {passo === 0 && (
            <div className="space-y-4">
              <div className="flex rounded-xl border border-line2 bg-card p-1">
                {(["existente", "novo"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModo(m)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                      modo === m ? "bg-ink text-cream shadow-2xs" : "text-inksoft hover:bg-paper",
                    )}
                  >
                    {m === "existente" ? "Buscar no cadastro" : "Novo cadastro"}
                  </button>
                ))}
              </div>

              {modo === "existente" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-inksoft/60"
                      aria-hidden
                    />
                    <input
                      type="search"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar por nome, telefone..."
                      className={cn(inputCls, "pl-10")}
                    />
                  </div>

                  <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {resultados.map((p) => {
                      const isSelected = pacienteId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPacienteId(p.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                            isSelected
                              ? "border-amber bg-amber/5 ring-1 ring-amber"
                              : "border-line2 bg-card hover:border-amber/40 hover:bg-paper/40",
                          )}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mutbg font-mono text-[11px] font-bold text-ink">
                            {iniciais(p.nome)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink">
                              {p.nome}
                            </span>
                            <span className="block font-mono text-[10px] text-inksoft">
                              {p.idade} anos · {p.telefone}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest",
                              p.convenio.toLowerCase().includes("particular")
                                ? "bg-amber/10 text-amberdeep"
                                : "bg-mutbg text-inksoft",
                            )}
                          >
                            {p.convenio}
                          </span>
                          {isSelected && (
                            <Check className="size-4 shrink-0 text-amberdeep" aria-hidden />
                          )}
                        </button>
                      );
                    })}
                    {resultados.length === 0 && (
                      <p className="px-2 py-6 text-center text-xs font-semibold text-inksoft">
                        Nenhum paciente encontrado. Tente buscar outro nome ou selecione &ldquo;Novo
                        cadastro&rdquo;.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Nome completo *
                    </span>
                    <input
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex.: Antônio Cardoso da Silva"
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
                      WhatsApp / Celular
                    </span>
                    <input
                      value={novoTelefone}
                      onChange={(e) => setNovoTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className={inputCls}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                      Convênio / Plano de Saúde
                    </span>
                    <input
                      value={novoConvenio}
                      onChange={(e) => setNovoConvenio(e.target.value)}
                      placeholder="Ex.: Particular, Unimed, Bradesco..."
                      className={inputCls}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Passo 1: Procedimento e Horário */}
          {passo === 1 && (
            <div className="space-y-5">
              {/* Escolha do Procedimento */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                    Procedimentos & Exames (Múltipla Seleção)
                  </span>
                  {tipos.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-0.5 font-mono text-[9px] font-bold text-amberdeep">
                      {tipos.length} selecionado{tipos.length > 1 ? "s" : ""} · {duracaoTotal} min
                      total
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-inksoft">
                  Você pode selecionar mais de um atendimento para o mesmo paciente (ex.: Consulta +
                  Ecocardiograma).
                </p>

                {/* Consultas */}
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TIPOS_CONSULTA.map((t) => {
                    const isSelected = tipos.includes(t.tipo);
                    return (
                      <button
                        key={t.tipo}
                        type="button"
                        onClick={() => toggleTipo(t.tipo)}
                        className={cn(
                          "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
                          isSelected
                            ? "border-ink bg-ink text-cream shadow-xs"
                            : "border-line2 bg-card hover:border-amber/40 hover:bg-paper/40",
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Stethoscope
                            className={cn(
                              "mt-0.5 size-4 shrink-0",
                              isSelected ? "text-amber" : "text-amberdeep",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t.tipo}</div>
                            <div
                              className={cn(
                                "text-[10px]",
                                isSelected ? "text-cream/70" : "text-inksoft",
                              )}
                            >
                              {t.desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold",
                              isSelected ? "bg-white/15 text-cream" : "bg-mutbg text-inksoft",
                            )}
                          >
                            {t.duracao} min
                          </span>
                          {isSelected && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-amber text-ink">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Exames */}
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TIPOS_EXAME.map((t) => {
                    const Icon = t.Icon;
                    const isSelected = tipos.includes(t.tipo);
                    return (
                      <button
                        key={t.tipo}
                        type="button"
                        onClick={() => toggleTipo(t.tipo)}
                        className={cn(
                          "flex items-start justify-between gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
                          isSelected
                            ? "border-ink bg-ink text-cream shadow-xs"
                            : "border-line2 bg-card hover:border-amber/40 hover:bg-paper/40",
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "mt-0.5 size-4 shrink-0",
                              isSelected ? "text-amber" : "text-amberdeep",
                            )}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t.tipo}</div>
                            <div
                              className={cn(
                                "text-[10px]",
                                isSelected ? "text-cream/70" : "text-inksoft",
                              )}
                            >
                              {t.desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold",
                              isSelected ? "bg-white/15 text-cream" : "bg-mutbg text-inksoft",
                            )}
                          >
                            {t.duracao} min
                          </span>
                          {isSelected && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-amber text-ink">
                              <Check className="size-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {tipos.length === 0 && (
                  <p className="mt-2 rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-xs font-medium text-amberdeep">
                    ⚠️ Selecione ao menos um procedimento acima para prosseguir.
                  </p>
                )}
              </div>

              {/* Data do atendimento */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Data do atendimento
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-line2 bg-card px-3.5 text-xs font-bold text-ink shadow-2xs transition-all hover:border-amber/40"
                    >
                      <span className="capitalize">
                        {data.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
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
                  </PopoverContent>
                </Popover>
              </div>

              {/* Grade de Horários agrupados por período */}
              <div className="space-y-3">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Selecione o Horário Disponível
                </span>

                {/* Período da Manhã */}
                <div className="rounded-xl border border-line/70 bg-paper/40 p-3">
                  <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amberdeep">
                    <Sun className="size-3.5 text-amber" />
                    <span>Manhã (07:00 – 11:30)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {HORARIOS_MANHA.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={cn(
                          "rounded-lg border px-1.5 py-1.5 font-mono text-xs font-bold tabular-nums transition-all active:scale-95",
                          hora === h
                            ? "border-ink bg-ink text-cream shadow-xs"
                            : "border-line2 bg-card text-ink hover:border-amber",
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Período da Tarde */}
                <div className="rounded-xl border border-line/70 bg-paper/40 p-3">
                  <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                    <Moon className="size-3.5 text-inksoft" />
                    <span>Tarde (13:00 – 17:30)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {HORARIOS_TARDE.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={cn(
                          "rounded-lg border px-1.5 py-1.5 font-mono text-xs font-bold tabular-nums transition-all active:scale-95",
                          hora === h
                            ? "border-ink bg-ink text-cream shadow-xs"
                            : "border-line2 bg-card text-ink hover:border-amber",
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passo 2: Revisão e Confirmação */}
          {passo === 2 && pacienteFinal && tipos.length > 0 && hora && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-line2/70 bg-card shadow-xs">
                <div className="border-b border-line bg-paper/60 px-4 py-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amberdeep">
                    Resumo do Agendamento Combinado
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
                  <Linha rotulo="Paciente" valor={pacienteFinal.nome} />
                  <Linha rotulo="WhatsApp / Telefone" valor={pacienteFinal.telefone} />
                  <div className="rounded-xl border border-line/60 bg-paper/40 p-2.5 sm:col-span-2">
                    <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-inksoft">
                      Procedimentos Selecionados ({tipos.length}) · Duração Total: {duracaoTotal}{" "}
                      min
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {tipos.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-md border border-line2/60 bg-card px-2 py-0.5 text-xs font-bold text-ink"
                        >
                          <span>{t}</span>
                          <span className="font-mono text-[10px] text-inksoft font-normal">
                            ({duracaoDe(t)} min)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <Linha rotulo="Convênio" valor={pacienteFinal.convenio} />
                  <Linha
                    rotulo="Data"
                    valor={data.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  />
                  <Linha rotulo="Horário de Início" valor={`${hora} horas`} />
                </div>

                <div className="flex items-center gap-2 border-t border-line/70 bg-ok/5 px-4 py-3 text-xs font-medium text-ok">
                  <MessageCircle className="size-4 shrink-0" aria-hidden />
                  <span>
                    Mensagem de confirmação pelo WhatsApp com preparo para todos os procedimentos
                    será disparada.
                  </span>
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Observações Clínicas (opcional)
                </span>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  placeholder="Ex.: Trazer exames anteriores, jejum de 4h, portador de marcapasso..."
                  className={cn(inputCls, "h-auto py-2.5 resize-none")}
                />
              </label>
            </div>
          )}
        </div>

        {/* Rodapé com Navegação */}
        <div className="flex items-center justify-between gap-3 border-t border-line2/60 bg-paper/40 px-6 py-4">
          <button
            type="button"
            onClick={() => setPasso((p) => Math.max(0, p - 1))}
            disabled={passo === 0}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-line2 bg-card px-4 font-mono text-xs font-bold uppercase tracking-wider text-inksoft transition-all hover:border-ink/30 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Voltar
          </button>

          {passo < PASSOS.length - 1 ? (
            <button
              type="button"
              onClick={() => setPasso((p) => p + 1)}
              disabled={!passoValido}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-ink px-5 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-xs transition-all hover:bg-ink/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            >
              Continuar
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmar}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-amber px-5 font-mono text-xs font-black uppercase tracking-wider text-cream shadow-md transition-all hover:bg-amberdeep active:scale-95"
            >
              <Check className="size-4" aria-hidden />
              Salvar Agendamento
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
