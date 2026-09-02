import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Barra de progresso e controle interativo de rolagem:
 * Linha vertical na lateral esquerda com coração pulsante que desce com a rolagem
 * e permite clicar/arrastar (touch/mouse drag) para rolar a página diretamente.
 */
export function ScrollProgressHeart() {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // Sincroniza o progresso com a rolagem natural da página quando não estiver arrastando
  useEffect(() => {
    let raf = 0;
    function update() {
      if (isDraggingRef.current) return;
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

  // Calcula e aplica a rolagem a partir da coordenada Y do ponteiro
  const handleScrollToY = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    if (rect.height <= 0) return;

    // Calcula a fração (0 a 1) relativa ao trilho
    const relativeY = clientY - rect.top;
    const ratio = Math.min(1, Math.max(0, relativeY / rect.height));

    setProgress(ratio);

    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable > 0) {
      window.scrollTo({
        top: ratio * scrollable,
        behavior: "instant" as ScrollBehavior,
      });
    }
  }, []);

  // Inicia o arrasto (touch ou mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback seguro caso o navegador não suporte pointer capture
    }

    handleScrollToY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    handleScrollToY(e.clientY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignora erro de release
    }
  };

  // Suporte a teclado para acessibilidade
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;

    let delta = 0;
    if (e.key === "ArrowUp") delta = -60;
    else if (e.key === "ArrowDown") delta = 60;
    else if (e.key === "PageUp") delta = -window.innerHeight * 0.8;
    else if (e.key === "PageDown") delta = window.innerHeight * 0.8;
    else if (e.key === "Home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else if (e.key === "End") {
      window.scrollTo({ top: scrollable, behavior: "smooth" });
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      window.scrollBy({ top: delta, behavior: "smooth" });
    }
  };

  return (
    <div
      id="scroll-progress-heart-container"
      role="scrollbar"
      tabIndex={0}
      aria-label="Controle de rolagem interativo com indicador de coração"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      className={cn(
        "fixed bottom-20 left-0.5 top-16 z-40 block w-9 touch-none select-none md:bottom-6 md:left-2 md:top-24 md:w-10",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {/* Trilho base */}
      <div ref={trackRef} className="relative mx-auto h-full w-2">
        {/* Linha vertical de fundo */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line2/60 transition-colors group-hover:bg-line2" />

        {/* Trilho percorrido com preenchimento em tom âmbar */}
        <div
          className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-amber"
          style={{ height: `${progress * 100}%` }}
        />

        {/* Indicador do Coração Arrastável */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ top: `${progress * 100}%` }}
        >
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full border border-amber/60 bg-card shadow-md transition-all duration-150 md:size-7",
              isDragging
                ? "scale-125 border-amberdeep bg-amber/20 ring-4 ring-amber/30 shadow-lg"
                : "heartbeat hover:scale-110 active:scale-125",
            )}
            title="Arraste para rolar a tela"
          >
            <Heart
              className={cn(
                "size-3.5 fill-amber/25 text-amberdeep transition-colors md:size-4",
                isDragging && "fill-amberdeep text-amberdeep",
              )}
              strokeWidth={2.2}
            />
          </span>
        </div>

        {/* Porcentagem */}
        <span
          className={cn(
            "absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold tabular-nums transition-colors md:-bottom-7 md:text-[9px]",
            isDragging ? "text-amberdeep" : "text-inksoft/70",
          )}
        >
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}
