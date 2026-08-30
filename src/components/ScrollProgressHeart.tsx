import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

/**
 * Barra de progresso de rolagem: linha vertical fixa na lateral esquerda
 * com um coração desenhado que desce conforme a página é rolada.
 */
export function ScrollProgressHeart() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    function update() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 left-3 top-24 z-40 hidden w-6 md:block"
    >
      {/* Linha vertical */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line2/50" />
      {/* Trilho percorrido */}
      <div
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-amber transition-[height] duration-100 ease-linear"
        style={{ height: `${progress * 100}%` }}
      />
      {/* Coração */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ top: `${progress * 100}%` }}
      >
        <span className="heartbeat flex size-6 items-center justify-center rounded-full border border-amber/50 bg-card shadow-sm">
          <Heart className="size-3.5 fill-amber/20 text-amberdeep" strokeWidth={2} />
        </span>
      </div>
      {/* Porcentagem */}
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold tabular-nums text-inksoft/60">
        {Math.round(progress * 100)}%
      </span>
    </div>
  );
}
