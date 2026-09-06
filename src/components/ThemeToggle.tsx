import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [pronto, setPronto] = useState(false);
  const temaRef = useRef<Theme>("light");

  // Lê a preferência salva (ou do sistema) depois da hidratação.
  useEffect(() => {
    const salvo = localStorage.getItem("agenda-theme") as Theme | null;
    const inicial: Theme =
      salvo === "dark" || salvo === "light"
        ? salvo
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    temaRef.current = inicial;
    setTheme(inicial);
    setPronto(true);

    // A hidratação do React pode limpar atributos do <html>; reaplica o tema
    // atual (não o inicial) por alguns frames após a montagem.
    const timers = [0, 50, 200].map((ms) =>
      window.setTimeout(() => applyTheme(temaRef.current), ms),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  // Fonte única de verdade: sempre que o tema muda, aplica no documento.
  useEffect(() => {
    temaRef.current = theme;
    applyTheme(theme);
  }, [theme]);

  function alternar() {
    const proximo: Theme = theme === "dark" ? "light" : "dark";
    temaRef.current = proximo;
    setTheme(proximo);
    applyTheme(proximo);
    localStorage.setItem("agenda-theme", proximo);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className="group relative flex h-8 w-16 items-center rounded-full border border-line2 bg-paper p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-amber/40 hover:bg-card active:scale-95 dark:border-line2 dark:bg-card dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.25)] dark:hover:border-amber/50 dark:hover:bg-popover"
    >
      {/* Rótulos sutis do trilho */}
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-inksoft/30 select-none">
        L
      </span>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold text-inksoft/30 select-none">
        D
      </span>

      {/* Botão deslizante */}
      <span
        className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-line2 bg-cream text-amberdeep shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out group-hover:scale-105 dark:border-line dark:bg-ink dark:text-amber dark:shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
        style={{ transform: isDark ? "translateX(1.5rem)" : "translateX(0)" }}
      >
        {pronto && isDark ? (
          <Moon className="size-3.5" aria-hidden />
        ) : (
          <Sun className="size-3.5" aria-hidden />
        )}
      </span>

      {/* Halo sutil no hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-transparent transition-all duration-300 group-hover:border-amber/10" />
    </button>
  );
}
