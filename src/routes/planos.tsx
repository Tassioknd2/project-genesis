import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { PlanDefinition, SubscriptionSummaryResponse } from "@/server/domain/subscription.types";
import {
  Check,
  X,
  HeartPulse,
  Sparkles,
  ArrowLeft,
  Users,
  Shield,
  CreditCard,
  QrCode,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  CheckCheck,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/planos")({
  component: PlanosPage,
});

export function PlanosPage() {
  const { user, isAuthenticated, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  const [planos, setPlanos] = useState<PlanDefinition[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummaryResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Modal de Checkout e Estados de UX
  const [modalCheckoutAberto, setModalCheckoutAberto] = useState(false);
  const [planoEmCheckout, setPlanoEmCheckout] = useState<PlanDefinition | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<"cartao" | "pix">("cartao");
  const [numeroCartao, setNumeroCartao] = useState("4532 8901 2345 8912");
  const [nomeCartao, setNomeCartao] = useState("DR CARLOS MENDES");
  const [validadeCartao, setValidadeCartao] = useState("12/28");
  const [cvvCartao, setCvvCartao] = useState("892");

  // Estados de UX do Checkout: formulário -> processando -> sucesso / erro
  const [estadoCheckout, setEstadoCheckout] = useState<
    "formulario" | "processando" | "sucesso" | "erro"
  >("formulario");
  const [mensagemErroCheckout, setMensagemErroCheckout] = useState("");
  const [chavePixCopiada, setChavePixCopiada] = useState(false);
  const [transacaoConfirmada, setTransacaoConfirmada] = useState<{
    id: string;
    data: string;
    valor: number;
    planoNome: string;
    perfis: number;
  } | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const [listaPlanos, resumo] = await Promise.all([
          apiClient.getPlans(),
          isAuthenticated ? apiClient.getSubscriptionSummary() : Promise.resolve(null),
        ]);
        setPlanos(listaPlanos);
        setSummary(resumo);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [isAuthenticated]);

  const iniciarCheckout = (plano: PlanDefinition) => {
    if (!isAuthenticated) {
      toast.info("Faça login para assinar um plano", {
        description: "Você será redirecionado para a página de acesso.",
      });
      navigate({ to: "/login" });
      return;
    }
    setPlanoEmCheckout(plano);
    setEstadoCheckout("formulario");
    setMensagemErroCheckout("");
    setModalCheckoutAberto(true);
  };

  const formatarNumeroCartao = (val: string) => {
    const limpo = val.replace(/\D/g, "").slice(0, 16);
    return limpo.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatarValidade = (val: string) => {
    const limpo = val.replace(/\D/g, "").slice(0, 4);
    if (limpo.length >= 3) {
      return `${limpo.slice(0, 2)}/${limpo.slice(2)}`;
    }
    return limpo;
  };

  const handleConfirmarPagamento = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!planoEmCheckout) return;

    setEstadoCheckout("processando");
    try {
      const res = await apiClient.checkout({
        planId: planoEmCheckout.id,
        billingCycle: "mensal",
        metodoPagamento,
        cartao:
          metodoPagamento === "cartao"
            ? {
                numero: numeroCartao.replace(/\D/g, "") || "4532123456788912",
                nomeTitular: nomeCartao,
                validade: validadeCartao,
                cvv: cvvCartao,
              }
            : undefined,
      });

      const totalLiberado =
        planoEmCheckout.perfisUsuarioInclusos + planoEmCheckout.perfisCrmInclusos;

      setTransacaoConfirmada({
        id: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        data: new Date().toLocaleDateString("pt-BR"),
        valor: planoEmCheckout.precoBaseMensal,
        planoNome: planoEmCheckout.nome,
        perfis: totalLiberado,
      });
      setEstadoCheckout("sucesso");
      await refreshSubscription();
      toast.success(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao processar assinatura";
      setMensagemErroCheckout(msg);
      setEstadoCheckout("erro");
      toast.error("Erro no pagamento", { description: msg });
    }
  };

  const copiarChavePix = () => {
    navigator.clipboard.writeText(
      "00020126580014br.gov.bcb.pix0136agendacardio-clinica-pix-key520400005303986",
    );
    setChavePixCopiada(true);
    toast.success("Código PIX copiado para a área de transferência!");
    setTimeout(() => setChavePixCopiada(false), 3000);
  };

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] text-white">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
          <HeartPulse className="size-8 animate-pulse text-red-500" />
        </div>
        <p className="mt-4 font-mono text-sm tracking-widest text-zinc-400">
          CARREGANDO TABELA DE PLANOS...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-zinc-100 flex flex-col justify-between selection:bg-red-600 selection:text-white pb-16">
      {/* Header */}
      <header className="px-6 py-6 sm:px-12 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: isAuthenticated ? "/perfis" : "/" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Voltar</span>
          </button>
          {isAuthenticated && (
            <Link
              to="/assinatura"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono border border-white/10 transition"
            >
              <CreditCard className="size-3.5 text-amber-400" />
              <span>Aba de Assinatura</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-red-600 font-mono text-base font-black text-white shadow-md shadow-red-600/30">
            <HeartPulse className="size-5" />
          </div>
          <span className="font-mono text-base font-black tracking-wider uppercase text-white">
            AGENDA<span className="text-red-500">CARDIO</span>
          </span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl w-full mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-red-950/80 text-red-300 border border-red-800/40 mb-4">
            <Sparkles className="size-3 text-red-400" />
            Planos & Degustação de 30 Dias
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Escolha o plano ideal para sua clínica
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Todos os planos incluem 1 perfil de médico titular, 1 perfil de atendente e disparo de
            notificações WhatsApp para confirmação de pacientes. O 1º mês é 100% gratuito.
          </p>
        </div>

        {/* Grade com os 2 Planos Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {planos.map((plano) => {
            const isCurrent = summary?.subscription?.planId === plano.id;
            const isAvancado = plano.id === "plano_avancado";

            return (
              <div
                key={plano.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 backdrop-blur-md ${
                  isAvancado
                    ? "bg-gradient-to-b from-zinc-900 via-[#181c26] to-zinc-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/30 md:-translate-y-1"
                    : "bg-zinc-900/85 border border-zinc-800 shadow-xl"
                }`}
              >
                {/* Tag de Destaque */}
                {isAvancado && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono text-[11px] font-black uppercase tracking-wider shadow-lg">
                    Mais Completo • Com CRM Integrado
                  </div>
                )}

                <div>
                  {/* Cabeçalho do Card */}
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plano.nome}</h3>
                    <p className="text-xs text-zinc-400 min-h-[38px] leading-relaxed">
                      {plano.descricao}
                    </p>
                  </div>

                  {/* Preço */}
                  <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-mono text-zinc-400">R$</span>
                      <span className="text-4xl font-black font-mono text-white tracking-tight">
                        {plano.precoBaseMensal.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">/ mês</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold uppercase border border-emerald-800/40">
                        1º Mês 100% Gratuito
                      </span>
                      <span className="text-[11px] text-zinc-500">Sem carência ou fidelidade</span>
                    </div>
                  </div>

                  {/* Perfis inclusos */}
                  <div className="mb-6 p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-zinc-400" />
                        <span>Perfis de equipe:</span>
                      </div>
                      <strong className="font-mono text-white">
                        1 Médico Titular + 1 Atendente
                      </strong>
                    </div>
                    {isAvancado ? (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-purple-300">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-purple-400" />
                          <span>Perfil CRM Administrativo:</span>
                        </div>
                        <strong className="font-mono text-purple-200">
                          1 incluso (Mesma conta)
                        </strong>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-zinc-500">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-zinc-600" />
                          <span>Perfil CRM Administrativo:</span>
                        </div>
                        <span className="font-mono text-zinc-500">Não incluso</span>
                      </div>
                    )}
                  </div>

                  {/* Lista de Recursos */}
                  <div className="space-y-3 mb-8 text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">
                      Recursos e Funcionalidades:
                    </span>
                    {plano.recursosDescritos.map((rec) => (
                      <div key={rec.id} className="flex items-start gap-2.5">
                        {rec.incluso ? (
                          <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="size-4 text-zinc-600 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`${rec.incluso ? "text-zinc-200" : "text-zinc-600 line-through"}`}
                        >
                          <strong>{rec.nome}</strong>: {rec.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Ação */}
                <button
                  onClick={() => iniciarCheckout(plano)}
                  disabled={isCurrent}
                  className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                    isCurrent
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                      : isAvancado
                        ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/40 hover:scale-[1.02]"
                        : "bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02]"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span>Plano Atual da Conta</span>
                    </>
                  ) : (
                    <>
                      <span>Assinar {plano.nome}</span>
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Informações de Apoio e Dúvidas */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
              <MessageCircle className="size-4 text-emerald-400" /> WhatsApp para Pacientes
            </h4>
            <p>
              Disparo automatizado de confirmações e lembretes de consulta direto no WhatsApp dos
              pacientes com atualização em tempo real na agenda.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
              <Shield className="size-4 text-purple-400" /> CRM Integrado sem Nova Conta
            </h4>
            <p>
              No Plano Avançado, o perfil de CRM funciona na mesma conta do titular, sem a
              necessidade de fazer novos cadastros ou criar logins adicionais.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
              <CreditCard className="size-4 text-amber-400" /> 1º Mês 100% Gratuito
            </h4>
            <p>
              Você testa todas as funcionalidades por 30 dias gratuitamente. Cancele quando quiser,
              sem taxa de rescisão ou fidelidade.
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Checkout / Gateway de Pagamento & UX de Sucesso / Erro */}
      {modalCheckoutAberto && planoEmCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setModalCheckoutAberto(false)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white"
            >
              <X className="size-5" />
            </button>

            {/* ESTADO 1: FORMULÁRIO DE INSCRIÇÃO & CHECKOUT */}
            {estadoCheckout === "formulario" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Finalizar Assinatura</h3>
                    <span className="text-xs text-zinc-400">
                      {planoEmCheckout.nome} (1 Médico + 1 Atendente
                      {planoEmCheckout.temCrm ? " + 1 CRM" : ""})
                    </span>
                  </div>
                </div>

                {/* Seleção do Método de Pagamento */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento("cartao")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                      metodoPagamento === "cartao"
                        ? "bg-white text-zinc-950 border-white shadow-md"
                        : "bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white"
                    }`}
                  >
                    <CreditCard className="size-4" />
                    <span>Cartão de Crédito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPagamento("pix")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition ${
                      metodoPagamento === "pix"
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                        : "bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white"
                    }`}
                  >
                    <QrCode className="size-4" />
                    <span>PIX Instantâneo</span>
                  </button>
                </div>

                {metodoPagamento === "cartao" ? (
                  <form onSubmit={handleConfirmarPagamento} className="space-y-4">
                    {/* Visualizador de Cartão de Crédito Virtual Estilizado */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-zinc-850 via-zinc-900 to-black border border-white/10 p-5 shadow-2xl text-white overflow-hidden mb-2">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-7 rounded-md bg-amber-400/80 border border-amber-300 shadow-inner flex items-center justify-center">
                            <div className="w-5 h-4 border border-amber-600/50 rounded-xs" />
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                            Cartão Virtual
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black italic tracking-wider text-amber-400">
                          {numeroCartao.startsWith("5")
                            ? "Mastercard"
                            : numeroCartao.startsWith("4")
                              ? "VISA"
                              : "CardioPay"}
                        </span>
                      </div>

                      <div className="font-mono text-lg sm:text-xl tracking-widest mb-4 font-bold text-zinc-100">
                        {numeroCartao || "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono uppercase">
                        <div>
                          <span className="text-[9px] text-zinc-500 block">Titular do Cartão</span>
                          <span className="font-bold tracking-wider text-zinc-200">
                            {nomeCartao || "DR(A). NOME COMPLETO"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-500 block text-right">
                            Validade
                          </span>
                          <span className="font-bold text-zinc-200">
                            {validadeCartao || "MM/AA"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs do Formulário */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        Número do Cartão *
                      </label>
                      <input
                        type="text"
                        required
                        value={numeroCartao}
                        onChange={(e) => setNumeroCartao(formatarNumeroCartao(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        Nome Impresso no Cartão *
                      </label>
                      <input
                        type="text"
                        required
                        value={nomeCartao}
                        onChange={(e) => setNomeCartao(e.target.value.toUpperCase())}
                        placeholder="Ex: DR CARLOS MENDES"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:border-amber-500 uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                          Validade (MM/AA) *
                        </label>
                        <input
                          type="text"
                          required
                          value={validadeCartao}
                          onChange={(e) => setValidadeCartao(formatarValidade(e.target.value))}
                          placeholder="12/28"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                          Código CVV *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cvvCartao}
                          onChange={(e) => setCvvCartao(e.target.value.replace(/\D/g, ""))}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2">
                      <Lock className="size-3 text-emerald-400 shrink-0" />
                      <span>Criptografia bancária TLS 1.3 de ponta a ponta com tokenização.</span>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setModalCheckoutAberto(false)}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-950/40 transition transform active:scale-95"
                      >
                        Pagar R$ {planoEmCheckout.precoBaseMensal.toFixed(2).replace(".", ",")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {/* Tela de PIX */}
                    <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-center">
                      <div className="mx-auto size-40 rounded-2xl bg-white p-3 flex items-center justify-center mb-3 shadow-lg">
                        <QrCode className="size-36 text-black" />
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-300 block mb-1">
                        QR Code PIX com Confirmação Instantânea
                      </span>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mb-4">
                        Abra o app do seu banco, escolha <strong>PIX Copia e Cola</strong> ou
                        escaneie o QR Code acima.
                      </p>

                      <div className="flex items-center gap-2 max-w-sm mx-auto">
                        <input
                          type="text"
                          readOnly
                          value="00020126580014br.gov.bcb.pix0136agendacardio-clinica-pix-key520400005303986"
                          className="flex-1 px-3 py-2 text-[11px] font-mono rounded-lg bg-black/60 border border-zinc-700 text-zinc-300 truncate"
                        />
                        <button
                          type="button"
                          onClick={copiarChavePix}
                          className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          {chavePixCopiada ? (
                            <CheckCheck className="size-4 text-white" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                          <span>{chavePixCopiada ? "Copiado!" : "Copiar"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-1">
                      <Lock className="size-3 text-emerald-400 shrink-0" />
                      <span>Liberação automática em menos de 10 segundos após o pagamento.</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setModalCheckoutAberto(false)}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmarPagamento()}
                        className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition"
                      >
                        Confirmar Pagamento PIX
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ESTADO 2: PROCESSANDO TRANSAÇÃO */}
            {estadoCheckout === "processando" && (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto size-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                <h3 className="text-xl font-black text-white">Processando sua assinatura...</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Estamos comunicando com a adquirente de pagamentos e provisionando as cotas dos
                  perfis clínicos na sua conta.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-500 inline-block">
                  Segurança bancária TLS 1.3 ativa
                </div>
              </div>
            )}

            {/* ESTADO 3: EXPERIÊNCIA DO USUÁRIO - SUCESSO */}
            {estadoCheckout === "sucesso" && transacaoConfirmada && (
              <div className="text-center py-4 space-y-5">
                <div className="mx-auto size-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-950/50">
                  <CheckCircle2 className="size-9" />
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    Pagamento Aprovado
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    Assinatura Ativada com Sucesso!
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    Parabéns! Sua clínica agora conta com os recursos do{" "}
                    <strong className="text-white">{transacaoConfirmada.planoNome}</strong>.
                  </p>
                </div>

                {/* Resumo da Transação */}
                <div className="rounded-2xl bg-black/50 border border-white/10 p-4 text-left text-xs space-y-2.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ID da Transação:</span>
                    <span className="text-zinc-200 font-bold">{transacaoConfirmada.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Data de Ativação:</span>
                    <span className="text-zinc-200">{transacaoConfirmada.data}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Valor Mensal:</span>
                    <span className="text-emerald-400 font-bold">
                      R$ {transacaoConfirmada.valor.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Capacidade de Perfis:</span>
                    <span className="text-white font-bold">
                      {transacaoConfirmada.perfis} perfis liberados
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCheckoutAberto(false);
                      navigate({ to: "/perfis" });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-950/40 transition"
                  >
                    Gerenciar Perfis
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalCheckoutAberto(false);
                      navigate({ to: "/assinatura" });
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider border border-zinc-700 transition"
                  >
                    Aba de Assinatura
                  </button>
                </div>
              </div>
            )}

            {/* ESTADO 4: EXPERIÊNCIA DO USUÁRIO - ERRO CLARO */}
            {estadoCheckout === "erro" && (
              <div className="text-center py-4 space-y-5">
                <div className="mx-auto size-16 rounded-full bg-red-950/80 text-red-400 border border-red-600 flex items-center justify-center shadow-xl shadow-red-950/50">
                  <AlertTriangle className="size-9" />
                </div>

                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                    Transação Não Concluída
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">Falha no Pagamento</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    {mensagemErroCheckout ||
                      "A operadora do cartão não autorizou a cobrança. Verifique os dados digitados, validade e limite disponível."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 text-left text-xs text-zinc-300">
                  <p className="font-semibold text-red-300 mb-1">Dicas para resolver:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                    <li>Confira se o número e o código CVV foram digitados corretamente.</li>
                    <li>
                      Tente utilizar outra forma de pagamento, como o{" "}
                      <strong>PIX Instantâneo</strong>.
                    </li>
                    <li>Nenhuma cobrança indevida foi realizada na sua conta.</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPagamento("pix");
                      setEstadoCheckout("formulario");
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wider transition"
                  >
                    Pagar com PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstadoCheckout("formulario")}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-wider border border-zinc-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
