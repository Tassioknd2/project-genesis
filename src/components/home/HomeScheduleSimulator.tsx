import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HeartPulse,
  Info,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PatientItem {
  id: string;
  hora: string;
  duracao: string;
  nome: string;
  idade: number;
  convenio: string;
  exame: string;
  medico: string;
  status: "confirmado" | "aguardando";
  observacao?: string;
}

const INITIAL_PATIENTS: PatientItem[] = [
  {
    id: "fernando",
    hora: "08:00",
    duracao: "45 MIN",
    nome: "Fernando Alcântara",
    idade: 64,
    convenio: "PARTICULAR",
    exame: "Ecocardiograma Transtorácico",
    medico: "Dr. Carlos Mendes",
    status: "aguardando",
    observacao: "Preparo guiado recebido pelo WhatsApp • Trazer ecocardiograma anterior",
  },
  {
    id: "claudia",
    hora: "08:50",
    duracao: "50 MIN",
    nome: "Cláudia Ferraz",
    idade: 71,
    convenio: "SULAMÉRICA",
    exame: "Teste Ergométrico",
    medico: "Dr. Carlos Mendes",
    status: "confirmado",
    observacao:
      "Paciente idosa com mobilidade reduzida. Preferência por sala térrea e auxílio na esteira.",
  },
  {
    id: "roberto",
    hora: "09:40",
    duracao: "20 MIN",
    nome: "Roberto Siqueira",
    idade: 58,
    convenio: "BRADESCO SAÚDE",
    exame: "Instalação MAPA 24h",
    medico: "Dr. Carlos Mendes",
    status: "confirmado",
    observacao: "Paciente hipertenso. Retorno para retirada agendado para amanhã às 09:40.",
  },
];

export function HomeScheduleSimulator() {
  const [patients, setPatients] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [filter, setFilter] = useState<"todos" | "pendentes">("todos");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const visiblePatients = patients.filter((p) => {
    if (filter === "pendentes") return p.status === "aguardando";
    return true;
  });

  const handleConfirm = (id: string, nome: string) => {
    setPatients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "confirmado" } : item)),
    );
    toast.success(`Confirmação gravada para ${nome}!`, {
      description: "Status atualizado na grade clínica em tempo real.",
    });
  };

  const handleToggleNote = (id: string) => {
    setOpenNoteId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="demonstracao" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] p-6 shadow-md transition-all duration-300 sm:p-8 lg:p-12 dark:border-[#3a3528] dark:bg-[#1f1b14]">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Context & Ergonomics Value Props */}
            <div className="space-y-5 lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8E3E1E]/20 bg-[#FDF2EC] px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                <Zap className="size-3.5" />
                Ergonomia & Rapidez
              </span>

              <h2 className="font-sans text-2xl font-extrabold tracking-tight text-[#2C2018] sm:text-3xl dark:text-[#f3ede1]">
                Projetado para rodar na recepção e no consultório{" "}
                <span className="text-[#8E3E1E] dark:text-[#d97750]">sem atrito.</span>
              </h2>

              <p className="text-sm leading-relaxed text-[#6B5A4E] sm:text-base dark:text-[#baa998]">
                Nenhuma curva de aprendizado complexa. Suas secretárias aprendem em menos de 20
                minutos e os médicos têm visão clara da esteira de pacientes do dia.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3.5 rounded-2xl border border-[#E5DCBA]/70 bg-[#FBF7F0] p-4 transition-colors hover:bg-[#F3ECE0]/80 dark:border-[#3a3528] dark:bg-[#252018] dark:hover:bg-[#2a241b]">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#8E3E1E]/10 text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                      Atalhos rápidos para a recepção
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
                      Remarcação de horários em 2 cliques, sem reescrever dados cadastrais ou
                      reabrir fichas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-2xl border border-[#E5DCBA]/70 bg-[#FBF7F0] p-4 transition-colors hover:bg-[#F3ECE0]/80 dark:border-[#3a3528] dark:bg-[#252018] dark:hover:bg-[#2a241b]">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#3E6748]/10 text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                      Homologado para Convênios & Particular
                    </h4>
                    <p className="mt-0.5 text-xs text-[#6B5A4E] dark:text-[#baa998]">
                      Diferenciação visual nítida entre Amil, Bradesco, SulAmérica e Particular na
                      mesma tela.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/agenda"
                  className="btn-shimmer-effect inline-flex items-center gap-2 rounded-xl bg-[#8E3E1E] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#743116] hover:shadow-md active:scale-95 dark:bg-[#a34824] dark:hover:bg-[#8e3e1e]"
                >
                  <span>Abrir Demonstração Real</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Schedule Simulator */}
            <div className="rounded-2xl border border-[#E5DCBA] bg-[#FBF7F0] p-4 shadow-inner sm:p-6 lg:col-span-7 dark:border-[#3a3528] dark:bg-[#1a1712]">
              {/* Simulator Header with Filter Pills */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DCBA]/70 pb-3 dark:border-[#3a3528]">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4.5 text-[#8E3E1E] dark:text-[#d97750]" />
                  <span className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                    Simulação da Grade de Hoje
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFilter("todos")}
                    className={cn(
                      "rounded-full px-3 py-1 transition-all active:scale-95",
                      filter === "todos"
                        ? "bg-[#2C2018] text-white shadow-xs dark:bg-[#8E3E1E]"
                        : "bg-white text-[#6B5A4E] hover:bg-[#F3ECE0] dark:bg-[#252018] dark:text-[#baa998]",
                    )}
                  >
                    TODOS ({patients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("pendentes")}
                    className={cn(
                      "rounded-full px-3 py-1 transition-all active:scale-95",
                      filter === "pendentes"
                        ? "bg-[#B4691B] text-white shadow-xs"
                        : "bg-white text-[#6B5A4E] hover:bg-[#F3ECE0] dark:bg-[#252018] dark:text-[#baa998]",
                    )}
                  >
                    PENDENTES ({patients.filter((p) => p.status === "aguardando").length})
                  </button>
                </div>
              </div>

              {/* Rows List */}
              <div className="space-y-3">
                {visiblePatients.map((item) => {
                  const isConfirmed = item.status === "confirmado";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "relative overflow-hidden rounded-xl border bg-white p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-4 dark:bg-[#252018]",
                        isConfirmed
                          ? "border-[#3E6748]/40 border-l-4 border-l-[#3E6748]"
                          : "border-[#E5DCBA] border-l-4 border-l-[#8E3E1E] dark:border-[#3a3528]",
                      )}
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] px-2.5 py-1 text-center font-mono dark:border-[#3a3528] dark:bg-[#1a1712]">
                            <span className="block text-sm font-black text-[#2C2018] dark:text-[#f3ede1]">
                              {item.hora}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-[#6B5A4E] dark:text-[#baa998]">
                              {item.duracao}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-sans text-sm font-bold text-[#2C2018] dark:text-[#f3ede1]">
                                {item.nome}
                              </h4>
                              <span className="font-mono text-xs text-[#6B5A4E] dark:text-[#baa998]">
                                {item.idade} anos
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase",
                                  item.convenio === "PARTICULAR"
                                    ? "bg-[#FDF2EC] text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]"
                                    : "bg-[#EEF4EE] text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]",
                                )}
                              >
                                {item.convenio}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded bg-[#F3ECE0] px-1.5 py-0.5 font-mono text-[10px] text-[#6B5A4E] dark:bg-[#322c22] dark:text-[#baa998]">
                                {item.exame}
                              </span>
                              <span className="text-xs text-[#6B5A4E] dark:text-[#baa998]">
                                {item.medico}
                              </span>

                              {/* Special Accessibility Tooltip on Claudia */}
                              {item.id === "claudia" && (
                                <div className="group/tool relative inline-block">
                                  <span className="flex cursor-help items-center gap-1 font-medium text-[#8E3E1E] underline decoration-dotted dark:text-[#d97750]">
                                    <Accessibility className="size-3.5" />
                                    <span>Obs: Mobilidade Reduzida</span>
                                  </span>
                                  <div className="pointer-events-none absolute bottom-full left-0 z-40 mb-2 hidden w-64 rounded-xl border border-[#B4691B]/40 bg-white p-2.5 text-[11px] text-[#2C2018] shadow-xl group-hover/tool:block dark:bg-[#252018] dark:text-[#f3ede1]">
                                    Paciente necessita auxílio motor. Preferência por sala no
                                    pavimento térreo e esteira com apoio frontal.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4EE] px-3 py-1 font-mono text-[11px] font-bold text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]">
                              <CheckCircle2 className="size-3.5" />
                              <span>Confirmado</span>
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#FCF5E8] px-2.5 py-1 font-mono text-[11px] font-bold text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#e49b50]">
                                <Clock className="size-3" /> Aguardando WhatsApp
                              </span>
                              <button
                                type="button"
                                onClick={() => handleConfirm(item.id, item.nome)}
                                className="inline-flex items-center gap-1 rounded-full bg-[#3E6748] px-3 py-1 font-mono text-[11px] font-bold text-white shadow-xs transition-all hover:bg-[#32533a] active:scale-95 cursor-pointer"
                              >
                                <Check className="size-3" />
                                <span>Confirmar</span>
                              </button>
                            </>
                          )}

                          {item.observacao && (
                            <button
                              type="button"
                              onClick={() => handleToggleNote(item.id)}
                              className="rounded-full border border-[#E5DCBA] bg-[#FBF7F0] px-2.5 py-1 font-mono text-[11px] font-medium text-[#6B5A4E] transition-colors hover:bg-[#F3ECE0] hover:text-[#2C2018] active:scale-95 dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]"
                            >
                              {openNoteId === item.id ? "Fechar" : "Notas"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Note */}
                      {openNoteId === item.id && item.observacao && (
                        <div className="mt-3 rounded-lg border border-[#B4691B]/30 bg-[#FCF5E8] p-2.5 text-xs text-[#6B5A4E] dark:bg-[#B4691B]/15 dark:text-[#baa998]">
                          <strong className="text-[#8E3E1E] dark:text-[#d97750]">
                            Observação Clínica Gravada:
                          </strong>{" "}
                          {item.observacao}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Simulator Bottom Link */}
              <div className="mt-4 flex items-center justify-between border-t border-[#E5DCBA]/60 pt-3 text-xs text-[#6B5A4E] dark:border-[#3a3528] dark:text-[#baa998]">
                <span>Demonstração interativa conectada ao mock clínico.</span>
                <Link
                  to="/agenda"
                  className="flex items-center gap-1 font-mono font-bold text-[#8E3E1E] transition-colors hover:underline dark:text-[#d97750]"
                >
                  <span>Abrir Grade Completa</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
