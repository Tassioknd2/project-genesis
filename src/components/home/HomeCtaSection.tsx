import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, CheckCircle2, MessageCircle, Sparkles, Zap } from "lucide-react";

export interface HomeCtaSectionProps {
  onOpenDemo?: () => void;
  onOpenContact?: () => void;
}

export function HomeCtaSection({ onOpenDemo, onOpenContact }: HomeCtaSectionProps) {
  return (
    <section
      id="demo-section"
      className="relative overflow-hidden bg-[#2C2018] py-20 text-white sm:py-24 lg:py-28 dark:bg-[#1a140e]"
    >
      {/* Luz Ambiental Suave de Fundo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[#8E3E1E]/25 blur-[120px]" />

      <div id="planos" className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#F3ECE0]">
          <Sparkles className="size-3.5 text-[#d97750]" />
          Implantação sem Complicações
        </span>

        <h2 className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Transforme o fluxo e a pontualidade da sua clínica cardiológica hoje.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#baa998] sm:text-lg">
          Teste grátis por 14 dias sem necessidade de cartão de crédito. Nossa equipe de
          especialistas médicos auxilia em toda a migração dos seus dados de prontuário e agenda.
        </p>

        {/* Grupo de Ação */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/agenda"
            className="btn-shimmer-effect group flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#a34824] hover:shadow-xl active:scale-95 sm:w-auto"
          >
            <Calendar className="size-4" />
            <span>Abrir Agenda do Sistema</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={onOpenContact}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95 sm:w-auto"
          >
            <MessageCircle className="size-4 text-[#3E6748]" />
            <span>Falar com Consultor Clínico</span>
          </button>
        </div>

        {/* Badges de Confiança */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-[#baa998]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#3E6748]" />
            <span>Sem fidelidade ou carência</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#3E6748]" />
            <span>Importação de histórico de pacientes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#3E6748]" />
            <span>Treinamento de recepcionistas incluído</span>
          </div>
        </div>
      </div>
    </section>
  );
}
