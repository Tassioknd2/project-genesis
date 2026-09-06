import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  HeartPulse,
  Mail,
  MessageCircle,
  Phone,
  User,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface HomeContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HomeContactModal({ open, onOpenChange }: HomeContactModalProps) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [clinica, setClinica] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    toast.success("Solicitação recebida com sucesso!", {
      description: "Nosso consultor clínico entrará em contato via WhatsApp em poucos minutos.",
    });
    setTimeout(() => {
      onOpenChange(false);
      setEnviado(false);
      setNome("");
      setWhatsapp("");
      setClinica("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#E5DCBA] bg-[#FFFFFF] p-6 text-[#2C2018] shadow-2xl dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#8E3E1E] dark:text-[#d97750]">
            <HeartPulse className="size-5" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              AgendaCardio PRO
            </span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
            Fale com um Especialista Clínico
          </DialogTitle>
        </DialogHeader>

        <p className="mt-1 text-xs text-[#6B5A4E] dark:text-[#baa998]">
          Tire dúvidas sobre a integração de WhatsApp, suporte a ecocardiogramas e migração de dados
          da sua clínica.
        </p>

        {enviado ? (
          <div className="my-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#EEF4EE] p-6 text-center text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
            <CheckCircle2 className="size-10" />
            <h4 className="font-bold">Obrigado pelo contato!</h4>
            <p className="text-xs">
              Estamos direcionando seu atendimento para o WhatsApp informado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#6B5A4E] dark:text-[#baa998]">
                Seu Nome Completo
              </label>
              <div className="relative mt-1">
                <User className="absolute top-2.5 left-3 size-4 text-[#6B5A4E] dark:text-[#baa998]" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dr. Roberto / Mariana (Recepção)"
                  className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2 pr-3 pl-9 text-xs font-medium text-[#2C2018] placeholder:text-gray-400 focus:border-[#8E3E1E] focus:outline-none dark:border-[#3a3528] dark:bg-[#1f1b14] dark:text-[#f3ede1]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#6B5A4E] dark:text-[#baa998]">
                WhatsApp com DDD
              </label>
              <div className="relative mt-1">
                <Phone className="absolute top-2.5 left-3 size-4 text-[#3E6748]" />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] py-2 pr-3 pl-9 text-xs font-medium text-[#2C2018] placeholder:text-gray-400 focus:border-[#8E3E1E] focus:outline-none dark:border-[#3a3528] dark:bg-[#1f1b14] dark:text-[#f3ede1]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase text-[#6B5A4E] dark:text-[#baa998]">
                Nome da Clínica / Consultório
              </label>
              <input
                type="text"
                value={clinica}
                onChange={(e) => setClinica(e.target.value)}
                placeholder="Ex: Clínica Cardio Diagnósticos"
                className="mt-1 w-full rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] px-3 py-2 text-xs font-medium text-[#2C2018] placeholder:text-gray-400 focus:border-[#8E3E1E] focus:outline-none dark:border-[#3a3528] dark:bg-[#1f1b14] dark:text-[#f3ede1]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-2.5 font-mono text-xs font-bold uppercase text-white shadow-sm transition-all hover:bg-[#743116] active:scale-95 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
              >
                <MessageCircle className="size-4" />
                <span>Receber Demonstração via WhatsApp</span>
              </button>
            </div>

            <div className="border-t border-[#E5DCBA]/70 pt-3 text-center dark:border-[#3a3528]">
              <p className="text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                Ou se preferir, experimente o sistema agora mesmo:
              </p>
              <Link
                to="/agenda"
                onClick={() => onOpenChange(false)}
                className="mt-1.5 inline-flex items-center gap-1 font-mono text-xs font-bold text-[#8E3E1E] hover:underline dark:text-[#d97750]"
              >
                <span>Acessar Painel Interativo da Agenda</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
