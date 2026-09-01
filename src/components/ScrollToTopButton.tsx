import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopButtonProps {
  /** Distância em pixels a partir da qual o botão deve aparecer (padrão: 140px após sair do cabeçalho) */
  threshold?: number;
  className?: string;
}

export function ScrollToTopButton({ threshold = 140, className }: ScrollToTopButtonProps) {
  const [visivel, setVisivel] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let rafId = 0;

    function handleScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollY = window.scrollY || doc.scrollTop;
        const scrollable = doc.scrollHeight - window.innerHeight;

        setVisivel(scrollY > threshold);

        if (scrollable > 0) {
          const p = Math.min(100, Math.max(0, (scrollY / scrollable) * 100));
          setProgresso(Math.round(p));
        } else {
          setProgresso(0);
        }
      });
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [threshold]);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 transition-all duration-300 ease-out",
        visivel
          ? "pointer-events-auto translate-y-0 opacity-100 scale-100"
          : "pointer-events-none translate-y-4 opacity-0 scale-90",
        className,
      )}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Voltar ao topo da página"
        title="Voltar ao topo"
        className="group relative flex size-12 items-center justify-center rounded-2xl border border-line2/80 bg-card/95 text-ink shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-amber/60 hover:bg-ink hover:text-cream hover:shadow-xl active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      >
        {/* Anel sutil de progresso circular SVG */}
        <svg
          className="absolute inset-0 size-full -rotate-90 p-1"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          <circle cx="22" cy="22" r="19" className="stroke-line2/40 fill-none" strokeWidth="2" />
          <circle
            cx="22"
            cy="22"
            r="19"
            className="stroke-amber transition-[stroke-dashoffset] duration-150 ease-out fill-none group-hover:stroke-amber"
            strokeWidth="2.5"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (119.38 * progresso) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* Ícone de Seta para cima */}
        <ArrowUp className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-amber" />

        {/* Tooltip elegante que surge no hover */}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 font-mono text-[10px] font-bold text-cream opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100 dark:bg-card dark:border dark:border-line2">
          Topo
        </span>
      </button>
    </div>
  );
}
