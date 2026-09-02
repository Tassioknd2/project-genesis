import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, FileText, HeartPulse, Phone, Shield, User, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { HOJE_ISO, calcularIdade, type Patient } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

interface EditarPacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: Patient | null;
  onSalvar: (pacienteAtualizado: Patient) => void;
}

const CONVENIOS_SUGERIDOS = [
  "Particular",
  "Unimed",
  "Bradesco Saúde",
  "SulAmérica",
  "Amil",
  "Porto Seguro",
  "NotreDame Intermédica",
  "Cassi",
];

const inputCls =
  "h-10 w-full rounded-xl border border-line bg-card px-3 text-xs font-medium text-ink shadow-2xs transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20";

export function EditarPacienteDialog({
  open,
  onOpenChange,
  paciente,
  onSalvar,
}: EditarPacienteDialogProps) {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [convenio, setConvenio] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open || !paciente) return;
    setNome(paciente.nome);
    setDataNascimento(paciente.dataNascimento ?? "");
    setTelefone(paciente.telefone);
    setConvenio(paciente.convenio);
    setObservacoes(paciente.observacoes ?? "");
  }, [open, paciente]);

  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return paciente?.idade ?? null;
    return calcularIdade(dataNascimento, paciente?.idade);
  }, [dataNascimento, paciente?.idade]);

  function handleSalvar() {
    if (!paciente || !nome.trim()) return;

    const idadeFinal = dataNascimento
      ? calcularIdade(dataNascimento, paciente.idade)
      : paciente.idade;

    const atualizado: Patient = {
      ...paciente,
      nome: nome.trim(),
      idade: idadeFinal,
      dataNascimento: dataNascimento.trim() || undefined,
      telefone: telefone.trim() || paciente.telefone,
      convenio: convenio.trim() || "Particular",
      observacoes: observacoes.trim() || undefined,
    };

    onSalvar(atualizado);
    onOpenChange(false);
  }

  if (!paciente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        {/* Cabeçalho */}
        <div className="border-b border-line2/70 bg-mutbg/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-ink text-amber">
                <HeartPulse className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-ink">
                  Editar Cadastro do Paciente
                </DialogTitle>
                <DialogDescription className="font-mono text-[10px] uppercase tracking-wider text-inksoft">
                  Prontuário Individual · {paciente.id.toUpperCase()}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-4 p-5">
          {/* Nome */}
          <div>
            <label
              htmlFor="cad-nome"
              className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft"
            >
              <User className="size-3 text-amberdeep" />
              <span>Nome Completo do Paciente</span>
            </label>
            <input
              id="cad-nome"
              type="text"
              className={inputCls}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria de Lourdes Silveira"
            />
          </div>

          {/* Data de Nascimento e Idade calculada */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="cad-nasc"
                  className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft"
                >
                  <Calendar className="size-3 text-amberdeep" />
                  <span>Data de Nascimento</span>
                </label>
                {idadeCalculada !== null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amberdeep">
                    {idadeCalculada} {idadeCalculada === 1 ? "ano" : "anos"}
                  </span>
                )}
              </div>
              <input
                id="cad-nasc"
                type="date"
                max={HOJE_ISO}
                className={inputCls}
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>

            {/* WhatsApp / Telefone */}
            <div>
              <label
                htmlFor="cad-tel"
                className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft"
              >
                <Phone className="size-3 text-ok" />
                <span>WhatsApp / Telefone</span>
              </label>
              <input
                id="cad-tel"
                type="tel"
                className={inputCls}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Convênio / Plano de Saúde */}
          <div>
            <label
              htmlFor="cad-conv"
              className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft"
            >
              <Shield className="size-3 text-amberdeep" />
              <span>Plano de Saúde / Convênio</span>
            </label>
            <input
              id="cad-conv"
              type="text"
              className={inputCls}
              value={convenio}
              onChange={(e) => setConvenio(e.target.value)}
              placeholder="Ex.: Particular, Unimed, Bradesco..."
            />
            {/* Sugestões rápidas */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CONVENIOS_SUGERIDOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConvenio(c)}
                  className={cn(
                    "rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                    convenio.toLowerCase() === c.toLowerCase()
                      ? "bg-ink text-cream"
                      : "border border-line bg-mutbg text-inksoft hover:text-ink",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Observações Clínicas */}
          <div>
            <label
              htmlFor="cad-obs"
              className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-inksoft"
            >
              <FileText className="size-3 text-amberdeep" />
              <span>Anotações Clínicas & Alertas (Opcional)</span>
            </label>
            <textarea
              id="cad-obs"
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-card p-2.5 text-xs font-medium text-ink shadow-2xs placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex.: Hipertenso, alérgico a dipirona, prefere consultas pela manhã..."
            />
          </div>
        </div>

        {/* Rodapé com botões de Ação */}
        <div className="flex items-center justify-end gap-2 border-t border-line2/70 bg-mutbg/40 px-5 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-xl border border-line px-3.5 text-xs font-bold text-inksoft transition-colors hover:bg-card hover:text-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            disabled={!nome.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-4 text-xs font-bold text-cream shadow-2xs transition-all hover:bg-ink/90 active:scale-95 disabled:opacity-50"
          >
            <Check className="size-3.5 text-amber" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
