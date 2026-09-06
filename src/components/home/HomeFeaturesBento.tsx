import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartPulse,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

export function HomeFeaturesBento() {
  return (
    <section id="recursos" className="relative py-16 sm:py-20 lg:py-24">
      <div id="exames" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8E3E1E]/20 bg-[#FDF2EC] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
            <Sparkles className="size-3.5" />
            Recursos Especializados
          </span>

          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#2C2018] sm:text-4xl lg:text-5xl dark:text-[#f3ede1]">
            O controle total dos seus{" "}
            <span className="text-[#8E3E1E] dark:text-[#d97750]">exames cardiológicos</span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#6B5A4E] sm:text-lg dark:text-[#baa998]">
            A rotina de uma clínica de cardiologia exige precisão. O AgendaCardio PRO resolve os
            gargalos específicos de salas e equipamentos:
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 (Destaque Largo - 2 Colunas) */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-7 shadow-sm transition-all hover:border-[#8E3E1E]/60 hover:shadow-md lg:col-span-2 dark:border-[#3a3528] dark:bg-[#252018]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FDF2EC] text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                  <HeartPulse className="size-6" />
                </div>
                <span className="rounded-full bg-[#8E3E1E]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#8E3E1E] dark:bg-[#8E3E1E]/25 dark:text-[#d97750]">
                  Específico para Cardiologia
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2C2018] dark:text-[#f3ede1]">
                Gestão Específica por Exame
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                Blocos de tempo calculados automaticamente de acordo com o protocolo clínico de cada
                equipamento, impedindo atrasos em cadeia e salas ociosas.
              </p>

              {/* Grid Interno de Exames */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="font-bold text-[#8E3E1E] dark:text-[#d97750]">ECO</span>
                  <p className="mt-1 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">45 minutos</p>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="font-bold text-[#2C2018] dark:text-[#f3ede1]">Ergometria</span>
                  <p className="mt-1 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">50 minutos</p>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="font-bold text-[#B4691B] dark:text-[#e49b50]">MAPA 24h</span>
                  <p className="mt-1 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                    20 min inst.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="font-bold text-[#3E6748] dark:text-[#67a074]">Holter 24h</span>
                  <p className="mt-1 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                    20 min inst.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#8E3E1E] dark:text-[#d97750]">
              <CheckCircle2 className="size-4" />
              <span>
                Disparo automático de orientações prévias (suspensão de betabloqueadores, jejum,
                roupa esportiva)
              </span>
            </div>
          </div>

          {/* Card 2: Automação WhatsApp */}
          <div
            id="whatsapp"
            className="group relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-7 shadow-sm transition-all hover:border-[#8E3E1E]/60 hover:shadow-md dark:border-[#3a3528] dark:bg-[#252018]"
          >
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF4EE] text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                <MessageSquare className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2C2018] dark:text-[#f3ede1]">
                Automação Nativa de WhatsApp
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                Confirmação ativa humanizada sem necessidade de intervenção da recepção. O próprio
                paciente confirma ou solicita remarcação.
              </p>

              <div className="mt-5 rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 font-mono text-xs dark:border-[#3a3528] dark:bg-[#1f1b14]">
                <div className="flex items-center gap-2 text-[#3E6748] font-bold dark:text-[#67a074]">
                  <span className="size-2 rounded-full bg-[#3E6748]" />
                  <span>Taxa de Abertura: 98%</span>
                </div>
                <div className="mt-1 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                  Tempo médio de resposta: 14 minutos
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#3E6748] dark:text-[#67a074]">
              <Zap className="size-4" />
              <span>Gera economia imediata de telefonia</span>
            </div>
          </div>

          {/* Card 3: Observações Clínicas & Cuidados */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-7 shadow-sm transition-all hover:border-[#8E3E1E]/60 hover:shadow-md dark:border-[#3a3528] dark:bg-[#252018]">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FCF5E8] text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#e49b50]">
                <ShieldAlert className="size-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2C2018] dark:text-[#f3ede1]">
                Observações Clínicas & Cuidados
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                Sinalização visual imediata de pacientes cadeirantes, com histórico de síncope ou
                marcapasso, garantindo preparo prévio de equipe.
              </p>

              <div className="mt-5 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 rounded-lg bg-[#FCF5E8] px-2.5 py-1.5 text-[#B4691B] font-bold dark:bg-[#B4691B]/15">
                  <AlertCircle className="size-3.5" />
                  <span>Cadeirante • Sala Térrea Obrigatória</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#FDF2EC] px-2.5 py-1.5 text-[#8E3E1E] font-bold dark:bg-[#8E3E1E]/15 dark:text-[#d97750]">
                  <Activity className="size-3.5" />
                  <span>Portador de Marcapasso Dupla-Câmara</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              Integrado ao prontuário e ficha de sala
            </div>
          </div>

          {/* Card 4 (Destaque Largo - 2 Colunas): Métricas do Dia */}
          <div className="group relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-7 shadow-sm transition-all hover:border-[#8E3E1E]/60 hover:shadow-md lg:col-span-2 dark:border-[#3a3528] dark:bg-[#252018]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF4EE] text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                  <BarChart3 className="size-6" />
                </div>
                <span className="font-mono text-xs font-bold text-[#3E6748] dark:text-[#67a074]">
                  Painel de Controle em Tempo Real
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#2C2018] dark:text-[#f3ede1]">
                Métricas do Dia & Painel de Faltas
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
                Acompanhamento instantâneo da taxa de comparecimento do dia, permitindo encaixes
                rápidos e remanejamento com a lista de espera ativa.
              </p>

              {/* Indicadores Numéricos */}
              <div className="mt-6 grid grid-cols-2 gap-3 font-mono sm:grid-cols-4">
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="text-[11px] font-bold text-[#6B5A4E] dark:text-[#baa998]">
                    TOTAL DIA
                  </span>
                  <div className="mt-1 text-2xl font-black text-[#2C2018] dark:text-[#f3ede1]">
                    28
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="text-[11px] font-bold text-[#3E6748] dark:text-[#67a074]">
                    CONFIRMADOS
                  </span>
                  <div className="mt-1 text-2xl font-black text-[#3E6748] dark:text-[#67a074]">
                    26
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="text-[11px] font-bold text-[#B4691B] dark:text-[#e49b50]">
                    PENDENTES
                  </span>
                  <div className="mt-1 text-2xl font-black text-[#B4691B] dark:text-[#e49b50]">
                    2
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-3 text-center dark:border-[#3a3528] dark:bg-[#1f1b14]">
                  <span className="text-[11px] font-bold text-[#8E3E1E] dark:text-[#d97750]">
                    FALTAS HOJE
                  </span>
                  <div className="mt-1 text-2xl font-black text-[#3E6748] dark:text-[#67a074]">
                    0
                  </div>
                </div>
              </div>

              {/* Barra de Progresso com Preenchimento Animado */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#6B5A4E] dark:text-[#baa998]">
                    Taxa de Ocupação Confirmada
                  </span>
                  <span className="font-bold text-[#3E6748] dark:text-[#67a074]">92.8%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DCBA]/50 dark:bg-[#3a3528]">
                  <div className="anim-fill-94 h-full rounded-full bg-[#3E6748]" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#E5DCBA]/70 pt-4 text-xs dark:border-[#3a3528]">
              <span className="font-semibold text-[#3E6748] dark:text-[#67a074]">
                ✓ Atualização automática sem recarregar a página
              </span>
              <span className="font-mono text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                Sincronizado há 1 min
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
