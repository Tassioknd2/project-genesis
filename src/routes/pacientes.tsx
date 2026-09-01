import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { BotaoCaneta } from "@/components/BotaoCaneta";
import { EditarRegistroDialog } from "@/components/EditarRegistroDialog";
import { pacientes, type Patient } from "@/lib/agenda-data";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Agenda Cardio — Pacientes" },
      {
        name: "description",
        content:
          "Cadastro e pesquisa de pacientes da clínica: histórico básico, última visita e observações.",
      },
      { property: "og:title", content: "Agenda Cardio — Pacientes" },
      {
        property: "og:description",
        content: "Cadastro e pesquisa de pacientes da clínica de cardiologia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PacientesPage,
});

function PacientesPage() {
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Patient | null>(null);
  const [versao, setVersao] = useState(0);

  const visiveis = useMemo(() => {
    if (!busca) return pacientes;
    const q = busca.toLowerCase();
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.telefone.includes(q) ||
        p.convenio.toLowerCase().includes(q),
    );
  }, [busca, versao]);

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-amber/20">
      <AppHeader />

      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8">
        <div className="card-rise mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tighter">Pacientes</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-inksoft">
              {pacientes.length} cadastrados · dados mínimos
            </p>
          </div>
          <div className="relative flex-1 md:ml-auto md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm italic text-inksoft/40">
              buscar_
            </span>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, telefone ou convênio..."
              className="h-12 w-full rounded-2xl border border-line2 bg-card pl-16 pr-6 text-sm font-medium shadow-sm transition-all placeholder:text-inksoft/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
            />
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-2" aria-label="Lista de pacientes">
          {visiveis.map((p, i) => (
            <article
              key={p.id}
              className="card-rise rounded-2xl border border-line2/50 bg-card p-5 transition-all hover:border-amber/30 hover:shadow-md"
              style={{ animationDelay: `${150 + i * 40}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight">{p.nome}</h3>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-inksoft">
                    {p.idade} anos · {p.telefone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BotaoCaneta onClick={() => setEditando(p)} rotulo="Caneta" />
                  <span
                  className={
                    p.convenio === "Particular"
                      ? "rounded-full border border-amber/20 bg-amber/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amberdeep"
                      : "rounded-full border border-ink/5 bg-mutbg px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-inksoft"
                  }
                >
                  {p.convenio}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-inksoft">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Última visita
                </span>
                <span className="size-1 rounded-full bg-line2" />
                <span>{p.ultimaVisita ?? "—"}</span>
              </div>
              {p.observacoes && (
                <p className="mt-2 rounded-lg border border-line bg-line/20 px-3 py-2 text-xs text-inksoft">
                  {p.observacoes}
                </p>
              )}
            </article>
          ))}
          {visiveis.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-line2 bg-card p-12 text-center">
              <p className="text-sm font-semibold text-inksoft">
                Nenhum paciente encontrado.
              </p>
            </div>
          )}
        </section>

        {editando && (
          <EditarRegistroDialog
            open={!!editando}
            onOpenChange={(aberto) => !aberto && setEditando(null)}
            paciente={editando}
            onSalvar={(resultado) => {
              const i = pacientes.findIndex((x) => x.id === resultado.paciente.id);
              if (i >= 0) pacientes[i] = resultado.paciente;
              setVersao((v) => v + 1);
              toast.success("Cadastro atualizado");
            }}
          />
        )}

        <footer className="mt-12 border-t border-line2/30 py-8 text-center opacity-60">
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest hover:text-amber"
          >
            ← Voltar à agenda do dia
          </Link>
        </footer>
      </main>
    </div>
  );
}
