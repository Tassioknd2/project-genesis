import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

export interface HomeHeroProps {
  onOpenDemo?: () => void;
  onScrollToDemo?: () => void;
}

export function HomeHero({ onOpenDemo, onScrollToDemo }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-14 text-center sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20">
      {/* Ambient Radial Warmth Glows */}
      <div className="pointer-events-none absolute top-12 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#8E3E1E]/15 via-[#FCF5E8]/40 to-transparent blur-3xl dark:from-[#8E3E1E]/10 dark:via-[#252018]/40" />

      {/* Subtle Heartbeat Wave Background Vector */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-40 dark:opacity-20">
        <svg
          className="h-48 w-full max-w-6xl text-[#8E3E1E]/20"
          fill="none"
          viewBox="0 0 1200 200"
          aria-hidden="true"
        >
          <path
            className="anim-ecg-path"
            d="M0,100 L300,100 L320,80 L330,120 L345,40 L360,160 L375,90 L390,105 L400,100 L700,100 L720,80 L730,120 L745,40 L760,160 L775,90 L790,105 L800,100 L1200,100"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Notificação Superior de Destaque */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5DCBA] bg-[#FFFFFF] px-3.5 py-1.5 shadow-xs transition-transform hover:scale-[1.01] dark:border-[#3a3528] dark:bg-[#252018]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E6748] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#3E6748]" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-tight text-[#6B5A4E] dark:text-[#baa998]">
            <strong className="text-[#3E6748] dark:text-[#67a074]">NOVO:</strong> Confirmação Ativa
            via WhatsApp com IA Cardíaca
          </span>
          <ArrowRight className="size-3 text-[#6B5A4E] dark:text-[#baa998]" />
        </div>

        {/* Título Principal de Alto Impacto */}
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-[#2C2018] sm:text-5xl lg:text-6xl dark:text-[#f3ede1]">
          O sistema de agendamento e fluxo de pacientes feito sob medida para a{" "}
          <span className="relative inline-block text-[#8E3E1E] dark:text-[#d97750]">
            Cardiologia.
            <svg
              className="absolute -bottom-2.5 left-0 w-full text-[#8E3E1E]/30 dark:text-[#d97750]/40"
              viewBox="0 0 358 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 9C118.5 1.5 239.5 2.5 355 9"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtítulo Descritivo com Foco no Problema */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6B5A4E] sm:text-lg dark:text-[#baa998]">
          Elimine o absenteísmo em exames complexos como Ecocardiograma, Holter e MAPA com
          confirmações humanizadas no WhatsApp e controle de salas em tempo real.
        </p>

        {/* Grupo de Ação Primária */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          <Link
            to="/agenda"
            className="btn-shimmer-effect group flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] px-7 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#743116] hover:shadow-lg active:scale-95 sm:w-auto dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
          >
            <Sparkles className="size-4 text-white/90" />
            <span>Começar Teste Grátis de 14 Dias</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={onScrollToDemo || onOpenDemo}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E5DCBA] bg-[#FFFFFF] px-6 py-3.5 text-sm font-bold text-[#2C2018] shadow-xs transition-all hover:scale-[1.01] hover:bg-[#F3ECE0] active:scale-95 sm:w-auto dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1] dark:hover:bg-[#322c22]"
          >
            <span className="relative flex size-4 items-center justify-center">
              <span className="anim-ripple-pulse absolute inset-0 rounded-full bg-[#8E3E1E]/25 dark:bg-[#d97750]/25" />
              <PlayCircle className="size-4 text-[#8E3E1E] transition-transform group-hover:scale-110 dark:text-[#d97750]" />
            </span>
            <span>Ver Demonstração ao Vivo</span>
          </button>
        </div>

        {/* Prova Social Rápida */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-[#6B5A4E] dark:text-[#baa998]">
          <div className="flex -space-x-2">
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-[#FBF7F0] bg-[#3E6748] text-[10px] font-bold text-white shadow-2xs dark:border-[#1f1b14]">
              CM
            </div>
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-[#FBF7F0] bg-[#8E3E1E] text-[10px] font-bold text-white shadow-2xs dark:border-[#1f1b14]">
              MV
            </div>
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-[#FBF7F0] bg-[#2C2018] text-[10px] font-bold text-white shadow-2xs dark:border-[#1f1b14]">
              AL
            </div>
          </div>
          <span className="font-medium">
            Mais de <strong>140 clínicas cardiológicas ativas</strong> • Redução média de{" "}
            <strong className="text-[#3E6748] dark:text-[#67a074]">42% nas faltas</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
