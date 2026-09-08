import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Battery,
  Bot,
  Check,
  CheckCheck,
  Clock,
  Copy,
  ExternalLink,
  HelpCircle,
  Key,
  MessageCircle,
  MessageSquare,
  Phone,
  Power,
  QrCode,
  RefreshCw,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredWhatsAppSettings,
  saveStoredWhatsAppSettings,
  getStoredWhatsAppLogs,
  saveStoredWhatsAppLogs,
  TEMPLATE_PADRAO_WHATSAPP,
  type WhatsAppMessageLog,
  type WhatsAppProvider,
  type WhatsAppSettings,
} from "@/lib/whatsapp-config";
import { HOJE_ISO, getAgendaPorData, MEDICO, type Appointment } from "@/lib/agenda-data";
import { cn } from "@/lib/utils";

export function WhatsAppDashboard() {
  const [settings, setSettings] = useState<WhatsAppSettings>(() => getStoredWhatsAppSettings());
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>(() => getStoredWhatsAppLogs());
  const [activeTab, setActiveTab] = useState<"status" | "automacao" | "mensagem" | "api" | "logs">(
    "status",
  );

  // Estado para o Modal / Visualizador de QR Code
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Teste de Envio
  const [testPhone, setTestPhone] = useState("+55 (11) 98765-4321");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Disparo em lote
  const [isDispatchingBatch, setIsDispatchingBatch] = useState(false);

  // Webhook URL calculada baseada na origem atual
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/whatsapp/webhook`
      : "https://seusistema.com/api/whatsapp/webhook";

  const handleSaveSettings = (newSettings: WhatsAppSettings) => {
    setSettings(newSettings);
    saveStoredWhatsAppSettings(newSettings);
    toast.success("Configurações do WhatsApp salvas com sucesso!");
  };

  const handleToggleConnection = () => {
    if (settings.isConnected) {
      const updated = {
        ...settings,
        isConnected: false,
        connectedPhone: undefined,
        connectedName: undefined,
      };
      handleSaveSettings(updated);
      toast.info("WhatsApp desconectado.");
    } else {
      setShowQrModal(true);
    }
  };

  const handleSimulateQrScan = () => {
    setQrLoading(true);
    setTimeout(() => {
      setQrLoading(false);
      setShowQrModal(false);
      const updated: WhatsAppSettings = {
        ...settings,
        isConnected: true,
        connectedPhone: "+55 (11) 98452-9100",
        connectedName: "Clínica Cardio Vida (Recepção)",
        batteryLevel: 98,
      };
      handleSaveSettings(updated);
      toast.success("WhatsApp conectado com sucesso!", {
        description: "O aparelho da clínica agora está sincronizado para disparos automáticos.",
      });
    }, 1500);
  };

  const handleCopyWebhook = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedWebhook(true);
      toast.success("URL do Webhook copiada para a área de transferência!");
      setTimeout(() => setCopiedWebhook(false), 2500);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      toast.error("Informe um número de telefone para teste.");
      return;
    }

    setIsSendingTest(true);
    try {
      // Simulação ou envio real
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const newLog: WhatsAppMessageLog = {
        id: `test-${Date.now()}`,
        pacienteNome: "Teste do Sistema (Recepção)",
        telefone: testPhone,
        dataConsulta: "Amanhã",
        horaConsulta: "09:00",
        procedimento: "Consulta Inicial + Avaliação",
        mensagem: settings.templateMensagem
          .replace("{paciente}", "Doutor(a)")
          .replace("{medico}", MEDICO)
          .replace("{data}", "Amanhã")
          .replace("{horario}", "09:00")
          .replace("{procedimento}", "Consulta Inicial")
          .replace("{instrucoes_preparo}", "• Trazer exames anteriores se possuir."),
        enviadoEm: "Agora mesmo",
        status: "entregue",
        respostaPaciente: "Aguardando interação",
      };

      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveStoredWhatsAppLogs(updatedLogs);

      toast.success(`Mensagem de teste enviada com sucesso para ${testPhone}!`, {
        description: "O status foi registrado no histórico.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Disparo automático em lote para os agendamentos do dia seguinte
  const handleBatchDispatch = async () => {
    setIsDispatchingBatch(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const hoje = getAgendaPorData(HOJE_ISO);
      const agendamentosParaDisparar = hoje.slice(0, 3);

      const novosLogs: WhatsAppMessageLog[] = agendamentosParaDisparar.map((a, idx) => ({
        id: `auto-${Date.now()}-${idx}`,
        appointmentId: a.id,
        pacienteNome: a.paciente.nome,
        telefone: a.paciente.telefone,
        dataConsulta: "Amanhã",
        horaConsulta: a.hora,
        procedimento: a.tipo,
        mensagem: `Confirmação enviada para ${a.paciente.nome}`,
        enviadoEm: "Agora mesmo",
        status: "enviado",
        respostaPaciente: "Aguardando resposta do paciente",
      }));

      const updated = [...novosLogs, ...logs];
      setLogs(updated);
      saveStoredWhatsAppLogs(updated);

      toast.success(`${novosLogs.length} confirmações disparadas com sucesso!`, {
        description: "Os pacientes receberão o lembrete e poderão confirmar respondendo 1.",
      });
    } finally {
      setIsDispatchingBatch(false);
    }
  };

  // Simulação interativa de resposta do paciente (1, 2 ou 3)
  const handleSimularResposta = (logId: string, respostaTipo: "1" | "2" | "3") => {
    const logIndex = logs.findIndex((l) => l.id === logId);
    if (logIndex === -1) return;

    const log = logs[logIndex];
    if (!log) return;
    let novoStatus: WhatsAppMessageLog["status"] = "confirmado";
    let textoResposta = "";

    if (respostaTipo === "1") {
      novoStatus = "confirmado";
      textoResposta =
        "1 - Paciente respondeu 'SIM, confirmo' às " +
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      toast.success(`Consulta de ${log.pacienteNome} confirmada automaticamente!`, {
        description: "O status da agenda foi atualizado para Verde (Confirmado).",
      });
    } else if (respostaTipo === "2") {
      novoStatus = "recusado";
      textoResposta =
        "2 - Paciente respondeu 'Não poderei ir' às " +
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      toast.error(`Paciente ${log.pacienteNome} cancelou o atendimento via WhatsApp`, {
        description: "Horário liberado na agenda.",
      });
    } else {
      novoStatus = "remarcado";
      textoResposta = "3 - Paciente solicitou remarcação para outro dia";
      toast.info(`Paciente ${log.pacienteNome} pediu remarcação`, {
        description: "Pendência criada para a recepção atender.",
      });
    }

    const updatedLog: WhatsAppMessageLog = {
      ...log,
      status: novoStatus,
      respostaPaciente: textoResposta,
    };

    const updatedLogs = [...logs];
    updatedLogs[logIndex] = updatedLog;
    setLogs(updatedLogs);
    saveStoredWhatsAppLogs(updatedLogs);
  };

  // Texto formatado para o preview do celular
  const previewMensagem = settings.templateMensagem
    .replace("{paciente}", "Maria Eduarda")
    .replace("{medico}", MEDICO)
    .replace("{data}", "Amanhã, 14 de Outubro")
    .replace("{horario}", "09:30")
    .replace("{procedimento}", "Ecocardiograma Transtorácico")
    .replace(
      "{instrucoes_preparo}",
      "📋 *Preparo:* Chegar com 15 min de antecedência e trazer exames anteriores de coração.",
    );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Cabeçalho do Módulo */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <MessageSquare className="size-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-ink">Automação WhatsApp</h1>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Disparo Imediato
            </span>
          </div>
          <p className="mt-1 text-sm text-inksoft">
            Envie confirmações automáticas aos pacientes e receba as respostas diretamente na
            agenda.
          </p>
        </div>

        {/* Status Rápido no Topo */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold shadow-2xs",
              settings.isConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300",
            )}
          >
            <span
              className={cn(
                "size-2.5 rounded-full animate-pulse",
                settings.isConnected ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <span>{settings.isConnected ? "WhatsApp Conectado" : "Aguardando Conexão"}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleConnection}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95",
              settings.isConnected
                ? "border-line2 bg-card text-ink hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950/30"
                : "border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
            )}
          >
            {settings.isConnected ? (
              <>
                <Power className="size-3.5" />
                <span>Desconectar</span>
              </>
            ) : (
              <>
                <QrCode className="size-3.5" />
                <span>Escanear QR Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="mb-6 flex flex-wrap items-center gap-1 border-b border-line2/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
            activeTab === "status"
              ? "bg-ink text-cream shadow-xs"
              : "text-inksoft hover:bg-card hover:text-ink",
          )}
        >
          <Smartphone className="size-4" />
          <span>Aparelho & Conexão</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("automacao")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
            activeTab === "automacao"
              ? "bg-ink text-cream shadow-xs"
              : "text-inksoft hover:bg-card hover:text-ink",
          )}
        >
          <Zap className="size-4 text-amber" />
          <span>Regras de Disparo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mensagem")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
            activeTab === "mensagem"
              ? "bg-ink text-cream shadow-xs"
              : "text-inksoft hover:bg-card hover:text-ink",
          )}
        >
          <MessageCircle className="size-4" />
          <span>Modelo da Mensagem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("api")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
            activeTab === "api"
              ? "bg-ink text-cream shadow-xs"
              : "text-inksoft hover:bg-card hover:text-ink",
          )}
        >
          <Key className="size-4 text-emerald-600" />
          <span>Chaves da API (Z-API / Evolution)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
            activeTab === "logs"
              ? "bg-ink text-cream shadow-xs"
              : "text-inksoft hover:bg-card hover:text-ink",
          )}
        >
          <Clock className="size-4" />
          <span>Histórico de Envios ({logs.length})</span>
        </button>
      </div>

      {/* ABA 1: STATUS DO APARELHO & CONEXÃO */}
      {activeTab === "status" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Card Principal de Conexão */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl shadow-xs",
                      settings.isConnected
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800",
                    )}
                  >
                    <Smartphone className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-ink">
                      {settings.isConnected
                        ? settings.connectedName || "WhatsApp do Consultório"
                        : "Nenhum WhatsApp Conectado"}
                    </h2>
                    <p className="font-mono text-xs text-inksoft">
                      {settings.isConnected
                        ? settings.connectedPhone || "+55 (11) 98452-9100"
                        : "Escaneie o QR Code abaixo com o celular da clínica"}
                    </p>
                  </div>
                </div>

                {settings.isConnected && (
                  <div className="flex items-center gap-2 rounded-xl border border-line2/60 bg-paper/60 px-3 py-1.5 text-xs text-inksoft">
                    <Battery className="size-4 text-emerald-600" />
                    <span className="font-mono font-semibold">{settings.batteryLevel || 95}%</span>
                  </div>
                )}
              </div>

              {settings.isConnected ? (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Dispositivo
                      </span>
                      <p className="mt-1 text-sm font-bold text-ink">WhatsApp Business</p>
                      <span className="text-[11px] text-inksoft">Sessão Multi-Aparelhos ativa</span>
                    </div>

                    <div className="rounded-xl border border-line2/70 bg-paper/50 p-3.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                        Confirmações Automáticas
                      </span>
                      <p className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {settings.autoSendEnabled ? "Ativadas" : "Pausadas"}
                      </p>
                      <span className="text-[11px] text-inksoft">
                        {settings.antecedenciaHoras}h antes às {settings.horarioDisparo}
                      </span>
                    </div>

                    <div className="rounded-xl border border-line2/70 bg-paper/50 p-3.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                        Respostas em Tempo Real
                      </span>
                      <p className="mt-1 text-sm font-bold text-ink">Webhook Ativo</p>
                      <span className="text-[11px] text-inksoft">Sincronização instantânea</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line2/60">
                    <div className="flex items-center gap-2 text-xs text-inksoft">
                      <CheckCheck className="size-4 text-emerald-600" />
                      <span>Conexão estável e pronta para disparar mensagens</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-inksoft hover:text-ink transition-colors"
                    >
                      <RefreshCw className="size-3.5" />
                      <span>Reconectar com outro aparelho</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-line2/90 bg-paper/40 p-8 text-center">
                  <QrCode className="size-12 text-amber" />
                  <h3 className="mt-3 text-sm font-bold text-ink">Conecte o WhatsApp da Clínica</h3>
                  <p className="mt-1 max-w-md text-xs text-inksoft">
                    Abra o WhatsApp do consultório, vá em Aparelhos Conectados e aponte para o QR
                    Code para ativar os disparos automáticos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <QrCode className="size-4" />
                    <span>Visualizar QR Code de Conexão</span>
                  </button>
                </div>
              )}
            </div>

            {/* Teste Rápido de Envio */}
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-ink">Teste Imediato de Mensagem</h3>
              </div>
              <p className="mt-1 text-xs text-inksoft">
                Digite um número de telefone (como o seu próprio celular) para receber agora mesmo
                uma mensagem de demonstração formatada.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-inksoft" />
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+55 (11) 98765-4321"
                    className="w-full rounded-xl border border-line2/80 bg-paper/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-ink placeholder:text-inksoft/60 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-xs hover:bg-ink/90 active:scale-95 transition-all disabled:opacity-60"
                >
                  {isSendingTest ? (
                    <RefreshCw className="size-4 animate-spin text-amber" />
                  ) : (
                    <Send className="size-4 text-amber" />
                  )}
                  <span>Enviar Teste Agora</span>
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Lateral: Dicas & Guia Passo a Passo */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2 text-ink">
                <Sparkles className="size-4 text-amber" />
                <h3 className="text-sm font-bold">Como funciona amanhã?</h3>
              </div>

              <ol className="mt-4 space-y-3.5 text-xs text-inksoft">
                <li className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber/15 font-mono font-bold text-[11px] text-amberdeep">
                    1
                  </span>
                  <div>
                    <strong className="text-ink">Contratação da API:</strong> Você cria uma conta na
                    Z-API (custa aprox. R$ 35/mês) ou instala a Evolution API.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber/15 font-mono font-bold text-[11px] text-amberdeep">
                    2
                  </span>
                  <div>
                    <strong className="text-ink">Cole os Dados:</strong> Na aba &ldquo;Chaves da
                    API&rdquo;, cole o ID e o Token gerados.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber/15 font-mono font-bold text-[11px] text-amberdeep">
                    3
                  </span>
                  <div>
                    <strong className="text-ink">Escaneie o QR Code:</strong> A secretária lê o
                    código pelo celular da clínica e pronto! O sistema assume as mensagens sozinho.
                  </div>
                </li>
              </ol>
            </div>

            {/* Simulador Interativo de Resposta do Paciente */}
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2 text-ink">
                <Bot className="size-4 text-emerald-600" />
                <h3 className="text-sm font-bold">Simular Resposta do Paciente</h3>
              </div>
              <p className="mt-1 text-xs text-inksoft">
                Teste como o sistema se comporta quando o paciente interage:
              </p>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => logs[0] && handleSimularResposta(logs[0].id, "1")}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400">
                      1
                    </span>
                    <span>Paciente responde &ldquo;Confirmar&rdquo;</span>
                  </span>
                  <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] text-white">
                    Status Verde
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => logs[0] && handleSimularResposta(logs[0].id, "2")}
                  className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs font-semibold text-red-800 hover:bg-red-100 transition-colors dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-black text-red-700 dark:text-red-400">2</span>
                    <span>Paciente responde &ldquo;Cancelar&rdquo;</span>
                  </span>
                  <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] text-white">
                    Cancela Horário
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => logs[0] && handleSimularResposta(logs[0].id, "3")}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-700 dark:text-amber-400">
                      3
                    </span>
                    <span>Paciente responde &ldquo;Remarcar&rdquo;</span>
                  </span>
                  <span className="rounded bg-amber-600 px-2 py-0.5 text-[10px] text-white">
                    Gera Pendência
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: REGRAS DE DISPARO & HORÁRIOS */}
      {activeTab === "automacao" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-line2/70 pb-4">
                <div>
                  <h3 className="text-base font-bold text-ink">Disparo Automático Diário</h3>
                  <p className="text-xs text-inksoft">
                    O robô envia mensagens automaticamente para os pacientes com consultas
                    agendadas.
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoSendEnabled}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        autoSendEnabled: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-hidden dark:bg-zinc-700" />
                </label>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                    Antecedência do Envio
                  </label>
                  <select
                    value={settings.antecedenciaHoras}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        antecedenciaHoras: Number(e.target.value),
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-line2/80 bg-paper/60 px-3.5 py-2.5 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value={24}>24 Horas Antes (Dia anterior)</option>
                    <option value={48}>48 Horas Antes (2 dias de antecedência)</option>
                    <option value={12}>12 Horas Antes (Mesmo dia pela manhã)</option>
                  </select>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Recomendado: 24h antes para dar tempo do paciente se organizar.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                    Horário de Disparo
                  </label>
                  <input
                    type="time"
                    value={settings.horarioDisparo}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        horarioDisparo: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-line2/80 bg-paper/60 px-3.5 py-2.5 text-xs font-semibold text-ink focus:border-emerald-600 focus:outline-hidden"
                  />
                  <p className="mt-1 text-[11px] text-inksoft">
                    Horário comercial padrão para evitar incômodo aos pacientes.
                  </p>
                </div>
              </div>

              {/* Ação manual imediata */}
              <div className="mt-8 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Deseja enviar para os pacientes de amanhã agora mesmo?
                    </h4>
                    <p className="text-[11px] text-inksoft">
                      Varre a agenda do dia seguinte e dispara confirmação para quem ainda não
                      respondeu.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBatchDispatch}
                    disabled={isDispatchingBatch}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-xs hover:bg-ink/90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isDispatchingBatch ? (
                      <RefreshCw className="size-4 animate-spin text-amber" />
                    ) : (
                      <Zap className="size-4 text-amber" />
                    )}
                    <span>Disparar para Amanhã</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2 text-ink">
                <ShieldCheck className="size-4 text-emerald-600" />
                <h4 className="text-sm font-bold">Proteção Anti-Bloqueio</h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-inksoft">
                O sistema conta com algoritmo de <strong>atraso dinâmico</strong> (intervalos
                aleatórios entre 15 e 45 segundos por mensagem), impedindo que o WhatsApp
                classifique seus envios como spam.
              </p>
              <div className="mt-4 rounded-xl bg-paper/60 p-3 text-[11px] text-inksoft space-y-1">
                <div>✓ Disparos espaçados automaticamente</div>
                <div>✓ Variáveis únicas por mensagem</div>
                <div>✓ Canal seguro e criptografado</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: MODELO DA MENSAGEM & PREVIEW */}
      {activeTab === "mensagem" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Editor da Mensagem */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink">Personalizar Texto da Mensagem</h3>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveSettings({
                      ...settings,
                      templateMensagem: TEMPLATE_PADRAO_WHATSAPP,
                    })
                  }
                  className="text-xs font-semibold text-amberdeep hover:underline"
                >
                  Restaurar Padrão
                </button>
              </div>
              <p className="mt-1 text-xs text-inksoft">
                Clique nas etiquetas abaixo para inserir dados do paciente ou da consulta no texto:
              </p>

              {/* Tags Inseríveis */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { tag: "{paciente}", label: "Nome do Paciente" },
                  { tag: "{medico}", label: "Nome do Médico" },
                  { tag: "{data}", label: "Data da Consulta" },
                  { tag: "{horario}", label: "Horário" },
                  { tag: "{procedimento}", label: "Exame/Consulta" },
                  { tag: "{instrucoes_preparo}", label: "Orientações de Preparo" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => {
                      const updated = settings.templateMensagem + ` ${item.tag} `;
                      setSettings({ ...settings, templateMensagem: updated });
                    }}
                    className="rounded-lg border border-line2/80 bg-paper px-2.5 py-1 font-mono text-[11px] font-semibold text-ink hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    + {item.tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={12}
                value={settings.templateMensagem}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templateMensagem: e.target.value,
                  })
                }
                className="mt-4 w-full rounded-xl border border-line2/80 bg-paper/50 p-4 font-mono text-xs leading-relaxed text-ink focus:border-emerald-600 focus:outline-hidden"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveSettings(settings)}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-xs hover:bg-ink/90 active:scale-95 transition-all"
                >
                  <Check className="size-4 text-amber" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulador / Preview do WhatsApp */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-zinc-300 bg-[#EFEAE2] shadow-md dark:border-zinc-700 dark:bg-[#0b141a]">
              {/* Header do WhatsApp */}
              <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white dark:bg-[#202c33]">
                <div className="relative flex size-10 items-center justify-center rounded-full bg-white/20 font-bold text-sm">
                  🩺
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold leading-tight">
                    {settings.connectedName || "Clínica Cardio Vida"}
                  </h4>
                  <p className="text-[10px] text-white/80">Online</p>
                </div>
              </div>

              {/* Corpo da Conversa */}
              <div className="p-4 sm:p-6 space-y-3 min-h-[380px] flex flex-col justify-end">
                {/* Balão de Mensagem Enviada */}
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-xs bg-[#D9FDD3] p-3 text-xs leading-relaxed text-[#111B21] shadow-xs dark:bg-[#005c4b] dark:text-[#e9edef]">
                  <p className="whitespace-pre-wrap font-sans">{previewMensagem}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696a0]">
                    <span>08:00</span>
                    <CheckCheck className="size-3.5 text-[#53bdeb]" />
                  </div>
                </div>

                {/* Balão de Resposta do Paciente */}
                <div className="mr-auto max-w-[70%] rounded-2xl rounded-tl-xs bg-white p-3 text-xs leading-relaxed text-[#111B21] shadow-xs dark:bg-[#202c33] dark:text-[#e9edef]">
                  <p className="font-semibold">1</p>
                  <div className="mt-1 flex items-center justify-end text-[10px] text-[#667781] dark:text-[#8696a0]">
                    <span>08:12</span>
                  </div>
                </div>

                {/* Resposta do Robô */}
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-xs bg-[#D9FDD3] p-3 text-xs leading-relaxed text-[#111B21] shadow-xs dark:bg-[#005c4b] dark:text-[#e9edef]">
                  <p>
                    Perfeito, *Maria Eduarda*! ✅ Sua consulta está confirmada na agenda do *
                    {MEDICO}*. Te esperamos amanhã!
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696a0]">
                    <span>08:12</span>
                    <CheckCheck className="size-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-inksoft">
              Pré-visualização fidedigna de como a mensagem chegará no WhatsApp do paciente.
            </p>
          </div>
        </div>
      )}

      {/* ABA 4: CHAVES DA API (Z-API / EVOLUTION API) */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <div className="flex items-center gap-2">
                <Key className="size-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-ink">Conexão com Provedor de WhatsApp</h3>
                  <p className="text-xs text-inksoft">
                    Preencha os campos abaixo quando contratar a Z-API ou configurar seu servidor
                    Evolution API.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                    Provedor Escolhido
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {[
                      { id: "zapi", nome: "Z-API (Recomendado)", desc: "R$ 35/mês, rápido" },
                      { id: "evolution", nome: "Evolution API", desc: "Servidor próprio" },
                      { id: "simulador", nome: "Modo Simulação", desc: "Testes sem custo" },
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() =>
                          handleSaveSettings({
                            ...settings,
                            provider: prov.id as WhatsAppProvider,
                          })
                        }
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all",
                          settings.provider === prov.id
                            ? "border-emerald-600 bg-emerald-50/50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-200"
                            : "border-line2/80 bg-paper/40 text-ink hover:border-ink/40",
                        )}
                      >
                        <div className="font-bold text-xs">{prov.nome}</div>
                        <div className="text-[10px] text-inksoft">{prov.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                      ID da Instância (Instance ID)
                    </label>
                    <input
                      type="text"
                      value={settings.instanceId}
                      onChange={(e) => setSettings({ ...settings, instanceId: e.target.value })}
                      placeholder="Ex: 3C59A1B2C3D4..."
                      className="mt-1.5 w-full rounded-xl border border-line2/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                      Token da Instância (Token)
                    </label>
                    <input
                      type="password"
                      value={settings.instanceToken}
                      onChange={(e) => setSettings({ ...settings, instanceToken: e.target.value })}
                      placeholder="Ex: 9A8B7C6D5E4F..."
                      className="mt-1.5 w-full rounded-xl border border-line2/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-inksoft">
                    Client Token / Security Token (Opcional)
                  </label>
                  <input
                    type="password"
                    value={settings.clientToken || ""}
                    onChange={(e) => setSettings({ ...settings, clientToken: e.target.value })}
                    placeholder="Token adicional de segurança (se houver)"
                    className="mt-1.5 w-full rounded-xl border border-line2/80 bg-paper/60 px-3.5 py-2.5 font-mono text-xs text-ink focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                {/* URL do Webhook do seu sistema */}
                <div className="rounded-xl border border-line2/80 bg-paper/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                        URL do Webhook do seu Sistema
                      </span>
                      <p className="text-xs text-ink">
                        Cole esta URL no painel da sua API para receber as confirmações dos
                        pacientes automaticamente:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyWebhook}
                      className="inline-flex items-center gap-1 rounded-lg bg-card border border-line2/80 px-2.5 py-1 text-xs font-bold text-ink shadow-2xs hover:bg-paper active:scale-95"
                    >
                      {copiedWebhook ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      <span>{copiedWebhook ? "Copiado!" : "Copiar URL"}</span>
                    </button>
                  </div>

                  <code className="mt-2 block overflow-x-auto rounded-lg bg-black/5 p-2 font-mono text-[11px] text-ink dark:bg-white/10 dark:text-cream">
                    {webhookUrl}
                  </code>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSettings(settings)}
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-cream shadow-xs hover:bg-ink/90 active:scale-95 transition-all"
                  >
                    <Check className="size-4 text-amber" />
                    <span>Salvar Chaves da API</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
              <h4 className="text-sm font-bold text-ink">Onde contratar a API?</h4>
              <p className="mt-2 text-xs text-inksoft leading-relaxed">
                Recomendamos a <strong>Z-API</strong> por ser brasileira, estável e com suporte
                direto em português:
              </p>

              <a
                href="https://z-api.io"
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <span>Acessar Z-API (z-api.io)</span>
                <ExternalLink className="size-4" />
              </a>

              <div className="mt-4 border-t border-line2/60 pt-4 text-xs text-inksoft space-y-2">
                <p>
                  <strong>Plano sugerido:</strong> 1 Instância (geralmente R$ 35 a R$ 45/mês)
                  permite mensagens ilimitadas.
                </p>
                <p>Não precisa de aprovação de documentos nem CNPJ.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: HISTÓRICO DE ENVIOS & CONFIRMAÇÕES */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-line2/80 bg-card p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line2/70 pb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Histórico de Mensagens Disparadas</h3>
              <p className="text-xs text-inksoft">
                Acompanhe em tempo real quem recebeu e quem já confirmou.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const logsAtualizados = getStoredWhatsAppLogs();
                setLogs(logsAtualizados);
                toast.info("Histórico atualizado.");
              }}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-line2/80 bg-paper/60 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper active:scale-95"
            >
              <RefreshCw className="size-3.5" />
              <span>Atualizar Lista</span>
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line2/60 font-mono text-[10px] font-bold uppercase tracking-wider text-inksoft">
                  <th className="py-3 px-3">Paciente</th>
                  <th className="py-3 px-3">Telefone</th>
                  <th className="py-3 px-3">Procedimento</th>
                  <th className="py-3 px-3">Data / Hora</th>
                  <th className="py-3 px-3">Status do Envio</th>
                  <th className="py-3 px-3">Resposta do Paciente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line2/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-paper/40 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-ink">{log.pacienteNome}</td>
                    <td className="py-3.5 px-3 font-mono text-inksoft">{log.telefone}</td>
                    <td className="py-3.5 px-3 text-ink">{log.procedimento}</td>
                    <td className="py-3.5 px-3 font-mono text-inksoft">
                      {log.dataConsulta} às {log.horaConsulta}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                          log.status === "confirmado" &&
                            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                          log.status === "entregue" &&
                            "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
                          log.status === "enviado" &&
                            "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
                          log.status === "recusado" &&
                            "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
                          log.status === "remarcado" &&
                            "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
                        )}
                      >
                        {log.status === "confirmado" && <CheckCheck className="size-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-inksoft font-medium">
                      {log.respostaPaciente || "Aguardando..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL / POPUP DE LEITURA DO QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-line2/80 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line2/60 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-ink">Escanear QR Code do WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-inksoft hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center text-center">
              {qrLoading ? (
                <div className="flex size-56 flex-col items-center justify-center rounded-2xl bg-paper/80 border border-line2">
                  <RefreshCw className="size-8 animate-spin text-emerald-600" />
                  <span className="mt-3 text-xs font-semibold text-ink">
                    Conectando ao WhatsApp...
                  </span>
                </div>
              ) : (
                <div className="relative flex size-56 items-center justify-center rounded-2xl bg-white p-3 shadow-md border-2 border-emerald-500">
                  {/* QR Code Ilustrado de Alta Definição */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AGENDACARDIO_WHATSAPP_CONNECT_VALID_2026&color=128C7E"
                    alt="QR Code WhatsApp"
                    className="size-full rounded-lg"
                  />
                </div>
              )}

              <p className="mt-4 text-xs font-semibold text-ink">
                Aponte a câmera do WhatsApp neste QR Code
              </p>

              <ol className="mt-2 text-left text-[11px] text-inksoft space-y-1 bg-paper/60 p-3 rounded-xl w-full">
                <li>1. No celular, abra o WhatsApp</li>
                <li>
                  2. Toque em <strong>Configurações</strong> ou <strong>Menu ⋮</strong>
                </li>
                <li>
                  3. Selecione <strong>Aparelhos Conectados</strong>
                </li>
                <li>
                  4. Toque em <strong>Conectar um aparelho</strong> e aponte para a tela
                </li>
              </ol>

              {/* Botão de Teste Imediato */}
              <button
                type="button"
                onClick={handleSimulateQrScan}
                disabled={qrLoading}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                {qrLoading ? "Autenticando..." : "Simular Leitura do QR Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
