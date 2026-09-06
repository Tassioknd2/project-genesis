import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  MessageSquare,
  Phone,
  PhoneCall,
  Repeat,
  Save,
  Sparkles,
} from "lucide-react";
import { HomeMotionMonthAgenda } from "./HomeMotionMonthAgenda";

export function HomeImpactStats() {
  return (
    <section id="impacto" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção de Impacto */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8E3E1E]/20 bg-[#FDF2EC] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
            <Sparkles className="size-3.5" />
            Rotina Leve & Consultório Cheio
          </span>

          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#2C2018] sm:text-4xl lg:text-5xl dark:text-[#f3ede1]">
            Menos telefone tocando, zero horários perdidos.{" "}
            <span className="text-[#8E3E1E] dark:text-[#d97750]">Simples assim.</span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#6B5A4E] sm:text-lg dark:text-[#baa998]">
            Chega de perder manhãs inteiras ligando de um em um ou ver exames de 50 minutos ficarem
            vazios. Veja o que muda na sua clínica logo no primeiro dia:
          </p>
        </div>

        {/* TRÊS ELEMENTOS VISUAIS EM ESTRUTURA HARMÔNICA E ALINHADA */}
        <div className="mt-12 space-y-6">
          {/* Nível 1: Par de automações clínicas diárias em grid balanceado 50% / 50% */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: Observações Clínicas em Tempo Real */}
            <div className="group flex h-full flex-col justify-between rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] p-6 shadow-xs transition-all duration-300 hover:border-[#8E3E1E]/30 hover:shadow-sm dark:border-[#3a3528] dark:bg-[#1f1b14] dark:hover:border-[#8E3E1E]/40">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#8E3E1E]/10 text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                    <FileEdit className="size-5" />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#8E3E1E]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                    <span className="size-1.5 animate-pulse rounded-full bg-[#8E3E1E]" />
                    Simulação Ativa
                  </span>
                </div>
                <h3 className="font-sans text-lg font-bold tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
                  Observações Clínicas em Tempo Real
                </h3>
                <p className="mt-1 mb-4 text-xs leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                  Alerte a equipe sobre detalhes que salvam o atendimento
                </p>

                {/* Micro-simulação interativa de digitação e salvamento */}
                <div className="rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] p-3.5 font-mono text-xs dark:border-[#3a3528] dark:bg-[#252018]">
                  <div className="mb-1.5 flex items-center justify-between font-sans text-[10px] text-[#968374]">
                    <span>Campo: Notas Médicas & Alertas</span>
                    <span className="font-bold text-[#8E3E1E] dark:text-[#d97750]">Auto-Sync</span>
                  </div>
                  <div className="flex min-h-[32px] items-center gap-1.5 rounded-lg border border-[#E5DCBA]/80 bg-white px-2.5 py-1.5 text-[#2C2018] dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#f3ede1]">
                    <span className="text-[#8E3E1E] dark:text-[#d97750]">📝</span>
                    <span className="anim-typewriter-note font-medium text-[#2C2018] dark:text-[#f3ede1]">
                      paciente não sobe escada
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-[#E5DCBA]/40 pt-2 dark:border-[#3a3528]/60">
                    <button
                      type="button"
                      className="anim-save-btn flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs"
                    >
                      <Save className="size-3" />
                      <span>Salvar Observação</span>
                    </button>
                    <span className="text-[10px] text-[#968374]">Gravado em 0.2s</span>
                  </div>
                  {/* Badge de Alerta Resultante */}
                  <div className="anim-note-badge mt-2.5">
                    <div className="flex items-start gap-1.5 rounded-lg border border-[#B4691B]/40 bg-[#FCF5E8] p-2 text-[11px] text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#d48c3b]">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      <span className="leading-tight">
                        <strong>Observação Clínica:</strong> paciente não sobe escada — alocar sala
                        térrea
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1.5 border-t border-[#E5DCBA]/60 pt-3 text-[11px] text-[#968374] dark:border-[#3a3528]">
                <Accessibility className="size-3.5 text-[#3E6748]" />
                <span>Evita atrasos na troca de salas com pacientes idosos</span>
              </p>
            </div>

            {/* Card 2: Recuperação Ativa de No-Show */}
            <div className="group flex h-full flex-col justify-between rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] p-6 shadow-xs transition-all duration-300 hover:border-[#3E6748]/30 hover:shadow-sm dark:border-[#3a3528] dark:bg-[#1f1b14] dark:hover:border-[#3E6748]/40">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#3E6748]/10 text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                    <Repeat className="size-5" />
                  </div>
                  <span className="rounded-full bg-[#3E6748]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                    Fluxo Rápido
                  </span>
                </div>
                <h3 className="font-sans text-lg font-bold tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
                  Recuperação Ativa de No-Show
                </h3>
                <p className="mt-1 mb-4 text-xs leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                  Não perca pacientes mesmo quando houver falta
                </p>

                {/* Micro-simulação interativa de reagendamento */}
                <div className="rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] p-3.5 text-xs dark:border-[#3a3528] dark:bg-[#252018]">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-bold text-[#2C2018] dark:text-[#f3ede1]">
                      Mariana Tavares (MAPA 24h)
                    </span>
                    <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                      Faltante
                    </span>
                  </div>
                  <p className="mb-2.5 text-[11px] text-[#968374]">
                    Horário original: 10:00 • 1 toque para recuperar
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1 rounded-lg border border-[#E5DCBA] bg-white px-2 py-1.5 text-[10px] font-bold text-[#2C2018] transition-all hover:bg-[#F3ECE0] active:scale-95 dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#f3ede1] dark:hover:bg-[#322c22]"
                    >
                      <Phone className="size-3 text-[#3E6748]" />
                      <span>Ligar p/ Paciente</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1 rounded-lg bg-[#3E6748] px-2 py-1.5 text-[10px] font-bold text-white shadow-xs transition-all hover:bg-opacity-90 active:scale-95"
                    >
                      <MessageSquare className="size-3" />
                      <span>Chamar WhatsApp</span>
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-[#E5DCBA]/40 pt-2 text-[10px] font-medium text-[#3E6748] dark:border-[#3a3528]/60 dark:text-[#67a074]">
                    <span className="flex items-center gap-1">
                      <PhoneCall className="size-3" />
                      <span>Ligando... → Reagendado para 16:30</span>
                    </span>
                    <span className="font-bold">✓ Vaga Repassada</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1.5 border-t border-[#E5DCBA]/60 pt-3 text-[11px] text-[#968374] dark:border-[#3a3528]">
                <CheckCircle2 className="size-3.5 text-[#3E6748]" />
                <span>Zero perda de receita no dia</span>
              </p>
            </div>
          </div>

          {/* Nível 2: Card 3 - Motion Design da Agenda Mensal em Largura Completa */}
          <div className="w-full">
            <HomeMotionMonthAgenda defaultExpanded={true} />
          </div>
        </div>
      </div>
    </section>
  );
}
