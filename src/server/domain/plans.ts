import { PlanDefinition, PlanId } from "./subscription.types";

export const AVAILABLE_PLANS: Record<PlanId, PlanDefinition> = {
  plano_essencial: {
    id: "plano_essencial",
    nome: "Plano Essencial",
    tagline: "1 Perfil de Atendente e Confirmações no WhatsApp",
    descricao:
      "Ideal para a recepção da clínica. Inclui 1 perfil de atendente, agendamento completo de consultas e exames, e disparo de notificação no WhatsApp para confirmação de pacientes.",
    precoBaseMensal: 39.9,
    permiteMultiplosPerfis: false,
    temCrm: false,
    perfisUsuarioInclusos: 2, // 1 Atendente principal (+ suporte)
    perfisCrmInclusos: 0,
    limiteMaximoPerfisUsuario: 2,
    features: ["agenda", "pacientes", "whatsapp"],
    recursosDescritos: [
      {
        id: "perfil_atendente",
        nome: "1 Perfil de Atendente (Recepção)",
        descricao: "Acesso dedicado para atendente ou recepcionista da clínica",
        incluso: true,
      },
      {
        id: "agenda_inteligente",
        nome: "Agendamento Completo de Pacientes",
        descricao: "Grade horária de exames, consultas e encaixes ágeis",
        incluso: true,
      },
      {
        id: "whatsapp_confirmacao",
        nome: "Disparo e Confirmação no WhatsApp",
        descricao: "Lembretes com orientações de preparo e confirmação em tempo real",
        incluso: true,
      },
      {
        id: "cartoes_pacientes",
        nome: "Cartões e Ficha Rápida dos Pacientes",
        descricao: "Histórico de atendimentos, telefones, convênios e notas da recepção",
        incluso: true,
      },
      {
        id: "degustacao",
        nome: "1º Mês 100% Gratuito",
        descricao: "Experimente 30 dias grátis sem necessidade de cartão de crédito",
        incluso: true,
      },
      {
        id: "crm_admin",
        nome: "Módulo CRM Completo",
        descricao: "Gestão de relacionamento e retornos preventivos (Disponível no Avançado)",
        incluso: false,
      },
    ],
  },
  plano_avancado: {
    id: "plano_avancado",
    nome: "Plano Avançado",
    tagline: "1 Perfil de Atendente + 1 Perfil CRM Incluso",
    descricao:
      "Agendamento, confirmações e relacionamento completo. Inclui 1 perfil de atendente, 1 perfil CRM integrado na mesma conta (sem precisar criar conta novamente) e disparo no WhatsApp.",
    precoBaseMensal: 49.9,
    permiteMultiplosPerfis: false,
    temCrm: true,
    perfisUsuarioInclusos: 2,
    perfisCrmInclusos: 1, // 1 Perfil CRM incluso na mesma conta
    limiteMaximoPerfisUsuario: 2,
    features: ["agenda", "pacientes", "whatsapp", "crm"],
    recursosDescritos: [
      {
        id: "perfil_atendente",
        nome: "1 Perfil de Atendente (Recepção)",
        descricao: "Acesso dedicado para atendente ou recepcionista da clínica",
        incluso: true,
      },
      {
        id: "perfil_crm_incluso",
        nome: "1 Perfil CRM Integrado (Mesma Conta)",
        descricao: "Gestão de relacionamento e captação sem necessidade de nova conta",
        incluso: true,
      },
      {
        id: "agenda_inteligente",
        nome: "Agendamento Completo de Pacientes",
        descricao: "Grade horária de exames, consultas e encaixes ágeis",
        incluso: true,
      },
      {
        id: "whatsapp_confirmacao",
        nome: "Disparo e Confirmação no WhatsApp",
        descricao: "Lembretes com orientações de preparo e confirmação em tempo real",
        incluso: true,
      },
      {
        id: "modulo_crm",
        nome: "CRM Completo & Retorno Preventivo",
        descricao: "Funil de novos pacientes, convênios e lembretes de exames semestrais",
        incluso: true,
      },
      {
        id: "cartoes_pacientes",
        nome: "Cartões e Ficha Rápida dos Pacientes",
        descricao: "Histórico de atendimentos, telefones, convênios e notas da recepção",
        incluso: true,
      },
      {
        id: "degustacao",
        nome: "1º Mês 100% Gratuito",
        descricao: "Experimente 30 dias grátis sem necessidade de cartão de crédito",
        incluso: true,
      },
    ],
  },
};

export const PLANS: PlanDefinition[] = Object.values(AVAILABLE_PLANS);
