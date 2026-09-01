import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotaoCanetaProps {
  onClick: () => void;
  rotulo?: string;
  className?: string;
}

/** Botão discreto (só o ícone de caneta); o rótulo aparece no hover. */
export function BotaoCaneta({ onClick, rotulo = "Editar", className }: BotaoCanetaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
className={cn(
        "group/pen flex h-7 items-center rounded-full border border-line bg-card/80 px-1.5 text-[10px] font-bold uppercase tracking-wider text-inksoft/70 transition-all hover:border-amber/50 hover:text-amberdeep active:scale-90",
        className,
      )}
    >
      <Pencil className="size-3.5 shrink-0" aria-hidden />
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/pen:ml-1.5 group-hover/pen:max-w-[5rem] group-hover/pen:opacity-100">
        {rotulo}
      </span>
    </button>
  );
}
