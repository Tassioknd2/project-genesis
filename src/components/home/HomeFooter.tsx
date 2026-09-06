import { Link } from "@tanstack/react-router";
import { Calendar, HeartPulse, Mail, MessageCircle, Phone, ShieldCheck, Users } from "lucide-react";

export function HomeFooter() {
  return (
    <footer
      id="seguranca"
      className="border-t border-[#E5DCBA] bg-[#FBF7F0] py-16 dark:border-[#3a3528] dark:bg-[#18140f]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Coluna 1 e 2: Marca e Conformidade Legal */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#2C2018] text-white shadow-sm dark:bg-[#8E3E1E]">
                <HeartPulse className="size-5 text-[#8E3E1E] dark:text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-sans text-base font-black tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
                    Agenda<span className="text-[#8E3E1E] dark:text-[#d97750]">Cardio</span>
                  </span>
                  <span className="rounded bg-[#8E3E1E]/10 px-1.5 py-0.2 font-mono text-[9px] font-black uppercase text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                    PRO
                  </span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#6B5A4E] dark:text-[#baa998]">
                  Cardiologia & Diagnóstico
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-[#6B5A4E] dark:text-[#baa998]">
              O software de agendamento e fluxo de salas projetado exclusivamente para a rotina de
              clínicas cardiológicas, ecocardiografia e métodos diagnósticos gráficos.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 rounded-lg border border-[#E5DCBA] bg-[#FFFFFF] px-2.5 py-1 text-[#3E6748] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#67a074]">
                <ShieldCheck className="size-3.5" />
                <span>CFM Res. nº 2.314/2022</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#E5DCBA] bg-[#FFFFFF] px-2.5 py-1 text-[#2C2018] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#f3ede1]">
                <ShieldCheck className="size-3.5 text-[#3E6748]" />
                <span>LGPD & Sigilo Médico</span>
              </div>
            </div>
          </div>

          {/* Coluna 3: Plataforma */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2C2018] dark:text-[#f3ede1]">
              Plataforma
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              <li>
                <Link
                  to="/agenda"
                  className="transition-colors hover:text-[#8E3E1E] dark:hover:text-[#d97750]"
                >
                  Agenda do Dia
                </Link>
              </li>
              <li>
                <Link
                  to="/pacientes"
                  className="transition-colors hover:text-[#8E3E1E] dark:hover:text-[#d97750]"
                >
                  Diretório de Pacientes
                </Link>
              </li>
              <li>
                <a
                  href="#whatsapp"
                  className="transition-colors hover:text-[#8E3E1E] dark:hover:text-[#d97750]"
                >
                  Automação WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="#exames"
                  className="transition-colors hover:text-[#8E3E1E] dark:hover:text-[#d97750]"
                >
                  Gestão por Exame
                </a>
              </li>
              <li>
                <a
                  href="#recursos"
                  className="transition-colors hover:text-[#8E3E1E] dark:hover:text-[#d97750]"
                >
                  Painel de Presença & Faltas
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Exames Suportados */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2C2018] dark:text-[#f3ede1]">
              Exames Atendidos
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              <li>Ecocardiograma Transtorácico</li>
              <li>MAPA 24h & Holter 24h</li>
              <li>Teste Ergométrico em Esteira</li>
              <li>Duplex Scan Vascular</li>
              <li>Eletrocardiograma (ECG)</li>
              <li>Consultas Especializadas</li>
            </ul>
          </div>

          {/* Coluna 5: Atendimento e Suporte */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2C2018] dark:text-[#f3ede1]">
              Atendimento & Suporte
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-[#8E3E1E] dark:text-[#d97750]" />
                <span>0800 700 8920</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-3.5 text-[#3E6748]" />
                <span>(11) 98765-4321</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-[#2C2018] dark:text-[#f3ede1]" />
                <span>suporte@agendacardio.med.br</span>
              </li>
              <li className="pt-2 text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                Segunda a Sexta: 07:30 às 19:30
                <br />
                Sábado: 08:00 às 13:00
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior com Copyright e Links Legais */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5DCBA] pt-8 text-xs text-[#6B5A4E] dark:border-[#3a3528] dark:text-[#baa998]">
          <p>© 2025 AgendaCardio PRO Tecnologia Médica Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#seguranca" className="hover:underline">
              Termos de Uso
            </a>
            <span>•</span>
            <a href="#seguranca" className="hover:underline">
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="#seguranca" className="hover:underline">
              Segurança da Informação
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
