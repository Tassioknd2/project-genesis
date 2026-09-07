import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Lock,
  Menu,
  MessageCircle,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export interface HomeHeaderProps {
  onOpenDemo?: () => void;
  onOpenContact?: () => void;
}

export function HomeHeader({ onOpenContact }: HomeHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recursosOpen, setRecursosOpen] = useState(false);

  return (
    <header
      id="home-main-header"
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none transition-transform duration-300"
    >
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Navegação Principal"
          className="pointer-events-auto flex items-center justify-between gap-4 rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF]/90 px-4 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-[#FFFFFF]/95 hover:shadow-md dark:border-[#3a3528] dark:bg-[#1f1b14]/90 dark:hover:bg-[#1f1b14]/95 sm:px-5"
        >
          {/* Logo & Marca Oficial */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/"
              className="flex items-center group transition-transform duration-200 hover:scale-[1.02]"
              title="AgendaCardio PRO - Cardiologia & Diagnóstico"
            >
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1WSB58ZRsIdvurQE-aa7TCY80ztZrq6IibfHZ9R8pmqbSTndk7ix7aKgANe4FPzK2P_FBAQvItY5KVJ_etMqr6I9RPsJlINGCRor1GZqnQWFyPjR-SCWaI4ymo5h7isL3FMs1dgqexq4UP7SWv4zT0MOEySu2l-Rm9HhXxbxF_aKLoC-jHeIUTzPYQdZxfOb8HLWJiHiZyY0r_HBHeh4WzkELoekl4x6ZlXwtht_6dWPQDsAF-bgGC2rQ"
                alt="AgendaCardio PRO - Cardiologia & Diagnóstico"
                className="h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>

          {/* Magnetic Underline Animated Navigation Links */}
          <div className="hidden items-center gap-6 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setRecursosOpen(true)}
              onMouseLeave={() => setRecursosOpen(false)}
            >
              <button
                type="button"
                className="group relative flex items-center gap-1 py-1 font-medium text-[13px] text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
              >
                <span>Recursos</span>
                <ChevronDown className="size-3.5 text-[#968374] transition-transform duration-200 group-hover:rotate-180" />
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#8E3E1E] transition-all duration-300 ease-out group-hover:w-full" />
              </button>

              {recursosOpen && (
                <div className="absolute top-full -left-4 z-50 mt-1 w-64 rounded-xl border border-[#E5DCBA] bg-[#FFFFFF] p-2.5 shadow-lg backdrop-blur-md dark:border-[#3a3528] dark:bg-[#252018]">
                  <a
                    href="#whatsapp"
                    className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#F3ECE0] dark:hover:bg-[#322c22]"
                  >
                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-[#3E6748]" />
                    <div>
                      <p className="text-xs font-bold text-[#2C2018] dark:text-[#f3ede1]">
                        Confirmação WhatsApp
                      </p>
                      <p className="text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                        Disparos automáticos humanizados
                      </p>
                    </div>
                  </a>
                  <a
                    href="#exames"
                    className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#F3ECE0] dark:hover:bg-[#322c22]"
                  >
                    <Zap className="mt-0.5 size-4 shrink-0 text-[#8E3E1E]" />
                    <div>
                      <p className="text-xs font-bold text-[#2C2018] dark:text-[#f3ede1]">
                        Fluxo por Exame
                      </p>
                      <p className="text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                        ECO, Holter, MAPA e Ergometria
                      </p>
                    </div>
                  </a>
                  <a
                    href="#seguranca"
                    className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#F3ECE0] dark:hover:bg-[#322c22]"
                  >
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#3E6748]" />
                    <div>
                      <p className="text-xs font-bold text-[#2C2018] dark:text-[#f3ede1]">
                        Conformidade CFM & LGPD
                      </p>
                      <p className="text-[11px] text-[#6B5A4E] dark:text-[#baa998]">
                        Segurança de dados e sigilo médico
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a
              href="#exames"
              className="group relative py-1 font-medium text-[13px] text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
            >
              <span>Exames</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#8E3E1E] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
            <a
              href="#whatsapp"
              className="group relative py-1 font-medium text-[13px] text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
            >
              <span>WhatsApp</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#8E3E1E] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
            <a
              href="#planos"
              className="group relative py-1 font-medium text-[13px] text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
            >
              <span>Planos</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#8E3E1E] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
            <a
              href="#seguranca"
              className="group relative py-1 font-medium text-[13px] text-[#6B5A4E] transition-colors hover:text-[#2C2018] dark:text-[#baa998] dark:hover:text-[#f3ede1]"
            >
              <span>Segurança</span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#8E3E1E] transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          </div>

          {/* Action Group with Micro-interactions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              to="/auth"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#E5DCBA] bg-[#FFFFFF] px-3.5 py-1.5 text-[13px] font-semibold text-[#6B5A4E] shadow-xs transition-all duration-200 hover:scale-[1.02] hover:border-[#8E3E1E]/40 hover:bg-[#F3ECE0] hover:text-[#2C2018] hover:shadow-sm active:scale-95 dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#baa998] dark:hover:bg-[#322c22] dark:hover:text-[#f3ede1]"
            >
              <Lock className="size-3.5 text-[#968374] transition-colors duration-200 group-hover:text-[#8E3E1E]" />
              <span>Entrar</span>
            </Link>

            <div className="hidden h-4 w-px bg-[#E5DCBA] dark:bg-[#3a3528] sm:block" />

            <button
              type="button"
              onClick={onOpenContact}
              className="group hidden items-center gap-1.5 rounded-full bg-[#F3ECE0] px-3 py-1.5 text-[13px] font-semibold text-[#6B5A4E] transition-all duration-200 hover:scale-[1.02] hover:bg-[#ede8dc] hover:text-[#2C2018] active:scale-95 dark:bg-[#2e281e] dark:text-[#baa998] dark:hover:bg-[#3a3327] dark:hover:text-[#f3ede1] sm:inline-flex"
            >
              <MessageCircle className="size-4 text-[#3E6748] transition-transform duration-200 group-hover:scale-110" />
              <span>Contatar</span>
            </button>

            <Link
              to="/agenda"
              className="btn-shimmer-effect group inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2C2018] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#8E3E1E] hover:shadow-lg active:scale-95 dark:bg-[#8E3E1E] dark:hover:bg-[#a34824] sm:px-5"
            >
              <span>Experimentar Grátis</span>
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Toggle Menu Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-9 items-center justify-center rounded-xl border border-[#E5DCBA] text-[#2C2018] lg:hidden dark:border-[#3a3528] dark:text-[#f3ede1]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Menu Retrátil Mobile */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto mt-2 flex flex-col gap-2 rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] p-4 shadow-xl backdrop-blur-lg lg:hidden dark:border-[#3a3528] dark:bg-[#1f1b14]">
            <a
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#2C2018] dark:text-[#f3ede1]"
            >
              Recursos
            </a>
            <a
              href="#exames"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#2C2018] dark:text-[#f3ede1]"
            >
              Exames
            </a>
            <a
              href="#whatsapp"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#2C2018] dark:text-[#f3ede1]"
            >
              WhatsApp
            </a>
            <a
              href="#planos"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#2C2018] dark:text-[#f3ede1]"
            >
              Planos & Preços
            </a>
            <a
              href="#seguranca"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#2C2018] dark:text-[#f3ede1]"
            >
              Segurança CFM & LGPD
            </a>

            <div className="mt-2 flex flex-col gap-2 border-t border-[#E5DCBA] pt-3 dark:border-[#3a3528]">
              <Link
                to="/agenda"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#8E3E1E] py-2.5 font-mono text-xs font-bold uppercase text-white shadow-sm"
              >
                <Calendar className="size-4" />
                <span>Acessar Agenda PRO</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact?.();
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E5DCBA] py-2 text-xs font-semibold text-[#2C2018] dark:border-[#3a3528] dark:text-[#f3ede1]"
              >
                <MessageCircle className="size-4 text-[#3E6748]" />
                <span>Falar no WhatsApp com Consultor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
