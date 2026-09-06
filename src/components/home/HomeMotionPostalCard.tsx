import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileCheck,
  HeartPulse,
  MoreVertical,
  Pause,
  Phone,
  Play,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  Video,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step1ButtonPhase = "idle" | "tapping" | "morphing" | "spinning" | "completed";
type Step2Status = "waiting" | "switching" | "confirmed";

export function HomeMotionPostalCard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Phase states for smooth step-by-step animations
  const [buttonPhase, setButtonPhase] = useState<Step1ButtonPhase>("idle");
  const [step2Status, setStep2Status] = useState<Step2Status>("waiting");

  const timelineRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimelines = () => {
    timelineRef.current.forEach(clearTimeout);
    timelineRef.current = [];
  };

  // Automated continuous choreography
  useEffect(() => {
    clearTimelines();

    if (!isRunning) return;

    if (step === 1) {
      setButtonPhase("idle");
      setStep2Status("waiting");

      // 1. Dedo aproxima e pressiona o botão
      const t1 = setTimeout(() => {
        setButtonPhase("tapping");
      }, 1200);

      // 2. Botão faz morphing e vira bolinha circular
      const t2 = setTimeout(() => {
        setButtonPhase("morphing");
      }, 1600);

      // 3. A bolinha gira (spinner)
      const t3 = setTimeout(() => {
        setButtonPhase("spinning");
      }, 1900);

      // 4. Conclui com checkmark e mensagem de confirmação
      const t4 = setTimeout(() => {
        setButtonPhase("completed");
      }, 2700);

      // 5. Transição para o Passo 2
      const t5 = setTimeout(() => {
        setStep(2);
      }, 3800);

      timelineRef.current = [t1, t2, t3, t4, t5];
    } else if (step === 2) {
      setStep2Status("waiting");

      const t1 = setTimeout(() => {
        setStep2Status("switching");
      }, 700);

      const t2 = setTimeout(() => {
        setStep2Status("confirmed");
      }, 1000);

      const t3 = setTimeout(() => {
        setStep(3);
      }, 3800);

      timelineRef.current = [t1, t2, t3];
    } else if (step === 3) {
      const t1 = setTimeout(() => {
        setStep(1);
        setButtonPhase("idle");
        setStep2Status("waiting");
      }, 4200);

      timelineRef.current = [t1];
    }

    return () => clearTimelines();
  }, [step, isRunning]);

  // Manual interactive trigger when clicking "Confirmar Horário"
  const handleManualConfirm = () => {
    clearTimelines();
    setIsRunning(false);

    setButtonPhase("tapping");

    setTimeout(() => {
      setButtonPhase("morphing");
    }, 200);

    setTimeout(() => {
      setButtonPhase("spinning");
    }, 450);

    setTimeout(() => {
      setButtonPhase("completed");
      toast.success("Horário confirmado pelo paciente!", {
        description: "Webhook disparado para a esteira médica em 0.28s.",
      });
    }, 1200);

    setTimeout(() => {
      setStep(2);
      setStep2Status("waiting");

      setTimeout(() => {
        setStep2Status("switching");
      }, 400);

      setTimeout(() => {
        setStep2Status("confirmed");
      }, 700);

      setTimeout(() => {
        setStep(3);
      }, 2800);
    }, 2000);
  };

  const handleStepClick = (newStep: 1 | 2 | 3) => {
    clearTimelines();
    setIsRunning(false);
    setStep(newStep);

    if (newStep === 1) {
      setButtonPhase("idle");
      setStep2Status("waiting");
    } else if (newStep === 2) {
      setStep2Status("confirmed");
    }
  };

  const handleReset = () => {
    clearTimelines();
    setButtonPhase("idle");
    setStep2Status("waiting");
    setStep(1);
    setIsRunning(true);
  };

  return (
    <section id="vitrine" className="relative pb-16 sm:pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background */}
        <div className="relative">
          <div className="absolute inset-x-8 top-12 bottom-6 -z-10 rounded-3xl bg-gradient-to-r from-[#8E3E1E]/15 via-[#B4691B]/10 to-[#3E6748]/15 blur-3xl" />

          {/* Master Frame */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-2xl ring-1 ring-black/5 dark:border-[#3a3528] dark:bg-[#1f1b14]">
            {/* Top Bar with Controller */}
            <div className="flex flex-col gap-3 border-b border-[#E5DCBA] bg-[#F3ECE0]/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-[#3a3528] dark:bg-[#252018]/90">
              {/* Traffic Light Dots & Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-[#A83226]/80" />
                  <span className="size-3 rounded-full bg-[#B4691B]/80" />
                  <span className="size-3 rounded-full bg-[#3E6748]/80" />
                </div>
                <div className="hidden h-4 w-px bg-[#E5DCBA] sm:block dark:bg-[#3a3528]" />
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E6748] opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#3E6748]" />
                  </span>
                  <span className="font-sans text-xs font-bold text-[#2C2018] dark:text-[#f3ede1]">
                    Fluxo Cardiológico em Tempo Real
                  </span>
                  <span className="hidden rounded-full bg-[#8E3E1E]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#8E3E1E] sm:inline-block dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
                    3 Elementos Sincronizados
                  </span>
                </div>
              </div>

              {/* View Mode & Step Navigation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 3 Step Indicator Pills */}
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleStepClick(1)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all cursor-pointer",
                      step === 1
                        ? "border border-[#8E3E1E] bg-[#8E3E1E] text-white shadow-xs"
                        : "border border-[#E5DCBA] bg-white/70 text-[#6B5A4E] hover:border-[#8E3E1E] dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]",
                    )}
                  >
                    <HeartPulse className="size-3" />
                    <span>1. Toque</span>
                    {step === 1 && isRunning && (
                      <span className="size-1.5 animate-ping rounded-full bg-white" />
                    )}
                  </button>

                  <span className="select-none text-[#8E3E1E] opacity-60">➔</span>

                  <button
                    type="button"
                    onClick={() => handleStepClick(2)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all cursor-pointer",
                      step === 2
                        ? "border border-[#B4691B] bg-[#B4691B] text-white shadow-xs"
                        : "border border-[#E5DCBA] bg-white/70 text-[#6B5A4E] hover:border-[#B4691B] dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]",
                    )}
                  >
                    <Sparkles className="size-3" />
                    <span>2. Mudança Status</span>
                    {step === 2 && isRunning && (
                      <span className="size-1.5 animate-ping rounded-full bg-white" />
                    )}
                  </button>

                  <span className="select-none text-[#8E3E1E] opacity-60">➔</span>

                  <button
                    type="button"
                    onClick={() => handleStepClick(3)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all cursor-pointer",
                      step === 3
                        ? "border border-[#3E6748] bg-[#3E6748] text-white shadow-xs"
                        : "border border-[#E5DCBA] bg-white/70 text-[#6B5A4E] hover:border-[#3E6748] dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]",
                    )}
                  >
                    <UserCheck className="size-3" />
                    <span>3. Cartão Paciente</span>
                    {step === 3 && isRunning && (
                      <span className="size-1.5 animate-ping rounded-full bg-white" />
                    )}
                  </button>
                </div>

                <div className="h-4 w-px bg-[#E5DCBA] dark:bg-[#3a3528]" />

                {/* Play / Pause Toggle */}
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className="rounded-full border border-[#E5DCBA] bg-white p-1.5 text-[#6B5A4E] shadow-2xs transition-colors hover:text-[#8E3E1E] active:scale-95 dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]"
                  title={isRunning ? "Pausar Demonstração" : "Iniciar Demonstração Automática"}
                >
                  {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Metrics Header Strip */}
            <div className="grid grid-cols-1 divide-y border-b border-[#E5DCBA] bg-[#FBF7F0]/90 text-xs text-[#6B5A4E] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:border-[#3a3528] dark:bg-[#1a1712]/90 dark:divide-[#3a3528] dark:text-[#baa998]">
              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#3E6748]/10 text-[#3E6748] dark:bg-[#3E6748]/20">
                  <Zap className="size-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="block font-mono text-[10px] font-bold uppercase text-[#3E6748] dark:text-[#67a074]">
                    Sincronização 0.28s
                  </span>
                  <span className="font-sans text-[11px] font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                    API Oficial WhatsApp Business
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#B4691B]/10 text-[#B4691B] dark:bg-[#B4691B]/20">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="block font-mono text-[10px] font-bold uppercase text-[#B4691B] dark:text-[#d48c3b]">
                    94.8% Assiduidade
                  </span>
                  <span className="font-sans text-[11px] font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                    Zero No-Show Acumulado
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#8E3E1E]/10 text-[#8E3E1E] dark:bg-[#8E3E1E]/20">
                  <ShieldCheck className="size-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="block font-mono text-[10px] font-bold uppercase text-[#8E3E1E] dark:text-[#d97750]">
                    Conformidade Médica
                  </span>
                  <span className="font-sans text-[11px] font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                    Padrão CFM & Prontuário Digital
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Step Progress Bar */}
            <div className="h-1 w-full bg-[#E5DCBA]/40 dark:bg-[#3a3528]">
              <div
                className="h-full bg-gradient-to-r from-[#8E3E1E] via-[#B4691B] to-[#3E6748] transition-all duration-500 ease-out"
                style={{ width: step === 1 ? "33.3%" : step === 2 ? "66.6%" : "100%" }}
              />
            </div>

            {/* Stage Canvas */}
            <div className="relative overflow-hidden bg-[#F7F2E9] p-4 sm:p-6 lg:p-8 dark:bg-[#19150f]">
              {/* Subtle Tech Grid Pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(#dbc1b8_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-15" />

              {/* Vitrine Interativa - Modo Foco */}
              <div className="relative z-10 flex items-center justify-center">
                {step === 1 && (
                  <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-2xl border border-[#E5DCBA] bg-[#ECE5DD] shadow-2xl dark:border-[#3a3528] dark:bg-[#1f1b14]">
                    {/* WhatsApp Header */}
                    <div className="flex items-center justify-between bg-[#075E54] px-4 py-3 text-white shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/20 font-bold text-white shadow-inner">
                          <HeartPulse className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[15px] font-bold leading-none text-white">
                              AgendaCardio - Sua Clínica
                            </span>
                            <span className="flex size-3.5 items-center justify-center rounded-full bg-[#25D366] text-white">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-white/80">
                            Canal Oficial Verificado CFM
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <Video className="size-5 cursor-pointer hover:text-white" />
                        <Phone className="size-5 cursor-pointer hover:text-white" />
                        <MoreVertical className="size-5 cursor-pointer hover:text-white" />
                      </div>
                    </div>

                    {/* Chat Content */}
                    <div className="relative flex flex-col justify-center space-y-3 bg-[radial-gradient(#c8bfae_1px,transparent_1px)] [background-size:16px_16px] p-4 sm:p-6 dark:bg-[radial-gradient(#3a3528_1px,transparent_1px)]">
                      <div className="self-center rounded-full bg-white/85 px-3 py-1 font-mono text-[11px] uppercase text-[#6B5A4E] shadow-xs backdrop-blur-xs dark:bg-[#252018]/90 dark:text-[#baa998]">
                        Hoje • Lembrete Inteligente
                      </div>

                      {/* Message Bubble */}
                      <div className="relative max-w-lg space-y-3 rounded-2xl rounded-tl-xs border border-[#d2dcd5] bg-white p-4 shadow-lg sm:p-5 dark:border-[#3a3528] dark:bg-[#252018]">
                        <div className="flex items-center justify-between border-b border-[#E5DCBA]/40 pb-2.5 dark:border-[#3a3528]">
                          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-[#8E3E1E] dark:text-[#d97750]">
                            <span className="size-2 animate-pulse rounded-full bg-[#8E3E1E]" />
                            Confirmação de Exame Cardiológico
                          </span>
                          <span className="font-mono text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                            08:00
                          </span>
                        </div>

                        <p className="text-[14px] leading-relaxed text-[#2C2018] dark:text-[#f3ede1]">
                          Olá, <strong>Sr. Fernando Alcântara</strong>! Seu{" "}
                          <strong className="text-[#8E3E1E] dark:text-[#d97750]">
                            Ecocardiograma Transtorácico
                          </strong>{" "}
                          está agendado para amanhã:
                        </p>

                        <div className="space-y-1.5 rounded-xl border border-[#E5DCBA]/80 bg-[#FBF7F0] p-3 text-xs text-[#6B5A4E] dark:border-[#3a3528] dark:bg-[#1a1712] dark:text-[#baa998]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                              Horário do Exame:
                            </span>
                            <span className="font-mono text-sm font-bold text-[#8E3E1E] dark:text-[#d97750]">
                              08:00 (Duração 45 min)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                              Especialista:
                            </span>
                            <span>Dr. Carlos Mendes (CRM 14920)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2C2018] dark:text-[#f3ede1]">
                              Preparo:
                            </span>
                            <span className="font-semibold text-[#3E6748] dark:text-[#67a074]">
                              Trazer exames anteriores • Jejum leve 2h
                            </span>
                          </div>
                        </div>

                        <p className="text-[13px] text-[#6B5A4E] dark:text-[#baa998]">
                          Por favor, confirme seu comparecimento clicando no botão abaixo:
                        </p>

                        {/* Dynamic Morphing Action Button */}
                        <div className="relative pt-2">
                          {(buttonPhase === "idle" || buttonPhase === "tapping") && (
                            <div
                              className={cn(
                                "pointer-events-none absolute z-40 flex items-center gap-1.5 rounded-full border border-white/20 bg-[#2C2018]/95 px-3 py-1.5 text-white shadow-2xl transition-all duration-500 ease-out",
                                buttonPhase === "tapping"
                                  ? "top-3 left-1/4 scale-90"
                                  : "top-8 left-1/3 anim-tap-finger",
                              )}
                            >
                              <span className="text-[16px] animate-bounce">👆</span>
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                                Toque do Paciente
                              </span>
                            </div>
                          )}

                          <div className="flex min-h-[58px] items-center justify-center">
                            {(buttonPhase === "idle" || buttonPhase === "tapping") && (
                              <button
                                type="button"
                                onClick={handleManualConfirm}
                                className={cn(
                                  "relative flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 font-sans text-[14px] font-bold text-white shadow-lg transition-all duration-300 cursor-pointer active:scale-95",
                                  buttonPhase === "tapping"
                                    ? "bg-[#1eb956] scale-[0.96] ring-4 ring-[#25D366]/50"
                                    : "bg-[#25D366] hover:bg-[#1eb956] ring-2 ring-[#25D366]/40",
                                )}
                              >
                                <CheckCircle2 className="size-5" />
                                <span className="tracking-wide">Confirmar Horário</span>
                                <span className="ml-1.5 rounded-full bg-white/25 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                                  1 Toque
                                </span>
                              </button>
                            )}

                            {(buttonPhase === "morphing" ||
                              buttonPhase === "spinning" ||
                              buttonPhase === "completed") && (
                              <div className="flex flex-col items-center justify-center space-y-2 py-1 animate-in zoom-in-75 duration-300">
                                <div
                                  className={cn(
                                    "relative flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-500 ease-out",
                                    buttonPhase === "completed"
                                      ? "bg-[#128C7E] scale-110 ring-4 ring-[#128C7E]/40"
                                      : "bg-[#25D366] ring-4 ring-[#25D366]/40",
                                  )}
                                >
                                  {buttonPhase === "spinning" && (
                                    <div className="size-7 rounded-full border-3 border-white border-t-transparent animate-spin" />
                                  )}
                                  {buttonPhase === "completed" && (
                                    <div className="flex items-center justify-center animate-in zoom-in-50 duration-300">
                                      <Check className="size-7 text-white stroke-[3.5]" />
                                    </div>
                                  )}
                                </div>

                                {buttonPhase === "completed" && (
                                  <div className="flex items-center gap-1.5 rounded-full bg-[#128C7E] px-4 py-1.5 text-xs font-bold text-white shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                                    <CheckCircle2 className="size-4" />
                                    <span>Horário Agendado e Confirmado!</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 pt-1 font-mono text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                          <span>08:01</span>
                          <CheckCheck className="size-4 text-[#34B7F1]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-2xl dark:border-[#3a3528] dark:bg-[#252018]">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#E5DCBA] bg-[#FBF7F0] px-4 py-3.5 sm:px-6 dark:border-[#3a3528] dark:bg-[#1f1b14]">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#8E3E1E] text-white shadow-xs">
                          <HeartPulse className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[14px] font-bold text-[#2C2018] dark:text-[#f3ede1]">
                              Painel da Recepção • Esteira do Dia
                            </span>
                            <span className="rounded-full bg-[#F3ECE0] px-2 py-0.5 font-mono text-[10px] font-bold text-[#6B5A4E] dark:bg-[#322c22] dark:text-[#baa998]">
                              SALA ECO 01
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                            Hoje • Monitoramento de Presença ao Vivo
                          </span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-bold shadow-xs transition-all duration-300",
                          step2Status === "confirmed"
                            ? "border-[#3E6748]/40 bg-[#EEF4EE] text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]"
                            : "border-[#B4691B]/40 bg-[#FCF5E8] text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#e49b50]",
                        )}
                      >
                        <span className="relative flex size-2">
                          <span
                            className={cn(
                              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                              step2Status === "confirmed" ? "bg-[#3E6748]" : "bg-[#B4691B]",
                            )}
                          />
                          <span
                            className={cn(
                              "relative inline-flex size-2 rounded-full",
                              step2Status === "confirmed" ? "bg-[#3E6748]" : "bg-[#B4691B]",
                            )}
                          />
                        </span>
                        <span>
                          {step2Status === "confirmed"
                            ? "Webhook recebido (0.28s)"
                            : "Ouvindo Webhook..."}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-4 bg-[#FCFAF6] p-4 sm:p-6 dark:bg-[#1a1712]">
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-500 sm:p-5 dark:bg-[#252018]",
                          step2Status === "confirmed"
                            ? "border-[#3E6748]/50 border-l-8 border-l-[#3E6748] bg-white ring-2 ring-[#3E6748]/20"
                            : "border-[#B4691B]/50 border-l-8 border-l-[#B4691B] bg-[#FFFDF9] ring-2 ring-[#B4691B]/20",
                        )}
                      >
                        <div className="flex flex-col justify-between gap-3 border-b border-[#E5DCBA]/50 pb-3 sm:flex-row sm:items-center dark:border-[#3a3528]">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] px-3 py-1.5 text-center font-mono dark:border-[#3a3528] dark:bg-[#1f1b14]">
                              <span className="block text-lg font-black text-[#2C2018] dark:text-[#f3ede1]">
                                08:00
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#8E3E1E] dark:text-[#d97750]">
                                45 MIN
                              </span>
                            </div>
                            <div>
                              <h4 className="font-sans text-[17px] font-bold text-[#2C2018] dark:text-[#f3ede1]">
                                Fernando Alcântara
                              </h4>
                              <p className="text-xs text-[#6B5A4E] dark:text-[#baa998]">
                                Ecocardiograma Transtorácico • Dr. Carlos Mendes
                              </p>
                            </div>
                          </div>

                          <div>
                            {step2Status === "waiting" ? (
                              <div className="inline-flex items-center gap-2 rounded-full border border-[#B4691B]/40 bg-[#FCF5E8] px-3.5 py-1.5 font-mono text-[11px] font-bold text-[#B4691B]">
                                <Clock className="size-4 animate-spin text-[#B4691B]" />
                                <span>Aguardando confirmação do paciente...</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 rounded-full bg-[#3E6748] px-4 py-1.5 font-mono text-[12px] font-bold text-white shadow-md">
                                <CheckCircle2 className="size-4 text-white" />
                                <span>Confirmado pelo Paciente via WhatsApp (08:01)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-[#6B5A4E] dark:text-[#baa998]">
                          <span className="flex items-center gap-1.5">
                            <Zap className="size-4 text-[#3E6748]" />
                            <span>Webhook validado • Vaga confirmada na sala</span>
                          </span>
                          <span className="font-mono font-bold text-[#3E6748]">
                            Presença Assegurada
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-2xl dark:border-[#3a3528] dark:bg-[#252018]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DCBA] bg-[#FBF7F0] px-4 py-3.5 sm:px-6 dark:border-[#3a3528] dark:bg-[#1f1b14]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-[#3E6748] text-white shadow-xs">
                          <FileCheck className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-sans text-[15px] font-bold text-[#2C2018] dark:text-[#f3ede1]">
                            Ficha Clínica & Cartão do Paciente
                          </h3>
                          <span className="font-mono text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                            Prontuário Digital #CARD-8492
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-[#3E6748]/40 bg-[#EEF4EE] px-3.5 py-1.5 font-mono text-[11px] font-bold text-[#3E6748]">
                        <span className="size-2 rounded-full bg-[#3E6748] animate-pulse" />
                        <span>STATUS: CONFIRMADO VIA WHATSAPP (08:01)</span>
                      </div>
                    </div>

                    <div className="space-y-4 bg-[#FCFAF6] p-4 sm:p-6 dark:bg-[#1a1712]">
                      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5DCBA] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-[#3a3528] dark:bg-[#252018]">
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8E3E1E] to-[#B4691B] font-mono text-xl font-bold text-white shadow-md">
                            FA
                          </div>
                          <div>
                            <h4 className="font-sans text-lg font-bold text-[#2C2018] dark:text-[#f3ede1]">
                              Fernando Alcântara
                            </h4>
                            <p className="font-mono text-xs text-[#6B5A4E] dark:text-[#baa998]">
                              64 anos • Ecocardiograma Transtorácico às 08:00
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-xl border border-[#E5DCBA] bg-[#FBF7F0] px-3 py-1.5 font-mono text-xs font-semibold text-[#6B5A4E]"
                          >
                            <Printer className="size-3.5" />
                            <span>Ficha de Sala</span>
                          </button>
                          <Link
                            to="/agenda"
                            className="flex items-center gap-1.5 rounded-xl bg-[#8E3E1E] px-3.5 py-1.5 font-mono text-xs font-bold text-white shadow-xs"
                          >
                            <Stethoscope className="size-3.5" />
                            <span>Atender</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Audit & Action Bar */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5DCBA] bg-[#FFFFFF] px-4 py-3.5 text-xs text-[#6B5A4E] sm:flex-row sm:px-8 dark:border-[#3a3528] dark:bg-[#1f1b14] dark:text-[#baa998]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#3E6748]" />
                <span className="font-medium text-[#2C2018] dark:text-[#f3ede1]">
                  Encaixe perfeito dos 3 elementos: O Toque do Paciente aciona o Webhook da Recepção
                  que atualiza o Prontuário instantaneamente.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 font-mono font-bold text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1] cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reiniciar Fluxo</span>
                </button>
                <Link
                  to="/agenda"
                  className="group flex items-center gap-1 font-mono font-bold text-[#8E3E1E] hover:underline dark:text-[#d97750]"
                >
                  <span>Abrir Grade Real</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
