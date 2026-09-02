import { useRef, useCallback, useEffect } from "react";

/**
 * Hook para permitir arrastar e rolar horizontalmente com o mouse (click & drag)
 * e com o toque, evitando disparar cliques acidentais nos botões internos durante o arrasto.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    isDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!isDownRef.current) return;
    const el = ref.current;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }

    el.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const handleMouseUpOrLeave = useCallback(() => {
    isDownRef.current = false;
  }, []);

  // Previne o clique nos filhos caso o usuário tenha arrastado
  const handleClickCapture = useCallback((e: React.MouseEvent<T>) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      // Reseta no próximo tick para evitar clique residual
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 50);
    }
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDownRef.current = false;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Se não houver scroll vertical e houver horizontal ou shift, rola horizontalmente
      if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
        return;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return {
    ref,
    dragProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUpOrLeave,
      onMouseLeave: handleMouseUpOrLeave,
      onClickCapture: handleClickCapture,
      style: {
        cursor: "grab",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      },
    },
  };
}
