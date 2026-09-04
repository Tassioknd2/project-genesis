/**
 * Teste Automatizado do Sistema de Assinaturas e Perfis
 *
 * Valida:
 * 1. Obtenção pública da tabela dos 2 planos (Essencial e Avançado)
 * 2. Plano Essencial (R$ 39,90): 1 Médico + 1 Atendente + WhatsApp (Sem CRM)
 * 3. Plano Avançado (R$ 49,90): 1 Médico + 1 Atendente + 1 CRM incluso na mesma conta + WhatsApp
 * 4. Remoção completa do Plano Premium
 * 5. Bloqueio de CRM no Plano Essencial e liberação no Avançado
 * 6. Vinculação do perfil de CRM na mesma conta sem necessidade de novo cadastro
 */

import { handleApiRequest } from "../api/router";

async function runSubscriptionTestSuite() {
  console.log("================================================================================");
  console.log("INICIANDO SUÍTE DE TESTES: PLANOS ESSENCIAL E AVANÇADO (SEM PREMIUM)");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  try {
    const parseRes = async (res: Response | null) => {
      if (!res) return null;
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    };

    // -------------------------------------------------------------------------
    // TESTE 1: Tabela de Planos Pública (Exatamente 2 planos: Essencial e Avançado)
    // -------------------------------------------------------------------------
    const plansReq = new Request("http://localhost:3000/api/plans", { method: "GET" });
    const plansRes = await handleApiRequest(plansReq);
    assert(
      plansRes !== null && plansRes.status === 200,
      "1.1 Rota pública de planos retorna 200 OK",
    );
    const plansData = await parseRes(plansRes);
    assert(
      Array.isArray(plansData.plans) && plansData.plans.length === 2,
      "1.2 Retorna exatamente os 2 planos disponíveis (Essencial e Avançado)",
    );

    type TestPlan = {
      id: string;
      precoBaseMensal: number;
      temCrm: boolean;
      perfisUsuarioInclusos: number;
      perfisCrmInclusos: number;
    };
    const plansList = plansData.plans as TestPlan[];
    const essencial = plansList.find((p) => p.id === "plano_essencial");
    const avancado = plansList.find((p) => p.id === "plano_avancado");
    const premium = plansList.find((p) => p.id === "plano_premium");

    assert(
      Boolean(essencial && essencial.precoBaseMensal === 39.9 && essencial.temCrm === false),
      "1.3 Plano Essencial configurado a R$ 39,90 com 1 médico + 1 atendente e sem CRM",
    );
    assert(
      Boolean(
        avancado &&
        avancado.precoBaseMensal === 49.9 &&
        avancado.temCrm === true &&
        avancado.perfisCrmInclusos === 1,
      ),
      "1.4 Plano Avançado configurado a R$ 49,90 com 1 CRM incluso na mesma conta",
    );
    assert(premium === undefined, "1.5 Plano Premium removido completamente de toda a aplicação");

    // -------------------------------------------------------------------------
    // TESTE 2: Registro de Usuário e Degustação Gratuita (Plano Essencial Trial)
    // -------------------------------------------------------------------------
    const userEmail = `clinica.teste.${Date.now()}@cardio.com.br`;
    const regReq = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Dr. Carlos Teste",
        email: userEmail,
        password: "Password@123",
        crm: "SP-888999",
      }),
    });
    const regRes = await handleApiRequest(regReq);
    assert(regRes !== null && regRes.status === 201, "2.1 Cadastro de novo usuário titular");
    const regData = await parseRes(regRes);
    const token = regData.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Resumo de Assinatura deve iniciar em Degustação Gratuita do Plano Essencial
    const subRes = await handleApiRequest(
      new Request("http://localhost:3000/api/subscriptions/my", {
        headers: authHeaders,
      }),
    );
    assert(subRes !== null && subRes.status === 200, "2.2 Obtenção do resumo de assinatura");
    const subData = await parseRes(subRes);
    assert(
      subData.subscription.planId === "plano_essencial" && subData.subscription.status === "trial",
      "2.3 1º mês 100% gratuito (Status: trial no Plano Essencial)",
    );

    // -------------------------------------------------------------------------
    // TESTE 3: Criação de Perfil de Atendente no Plano Essencial
    // -------------------------------------------------------------------------
    const atendenteRes = await handleApiRequest(
      new Request("http://localhost:3000/api/profiles", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          nome: "Mariana Secretária (Atendente)",
          email: `atendente.${Date.now()}@cardio.com.br`,
          role: "recepcionista",
          avatarColor: "#10B981",
        }),
      }),
    );
    assert(
      atendenteRes !== null && atendenteRes.status === 201,
      "3.1 Criação do 1 perfil de atendente no Plano Essencial permitida",
    );

    // -------------------------------------------------------------------------
    // TESTE 4: Bloqueio de CRM no Plano Essencial
    // -------------------------------------------------------------------------
    const crmBlockRes = await handleApiRequest(
      new Request("http://localhost:3000/api/crm/status", {
        headers: authHeaders,
      }),
    );
    assert(
      crmBlockRes !== null && crmBlockRes.status === 403,
      "4.1 Módulo CRM bloqueado no Plano Essencial com 403 Forbidden",
    );

    // -------------------------------------------------------------------------
    // TESTE 5: Upgrade para Plano Avançado (R$ 49,90)
    // -------------------------------------------------------------------------
    const checkoutAvancadoRes = await handleApiRequest(
      new Request("http://localhost:3000/api/subscriptions/checkout", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          planId: "plano_avancado",
          billingCycle: "mensal",
          metodoPagamento: "pix",
        }),
      }),
    );
    assert(
      checkoutAvancadoRes !== null && checkoutAvancadoRes.status === 200,
      "5.1 Upgrade para Plano Avançado efetuado com sucesso",
    );

    // Rota de CRM liberada
    const crmAllowRes = await handleApiRequest(
      new Request("http://localhost:3000/api/crm/status", {
        headers: authHeaders,
      }),
    );
    assert(
      crmAllowRes !== null && crmAllowRes.status === 200,
      "5.2 Módulo CRM liberado com sucesso no Plano Avançado",
    );

    // -------------------------------------------------------------------------
    // TESTE 6: Perfil de CRM na Mesma Conta (Sem criar conta novamente)
    // -------------------------------------------------------------------------
    const profilesRes = await handleApiRequest(
      new Request("http://localhost:3000/api/profiles", {
        headers: authHeaders,
      }),
    );
    const profilesData = await parseRes(profilesRes);
    const hasCrmProfile = (profilesData.profiles as { tipo?: string; role?: string }[]).some(
      (p) => p.tipo === "crm" || p.role === "crm_admin",
    );
    assert(
      hasCrmProfile === true,
      "6.1 Perfil de CRM integrado diretamente na mesma conta sem criar nova conta",
    );
  } catch (error) {
    console.error("ERRO INESPERADO NA SUÍTE DE TESTES:", error);
    failed++;
  }

  console.log("\n================================================================================");
  console.log(`RESUMO DOS TESTES DE ASSINATURAS:`);
  console.log(`Total de testes executados: ${passed + failed}`);
  console.log(`Aprovados: ${passed}`);
  console.log(`Falhos: ${failed}`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSubscriptionTestSuite();
