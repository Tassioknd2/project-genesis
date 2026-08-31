import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  duracaoDe,
  type Appointment,
  type Patient,
  type TipoAtendimento,
} from "@/lib/agenda-data";

const TIPOS: TipoAtendimento[] = [
  "Consulta",
  "Retorno",
  "Eletrocardiograma",
  "Ecocardiograma",
  "Teste ergométrico",
  "Holter 24h",
  "MAPA",
];

export interface EdicaoResultado {
  paciente: Patient;
  agendamento?: { hora: string; tipo: TipoAtendimento; duracaoMin: number };
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

const labelCls =
  "mb-1 block font-mono text-[10px] uppercase tracking-widest text-inksoft";

export function EditarRegistroDialog({
  open,
  onOpenChange,
  paciente,
  appointment,
  onSalvar,
}: EditarRegistroDialogProps) {
  const [nome, setNome] = useState(paciente.nome);
  const [idade, setIdade] = useState(String(paciente.idade));
  const [telefone, setTelefone] = useState(paciente.telefone);
  const [convenio, setConvenio] = useState(paciente.convenio);
  const [observacoes, setObservacoes] = useState(paciente.observacoes ?? "");
  const [hora, setHora] = useState(appointment?.hora ?? "");
  const [tipo, setTipo] = useState<TipoAtendimento>(appointment?.tipo ?? "Consulta");

  // Reabrir o popup sempre parte dos dados atuais do registro.
  useEffect(() => {
    if (!open) return;
    setNome(paciente.nome);
    setIdade(String(paciente.idade));
    setTelefone(paciente.telefone);
    setConvenio(paciente.convenio);
    setObservacoes(paciente.observacoes ?? "");
    setHora(appointment?.hora ?? "");
    setTipo(appointment?.tipo ?? "Consulta");
  }, [open, paciente, appointment]);

  function salvar() {
    if (!nome.trim()) return;
    const atualizado: Patient = {
      ...paciente,
      nome: nome.trim(),
      idade: Number(idade) || paciente.idade,
      telefone: telefone.trim(),
      convenio: convenio.trim() || paciente.convenio,
    };
    if (observacoes.trim()) atualizado.observacoes = observacoes.trim();
    else delete atualizado.observacoes;

    onSalvar({
      paciente: atualizado,
      ...(appointment
        ? { agendamento: { hora: hora || appointment.hora, tipo, duracaoMin: duracaoDe(tipo) } }
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
              {appointment ? "Cadastro e agendamento" : "Cadastro do paciente"}
            </DialogDescription>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className={labelCls} htmlFor="ed-nome">
              Nome
            </label>
            <input id="ed-nome" className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="ed-idade">
                Idade
              </label>
              <input
                id="ed-idade"
                type="number"
                min={0}
                className={inputCls}
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ed-telefone">
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
            <label className={labelCls} htmlFor="ed-convenio">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="ed-tipo">
                  Tipo de atendimento
                </label>
                <select
                  id="ed-tipo"
                  className={inputCls}
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoAtendimento)}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="ed-hora">
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
            <label className={labelCls} htmlFor="ed-obs">
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
