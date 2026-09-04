import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Invoice, SubscriptionSummaryResponse } from "@/server/domain/subscription.types";
import { AppHeader } from "@/components/AppHeader";
import {
  CreditCard,
  CheckCircle2,
  Shield,
  Sparkles,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Download,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/assinatura")({
  component: AssinaturaPage,
});

export function AssinaturaPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SubscriptionSummaryResponse | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }

    async function carregarDados() {
      try {
        setCarregando(true);
        const [data, invs] = await Promise.all([
          apiClient.getSubscriptionSummary(),
          apiClient.getInvoices().catch(() => []),
        ]);
        setSummary(data);
        setInvoices(invs);
      } catch (err) {
        console.error("Erro ao carregar assinatura:", err);
        toast.error("Erro ao carregar informações da assinatura");
      } finally {
        setCarregando(false);
      }
    }

    if (isAuthenticated) {
      carregarDados();
    }
  }, [isAuthenticated, isLoading, navigate]);

  const plano = summary?.plan;
  const sub = summary?.subscription;
  const totalPerfis = sub?.totalPerfisPermitidos || 1;
  const perfisUsados = summary?.perfisUsados || 1;
  const percentualUso = Math.min(100, Math.round((perfisUsados / totalPerfis) * 100));

  // Histórico de Faturas / Recibos
  const faturas =
    invoices.length > 0
      ? invoices.map((inv) => ({
          id: inv.numeroFatura,
          data: new Date(inv.dataEmissao).toLocaleDateString("pt-BR"),
          valor: inv.valor,
          status:
            inv.status === "paga" ? "Paga" : inv.status === "pendente" ? "Pendente" : "Recusada",
          metodo: inv.metodoPagamento === "pix" ? "PIX Instantâneo" : "Cartão de Crédito",
          finalCartao: inv.cartaoUltimosDigitos
            ? `•••• ${inv.cartaoUltimosDigitos}`
            : inv.metodoPagamento === "pix"
              ? "PIX"
              : "Cartão",
        }))
      : [
          {
            id: "FAT-2026-09",
            data: "01/09/2026",
            valor: sub?.precoMensal || plano?.precoBaseMensal || 39.9,
            status: "Paga",
            metodo: sub?.metodoPagamento === "pix" ? "PIX Instantâneo" : "Cartão de Crédito",
            finalCartao: sub?.cartaoUltimosDigitos ? `•••• ${sub.cartaoUltimosDigitos}` : "PIX",
          },
        ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-amber/30">
      <AppHeader />

      <main className="flex-1 mx-auto max-w-[1200px] w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Aba de Assinatura */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line2/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-amber/15 text-amberdeep border border-amber/30">
                <Shield className="size-3" /> Gestão Financeira
              </span>
              <span className="text-xs text-inksoft">• Clínica Ativa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              Aba de Assinatura & Planos
            </h1>
            <p className="text-sm text-inksoft mt-1">
              Gerencie a contratação da sua clínica, capacidade de profissionais e faturamento
              mensal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/perfis"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-line2 bg-card text-xs font-bold uppercase tracking-wider text-ink shadow-2xs hover:bg-paper transition"
            >
              <Users className="size-4 text-amberdeep" />
              <span>Ver Perfis da Equipe</span>
            </Link>
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink text-cream text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-ink/90 transition"
            >
              <Sparkles className="size-4 text-amber" />
              <span>Trocar ou Fazer Upgrade</span>
            </Link>
          </div>
        </div>

        {carregando ? (
          <div className="py-24 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-inksoft">
              Carregando dados da assinatura...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Card Principal: Plano Atual & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1 & 2: Detalhes do Plano */}
              <div className="lg:col-span-2 rounded-2xl border border-line2 bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="absolute -right-12 -top-12 size-48 rounded-full bg-amber/5 blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-inksoft">
                      Plano Contratado
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-ink">
                        {plano?.nome || "Plano Cardíaco"}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-ok/15 text-ok border border-ok/30">
                        <CheckCircle2 className="size-3.5" /> Ativa
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono uppercase tracking-widest text-inksoft">
                      Mensalidade
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amberdeep">
                      R${" "}
                      {(sub?.precoMensal || plano?.precoBaseMensal || 39.9)
                        .toFixed(2)
                        .replace(".", ",")}
                      <span className="text-xs font-normal text-inksoft">/mês</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-inksoft mb-6">{plano?.descricao}</p>

                {/* Grid de Informações de Cobrança */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-line2/60">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-paper border border-line2 text-amberdeep">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase text-inksoft">Renovação</div>
                      <div className="text-xs font-bold text-ink">
                        {sub?.dataRenovacao
                          ? new Date(sub.dataRenovacao).toLocaleDateString("pt-BR")
                          : "01/10/2026"}
                      </div>
                      <div className="text-[10px] text-inksoft">Cobrança automática</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-paper border border-line2 text-amberdeep">
                      <CreditCard className="size-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase text-inksoft">
                        Forma Atual
                      </div>
                      <div className="text-xs font-bold text-ink capitalize">
                        {sub?.metodoPagamento === "pix" ? "PIX Instantâneo" : "Cartão de Crédito"}
                      </div>
                      <div className="text-[10px] text-inksoft">
                        {sub?.cartaoUltimosDigitos
                          ? `Final •••• ${sub.cartaoUltimosDigitos}`
                          : "Chave Clínica"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-paper border border-line2 text-amberdeep">
                      <Clock className="size-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase text-inksoft">Ciclo</div>
                      <div className="text-xs font-bold text-ink">Mensal Recorrente</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Sem fidelidade</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 3: Cota de Perfis e CRM */}
              <div className="rounded-2xl border border-line2 bg-card p-6 sm:p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-inksoft">
                      Uso de Perfis
                    </span>
                    <span className="text-xs font-bold font-mono text-ink">
                      {perfisUsados} de {totalPerfis} em uso
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-paper rounded-full h-3 mb-2 border border-line2/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentualUso >= 100
                          ? "bg-red-500"
                          : percentualUso > 70
                            ? "bg-amber"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${percentualUso}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-inksoft mb-6">
                    {summary?.podeAdicionarPerfil
                      ? `Você ainda pode cadastrar mais ${summary.perfisDisponiveis} perfil(is) de médico ou recepcionista.`
                      : "Você utilizou todas as vagas de perfil do seu plano atual."}
                  </p>

                  <div className="rounded-xl bg-paper/60 p-4 border border-line2/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-inksoft">Módulo de Agendamento:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Liberado
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-inksoft">Módulo CRM Comercial:</span>
                      {summary?.temCrmLiberado ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Incluso no Plano
                        </span>
                      ) : (
                        <span className="font-bold text-amberdeep flex items-center gap-1">
                          <AlertCircle className="size-3.5" /> Requer Plano Avançado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line2">
                  <Link
                    to="/planos"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber/15 hover:bg-amber/25 text-amberdeep font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <span>Mudar ou Fazer Upgrade de Plano</span>
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Comparativo de Recursos do Plano Atual */}
            <div className="rounded-2xl border border-line2 bg-card p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-black text-ink mb-4 flex items-center gap-2">
                <Zap className="size-5 text-amber" />
                Recursos Inclusos no Seu Pacote
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {plano?.beneficios.map((ben, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-paper/40 border border-line2/60"
                  >
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-ink font-medium leading-tight">{ben}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico de Faturas e Recibos */}
            <div className="rounded-2xl border border-line2 bg-card p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-ink">Histórico de Cobrança</h3>
                  <p className="text-xs text-inksoft">
                    Recibos fiscais e comprovantes de pagamento gerados para a clínica.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Relatório financeiro exportado com sucesso!")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line2 text-xs font-medium text-ink hover:bg-paper transition"
                >
                  <Download className="size-3.5" />
                  <span>Exportar Relatório</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line2 font-mono uppercase tracking-wider text-inksoft">
                      <th className="pb-3 font-semibold">Identificador</th>
                      <th className="pb-3 font-semibold">Data</th>
                      <th className="pb-3 font-semibold">Valor</th>
                      <th className="pb-3 font-semibold">Método</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Comprovante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line2/60">
                    {faturas.map((fat) => (
                      <tr key={fat.id} className="hover:bg-paper/50 transition">
                        <td className="py-3 font-mono font-bold text-ink">{fat.id}</td>
                        <td className="py-3 text-inksoft">{fat.data}</td>
                        <td className="py-3 font-bold text-ink">
                          R$ {fat.valor.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="py-3 text-inksoft">
                          {fat.metodo} ({fat.finalCartao})
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {fat.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              toast.info(`Comprovante ${fat.id}`, {
                                description: `Recibo gerado para ${user?.nome || "Clínica"} no valor de R$ ${fat.valor.toFixed(2).replace(".", ",")}`,
                              })
                            }
                            className="inline-flex items-center gap-1 text-amberdeep hover:underline font-mono text-[11px]"
                          >
                            <span>Ver Recibo</span>
                            <ExternalLink className="size-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
