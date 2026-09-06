import { HeartPulse, Quote, Star, UserCheck } from "lucide-react";

export function HomeTestimonials() {
  return (
    <section id="depoimentos" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8E3E1E]/20 bg-[#FDF2EC] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
            <UserCheck className="size-3.5" />
            Depoimentos Médicos
          </span>

          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#2C2018] sm:text-4xl lg:text-5xl dark:text-[#f3ede1]">
            Aprovado por diretores clínicos e especialistas em{" "}
            <span className="text-[#8E3E1E] dark:text-[#d97750]">cardiologia diagnóstica.</span>
          </h2>
        </div>

        {/* Grade de Depoimentos */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Depoimento 1: Dr. Carlos Mendes */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-8 shadow-sm dark:border-[#3a3528] dark:bg-[#252018]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="size-6 text-[#8E3E1E]/20 dark:text-[#d97750]/30" />
              </div>

              <blockquote className="mt-6 text-sm leading-relaxed text-[#2C2018] sm:text-base dark:text-[#f3ede1]">
                "O maior pesadelo de uma clínica cardiológica é o tempo ocioso de um aparelho de
                Ecocardiograma com médico plantonista aguardando. Com o AgendaCardio PRO, reduzimos
                a taxa de ausência em exames de{" "}
                <strong className="text-[#8E3E1E] dark:text-[#d97750]">22% para menos de 4%</strong>{" "}
                logo no primeiro mês. O WhatsApp automatizado protegeu nosso faturamento e a rotina
                dos médicos."
              </blockquote>
            </div>

            <div className="mt-8 flex items-center gap-3.5 border-t border-[#E5DCBA]/70 pt-6 dark:border-[#3a3528]">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#2C2018] font-mono text-sm font-black text-white dark:bg-[#8E3E1E]">
                CM
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                  Dr. Carlos Mendes
                </h4>
                <p className="text-xs text-[#6B5A4E] dark:text-[#baa998]">
                  Cardiologista Intervencionista & Diretor Clínico
                </p>
                <p className="font-mono text-[10px] text-[#8E3E1E] dark:text-[#d97750]">
                  Clínica CardioVida • São Paulo, SP
                </p>
              </div>
            </div>
          </div>

          {/* Depoimento 2: Dra. Mariana Vasconcelos */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-8 shadow-sm dark:border-[#3a3528] dark:bg-[#252018]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="size-6 text-[#3E6748]/20 dark:text-[#67a074]/30" />
              </div>

              <blockquote className="mt-6 text-sm leading-relaxed text-[#2C2018] sm:text-base dark:text-[#f3ede1]">
                "A equipe da recepção agora respira. As ligações intermináveis para confirmar
                pacientes desapareceram. Os pacientes elogiam o lembrete claro com as instruções de
                preparo, e os médicos têm previsibilidade exata de quando a esteira ou a sala de ECO
                estará ocupada."
              </blockquote>
            </div>

            <div className="mt-8 flex items-center gap-3.5 border-t border-[#E5DCBA]/70 pt-6 dark:border-[#3a3528]">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#3E6748] font-mono text-sm font-black text-white">
                MV
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                  Dra. Mariana Vasconcelos
                </h4>
                <p className="text-xs text-[#6B5A4E] dark:text-[#baa998]">
                  Especialista em Ecocardiografia Diagnóstica
                </p>
                <p className="font-mono text-[10px] text-[#3E6748] dark:text-[#67a074]">
                  Instituto do Coração Integrado • Rio de Janeiro, RJ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa de Avaliações Globais */}
        <div className="mt-10 flex flex-wrap items-center justify-around gap-6 rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-4 text-center font-mono text-xs text-[#6B5A4E] dark:border-[#3a3528] dark:bg-[#1f1b14] dark:text-[#baa998]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2C2018] dark:text-[#f3ede1]">4.9 / 5.0</span>
            <span>em satisfação médica</span>
          </div>
          <div className="h-4 w-px bg-[#E5DCBA] dark:bg-[#3a3528]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#3E6748] dark:text-[#67a074]">99.9% Uptime</span>
            <span>alta disponibilidade em nuvem</span>
          </div>
          <div className="h-4 w-px bg-[#E5DCBA] dark:bg-[#3a3528]" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#8E3E1E] dark:text-[#d97750]">140+ Clínicas</span>
            <span>em todo o Brasil</span>
          </div>
        </div>
      </div>
    </section>
  );
}
