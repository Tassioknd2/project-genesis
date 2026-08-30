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

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
      className="flex size-9 items-center justify-center rounded-xl border border-line2/50 bg-card text-inksoft transition-all hover:border-amber/40 hover:text-amber active:scale-90"
    >
      {pronto && theme === "dark" ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
