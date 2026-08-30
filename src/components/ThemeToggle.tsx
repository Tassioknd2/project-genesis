import { useEffect, useState } from "react";
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

  useEffect(() => {
    const salvo = localStorage.getItem("agenda-theme") as Theme | null;
    const inicial: Theme =
      salvo ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(inicial);
    applyTheme(inicial);
    setPronto(true);
  }, []);

  function alternar() {
    const proximo: Theme = theme === "dark" ? "light" : "dark";
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
