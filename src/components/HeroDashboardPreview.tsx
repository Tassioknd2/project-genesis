import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartPulse,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  UserX,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HeroDashboardPreview
 *
 * Stylized, non-interactive 'Hero Preview' showing a faithful, abstracted version
 * of the patient scheduling dashboard. Gives visitors an immediate understanding
 * of the tool's core purpose (patient schedule, real-time WhatsApp confirmation,
 * prep instructions, and attendant controls).
 */
export function HeroDashboardPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-5xl rounded-3xl border border-line2/90 bg-card shadow-lg overflow-hidden select-none",
        className,
      )}
      aria-label="Pré-visualização estilizada do painel de agendamento e confirmação"
    >
      {/* Top Chrome / Barra Superior de Janela de Aplicativo */}
      <div className="flex items-center justify-between border-b border-line2/70 bg-paper/90 px-4 py-2.5 backdrop-blur-xs">
        {/* Controles de janela macOS sutis */}
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#FF5F56]/80" />
          <span className="size-2.5 rounded-full bg-[#FFBD2E]/80" />
          <span className="size-2.5 rounded-full bg-[#27C93F]/80" />
          <span className="ml-2 font-mono text-[11px] font-semibold text-inksoft">
            painel.agendacardio.com.br/agenda
          </span>
        </div>

        {/* Título da tela e status de sincronização */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex size-1.5 rounded-full bg-ok animate-pulse" />
          <span className="text-[11px] font-medium text-inksoft">
            Recepção Conectada • WhatsApp em Tempo Real
          </span>
        </div>
      </div>

      {/* Conteúdo Fiel do Dashboard da Agenda */}
      <div className="p-4 sm:p-6 lg:p-7 space-y-5 bg-card/60 pointer-events-none">
        {/* Linha 1: Navegação de Data + KPIs Reais da Clínica */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line2/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-cream">
              <CalendarDays className="size-4.5 text-amber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">Agenda do Dia</h3>
                <span className="text-[10px] rounded-full bg-amber/15 px-2 py-0.5 font-mono font-bold text-amberdeep uppercase">
                  Hoje • Seg, 15 Mai
                </span>
              </div>
              <p className="text-[11px] text-inksoft">
                Dr. Marcelo Fontes · Cardiologia e Métodos Gráficos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              11 Confirmados via WhatsApp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber/10 px-2.5 py-1 text-[11px] font-semibold text-amberdeep border border-amber/20">
              <Clock className="size-3.5 text-amber" />3 Aguardando
            </span>
          </div>
        </div>

        {/* Linha 2: Os 5 Indicadores Oficiais do Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Total Dia */}
          <div className="rounded-xl border border-ink bg-card ring-1 ring-ink/30 p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-inksoft">
              <CalendarDays className="size-3.5 text-amber" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                Total Dia
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-ink">14</div>
          </div>

          {/* Confirmados */}
          <div className="rounded-xl border border-ok/40 bg-ok/5 p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-ok">
              <CheckCircle2 className="size-3.5" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                Confirmados
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-ok">
              11 <span className="text-xs font-medium text-inksoft">/ 14</span>
            </div>
          </div>

          {/* Faltas */}
          <div className="rounded-xl border border-line2 bg-card p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-inksoft">
              <UserX className="size-3.5" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                Faltas
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-ink">0</div>
          </div>

          {/* Confirmação WhatsApp */}
          <div className="rounded-xl bg-ink p-3 text-cream shadow-xs">
            <div className="flex items-center gap-2 text-amber">
              <MessageCircle className="size-3.5" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-80">
                Taxa WhatsApp
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-cream">
              92.8<span className="text-xs font-normal opacity-80">%</span>
            </div>
          </div>

          {/* Pendências */}
          <div className="rounded-xl border border-amber/40 bg-amber/5 p-3 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-amberdeep">
              <AlertTriangle className="size-3.5" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                Pendências
              </span>
            </div>
            <div className="mt-1 text-xl font-black text-amberdeep">3</div>
          </div>
        </div>

        {/* Linha 3: Barra de Busca e Filtros Ativos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-inksoft/60" />
            <div className="h-8.5 w-full rounded-xl border border-line2 bg-paper/80 pl-8.5 pr-3 text-[11px] text-inksoft/70 flex items-center">
              Buscar paciente, convênio ou exame...
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="h-7 px-3 rounded-lg bg-ink text-cream text-[10px] font-mono font-bold flex items-center shadow-2xs">
              TODOS (14)
            </span>
            <span className="h-7 px-2.5 rounded-lg border border-line2 bg-paper text-inksoft text-[10px] font-mono font-medium flex items-center">
              CONFIRMADOS (11)
            </span>
            <span className="h-7 px-2.5 rounded-lg border border-line2 bg-paper text-inksoft text-[10px] font-mono font-medium flex items-center">
              AGUARDANDO (3)
            </span>
            <span className="h-7 px-2.5 rounded-lg border border-amber/30 bg-amber/10 text-amberdeep text-[10px] font-mono font-medium flex items-center">
              EXAMES
            </span>
          </div>
        </div>

        {/* Linha 4: Cartões Fiéis da Grade de Atendimentos */}
        <div className="space-y-3 pt-1">
          {/* Cartão 1: Confirmado no WhatsApp (Holter 24h) */}
          <div className="relative rounded-2xl border border-line2/80 bg-card p-3.5 sm:p-4 shadow-2xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ok" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-paper border border-line2 font-mono text-xs font-bold text-ink shrink-0">
                  08:00
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">Dona Lourdes Silveira</span>
                    <span className="text-[10px] rounded bg-amber/15 text-amberdeep font-medium px-2 py-0.5">
                      Holter 24h
                    </span>
                  </div>
                  <p className="text-[11px] text-inksoft mt-0.5">
                    71 anos • Bradesco Saúde • Tel: (11) 98452-1100
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Confirmado no WhatsApp (07:42)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-line2/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-inksoft">
              <span>
                💡 <strong>Preparo entregue:</strong> Comparecer com camisa de botões na frente.
              </span>
              <div className="flex items-center gap-1 text-[10px] font-medium text-inksoft">
                <span className="rounded bg-paper border border-line2 px-1.5 py-0.5">WhatsApp</span>
                <span className="rounded bg-paper border border-line2 px-1.5 py-0.5">
                  Reagendar
                </span>
                <span className="rounded bg-paper border border-line2 px-1.5 py-0.5">
                  Prontuário
                </span>
              </div>
            </div>
          </div>

          {/* Cartão 2: Confirmado no WhatsApp (Ecocardiograma) */}
          <div className="relative rounded-2xl border border-line2/80 bg-card p-3.5 sm:p-4 shadow-2xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ok" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-paper border border-line2 font-mono text-xs font-bold text-ink shrink-0">
                  08:45
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">Sr. Antônio Carlos Ferreira</span>
                    <span className="text-[10px] rounded bg-blue-50 text-blue-700 font-medium px-2 py-0.5">
                      Ecocardiograma
                    </span>
                  </div>
                  <p className="text-[11px] text-inksoft mt-0.5">
                    58 anos • Unimed • Tel: (11) 97120-4321
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Confirmado no WhatsApp (08:05)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-line2/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-inksoft">
              <span>Paciente pontual • Avaliação periódica anual de sopro cardíaco.</span>
              <span className="text-ok font-semibold">Sala 2 Pronta</span>
            </div>
          </div>

          {/* Cartão 3: Aguardando Resposta (MAPA 24h) */}
          <div className="relative rounded-2xl border border-amber/40 bg-amber/[0.03] p-3.5 sm:p-4 shadow-2xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-paper border border-amber/30 font-mono text-xs font-bold text-amberdeep shrink-0">
                  09:30
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">Heloísa Helena Ramos</span>
                    <span className="text-[10px] rounded bg-purple-50 text-purple-700 font-medium px-2 py-0.5">
                      MAPA 24h
                    </span>
                  </div>
                  <p className="text-[11px] text-inksoft mt-0.5">
                    42 anos • Particular • Tel: (11) 99312-8877
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber/10 px-2.5 py-0.5 text-[11px] font-semibold text-amberdeep border border-amber/20">
                  <Clock className="size-3 text-amber" />
                  Aguardando WhatsApp (Enviado às 07:00)
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-inksoft">
              <span>Instrução enviada: Não usar roupas apertadas no braço do manguito.</span>
              <span className="text-amberdeep font-medium">Auto-lembrete às 09:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Micro-Badge destacando o valor principal da ferramenta */}
      <div className="border-t border-line2/60 bg-paper px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
            ✓
          </div>
          <span className="text-ink font-medium">
            <strong>Sincronização em Tempo Real:</strong> Cada resposta no WhatsApp atualiza a vaga
            automaticamente, sem atendente no telefone.
          </span>
        </div>
        <span className="text-[11px] text-inksoft font-mono">
          Visão autêntica do aplicativo Agenda Cardio
        </span>
      </div>
    </div>
  );
}
