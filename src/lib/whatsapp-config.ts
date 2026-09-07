export type WhatsAppProvider = "zapi" | "evolution" | "custom" | "simulador";

export interface WhatsAppSettings {
  provider: WhatsAppProvider;
  apiUrl: string;
  instanceId: string;
  instanceToken: string;
  clientToken?: string | undefined;
  isConnected: boolean;
  connectedPhone?: string | undefined;
  connectedName?: string | undefined;
  batteryLevel?: number | undefined;
  autoSendEnabled: boolean;
  antecedenciaHoras: number; // 24 ou 48
  horarioDisparo: string; // "08:00"
  templateMensagem: string;
}

export interface WhatsAppMessageLog {
  id: string;
  appointmentId?: string;
  pacienteNome: string;
  telefone: string;
  dataConsulta: string;
  horaConsulta: string;
  procedimento: string;
  mensagem: string;
  enviadoEm: string;
  status: "enviado" | "entregue" | "lido" | "confirmado" | "recusado" | "remarcado" | "falha";
  respostaPaciente?: string;
  detalhes?: string;
}

export const TEMPLATE_PADRAO_WHATSAPP = `Olá, *{paciente}*! 👋

Aqui é da equipe da clínica do *{medico}*.
Passando para confirmar sua consulta agendada para:

📅 *Data:* {data}
⏰ *Horário:* {horario}
🩺 *Procedimento:* {procedimento}

{instrucoes_preparo}

Por gentileza, confirme sua presença respondendo:
👉 Digite *1* para *CONFIRMAR PRESENÇA*
👉 Digite *2* para *CANCELAR*
👉 Digite *3* para *SOLICITAR REMARCAÇÃO*

_Sua confirmação é essencial para organizarmos os atendimentos._`;

export const WHATSAPP_STORAGE_KEY = "agendacardio_whatsapp_settings_v1";
export const WHATSAPP_LOGS_STORAGE_KEY = "agendacardio_whatsapp_logs_v1";

export function getStoredWhatsAppSettings(): WhatsAppSettings {
  if (typeof window === "undefined") {
    return getDefaultSettings();
  }

  try {
    const raw = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultSettings(),
        ...parsed,
      };
    }
  } catch (err) {
    console.warn("Erro ao ler configurações do WhatsApp:", err);
  }

  return getDefaultSettings();
}

export function saveStoredWhatsAppSettings(settings: WhatsAppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WHATSAPP_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Erro ao salvar configurações do WhatsApp:", err);
  }
}

export function getStoredWhatsAppLogs(): WhatsAppMessageLog[] {
  if (typeof window === "undefined") {
    return getInitialMockLogs();
  }

  try {
    const raw = localStorage.getItem(WHATSAPP_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Erro ao ler logs do WhatsApp:", err);
  }

  const initial = getInitialMockLogs();
  saveStoredWhatsAppLogs(initial);
  return initial;
}

export function saveStoredWhatsAppLogs(logs: WhatsAppMessageLog[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WHATSAPP_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn("Erro ao salvar logs do WhatsApp:", err);
  }
}

function getDefaultSettings(): WhatsAppSettings {
  return {
    provider: "zapi",
    apiUrl: "https://api.z-api.io/instances",
    instanceId: "",
    instanceToken: "",
    clientToken: "",
    isConnected: true, // Já vem conectado em modo pronto com simulação e opção de conectar API real
    connectedPhone: "+55 (11) 98452-9100",
    connectedName: "Clínica Cardio Vida (Recepção)",
    batteryLevel: 94,
    autoSendEnabled: true,
    antecedenciaHoras: 24,
    horarioDisparo: "08:00",
    templateMensagem: TEMPLATE_PADRAO_WHATSAPP,
  };
}

function getInitialMockLogs(): WhatsAppMessageLog[] {
  return [
    {
      id: "log-1",
      appointmentId: "mock-1",
      pacienteNome: "Dra. Maria Helena Silveira",
      telefone: "(11) 98765-4321",
      dataConsulta: "Amanhã",
      horaConsulta: "08:30",
      procedimento: "Consulta Inicial + ECG",
      mensagem: "Olá, Maria Helena! Confirmamos sua consulta com Dr. João...",
      enviadoEm: "Hoje às 08:05",
      status: "confirmado",
      respostaPaciente: "1 - Confirmado pelo paciente às 08:24",
    },
    {
      id: "log-2",
      appointmentId: "mock-2",
      pacienteNome: "Carlos Eduardo Rocha",
      telefone: "(11) 97654-3210",
      dataConsulta: "Amanhã",
      horaConsulta: "09:15",
      procedimento: "Ecocardiograma Transtorácico",
      mensagem: "Olá, Carlos Eduardo! Confirmamos seu exame...",
      enviadoEm: "Hoje às 08:05",
      status: "entregue",
      respostaPaciente: "Aguardando resposta do paciente",
    },
    {
      id: "log-3",
      appointmentId: "mock-3",
      pacienteNome: "Ana Beatriz Mendes",
      telefone: "(11) 96543-2109",
      dataConsulta: "Amanhã",
      horaConsulta: "10:00",
      procedimento: "Teste Ergométrico",
      mensagem: "Olá, Ana Beatriz! Confirmamos seu exame...",
      enviadoEm: "Hoje às 08:06",
      status: "remarcado",
      respostaPaciente: "3 - Paciente pediu para remarcar para próxima semana",
    },
  ];
}
