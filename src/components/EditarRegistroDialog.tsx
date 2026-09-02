import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  HOJE_ISO,
  calcularIdade,
  duracaoDe,
  duracaoDosTipos,
  type Appointment,
  type Patient,
  type TipoAtendimento,
} from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

const TIPOS: { tipo: TipoAtendimento; duracao: number }[] = [
  { tipo: "Consulta", duracao: 45 },
  { tipo: "Retorno", duracao: 30 },
  { tipo: "Eletrocardiograma", duracao: 20 },
  { tipo: "Ecocardiograma", duracao: 40 },
  { tipo: "Teste ergométrico", duracao: 45 },
  { tipo: "Holter 24h", duracao: 30 },
  { tipo: "MAPA", duracao: 30 },
];

export interface EdicaoResultado {
  paciente: Patient;
  agendamento?: {
    hora: string;
    tipo: TipoAtendimento;
    tipos?: TipoAtendimento[];
    duracaoMin: number;
  };
}

interface EditarRegistroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: Patient;
  /** Quando presente, também permite corrigir os dados do agendamento. */
  appointment?: Appointment;
  onSalvar: (resultado: EdicaoResultado) => void;
}

const inputCls =
  "h-10 w-full rounded-xl border border-line2 bg-card px-3 text-sm font-medium text-ink shadow-sm transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20";

export function EditarRegistroDialog({
  open,
  onOpenChange,
  paciente,
  appointment,
  onSalvar,
}: EditarRegistroDialogProps) {
  const [nome, setNome] = useState(paciente.nome);
  const [dataNascimento, setDataNascimento] = useState(paciente.dataNascimento ?? "");
  const [telefone, setTelefone] = useState(paciente.telefone);
  const [convenio, setConvenio] = useState(paciente.convenio);
  const [observacoes, setObservacoes] = useState(paciente.observacoes ?? "");
  const [hora, setHora] = useState(appointment?.hora ?? "");
  const [tipos, setTipos] = useState<TipoAtendimento[]>(() => {
    if (appointment?.tipos && appointment.tipos.length > 0) return appointment.tipos;
    if (appointment?.tipo) return [appointment.tipo];
    return ["Consulta"];
  });

  // Reabrir o popup sempre parte dos dados atuais do registro.
  useEffect(() => {
    if (!open) return;
    setNome(paciente.nome);
    setDataNascimento(paciente.dataNascimento ?? "");
    setTelefone(paciente.telefone);
    setConvenio(paciente.convenio);
    setObservacoes(paciente.observacoes ?? "");
    setHora(appointment?.hora ?? "");
    if (appointment?.tipos && appointment.tipos.length > 0) {
      setTipos(appointment.tipos);
    } else if (appointment?.tipo) {
      setTipos([appointment.tipo]);
    } else {
      setTipos(["Consulta"]);
    }
  }, [open, paciente, appointment]);

  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return paciente.idade || null;
    return calcularIdade(dataNascimento, paciente.idade);
  }, [dataNascimento, paciente.idade]);

  function toggleTipo(t: TipoAtendimento) {
    setTipos((prev) => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // manter ao menos 1
        return prev.filter((x) => x !== t);
      }
      return [...prev, t];
    });
  }

  const duracaoTotal = duracaoDosTipos(tipos);

  function salvar() {
    if (!nome.trim() || tipos.length === 0) return;
    const finalIdade = dataNascimento
      ? calcularIdade(dataNascimento, paciente.idade)
      : paciente.idade;

    const atualizado: Patient = {
      ...paciente,
      nome: nome.trim(),
      idade: finalIdade,
      telefone: telefone.trim(),
      convenio: convenio.trim() || paciente.convenio,
    };
    if (dataNascimento.trim()) atualizado.dataNascimento = dataNascimento.trim();
    else delete atualizado.dataNascimento;
    if (observacoes.trim()) atualizado.observacoes = observacoes.trim();
    else delete atualizado.observacoes;

    const primaryTipo = tipos[0] || "Consulta";

    onSalvar({
      paciente: atualizado,
      ...(appointment
        ? {
            agendamento: {
              hora: hora || appointment.hora,
              tipo: primaryTipo,
              tipos,
              duracaoMin: duracaoTotal,
            },
          }
        : {}),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b border-line2/50 px-6 pb-4 pt-6">
          <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg border border-amber/30 bg-amber/10 text-amberdeep">
            <Pencil className="size-4" aria-hidden />
          </span>
          <div>
            <DialogTitle className="text-lg font-extrabold uppercase tracking-tighter text-ink">
              Editar informações
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
              {appointment ? "Cadastro e procedimentos agendados" : "Cadastro do paciente"}
            </DialogDescription>
          </div>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label
              className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
              htmlFor="ed-nome"
            >
              Nome
            </label>
            <input
              id="ed-nome"
              className={inputCls}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="block font-mono text-[10px] uppercase tracking-widest text-inksoft"
                  htmlFor="ed-nascimento"
                >
                  Data de nascimento
                </label>
                {idadeCalculada !== null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amberdeep">
                    {idadeCalculada} {idadeCalculada === 1 ? "ano" : "anos"}
                  </span>
                )}
              </div>
              <input
                id="ed-nascimento"
                type="date"
                max={HOJE_ISO}
                className={inputCls}
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
            <div>
              <label
                className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
                htmlFor="ed-telefone"
              >
                Telefone
              </label>
              <input
                id="ed-telefone"
                className={inputCls}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
              htmlFor="ed-convenio"
            >
              Convênio
            </label>
            <input
              id="ed-convenio"
              className={inputCls}
              value={convenio}
              onChange={(e) => setConvenio(e.target.value)}
            />
          </div>

          {appointment && (
            <div className="space-y-3 rounded-xl border border-line2/70 bg-paper/40 p-3.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft">
                  Procedimentos do Atendimento ({tipos.length})
                </label>
                <span className="font-mono text-[10px] font-bold text-amberdeep">
                  Total: {duracaoTotal} min
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {TIPOS.map((t) => {
                  const isSelected = tipos.includes(t.tipo);
                  return (
                    <button
                      key={t.tipo}
                      type="button"
                      onClick={() => toggleTipo(t.tipo)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-all active:scale-95",
                        isSelected
                          ? "border-ink bg-ink text-cream shadow-2xs"
                          : "border-line2 bg-card text-ink hover:border-amber/40",
                      )}
                    >
                      <span className="truncate">{t.tipo}</span>
                      <span
                        className={cn(
                          "ml-1 shrink-0 font-mono text-[9px]",
                          isSelected ? "text-cream/70" : "text-inksoft",
                        )}
                      >
                        {t.duracao}m
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
                  htmlFor="ed-hora"
                >
                  Horário
                </label>
                <input
                  id="ed-hora"
                  type="time"
                  className={inputCls}
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label
              className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft"
              htmlFor="ed-obs"
            >
              Observação do cadastro
            </label>
            <textarea
              id="ed-obs"
              rows={3}
              className="w-full resize-none rounded-xl border border-line2 bg-card p-3 text-sm text-ink shadow-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line2/50 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-xl border border-line px-4 text-[11px] font-bold uppercase tracking-wider text-inksoft transition-colors hover:border-ink/30"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            className="h-10 rounded-xl bg-ink px-5 text-[11px] font-bold uppercase tracking-wider text-cream transition-colors hover:bg-ink/90"
          >
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
