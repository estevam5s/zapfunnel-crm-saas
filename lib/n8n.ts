// Integração com o N8N (motor de automação, hospedado na VPS do admin).
//
// IMPORTANTE: TUDO aqui roda apenas no servidor. A URL da API e a API key ficam
// em variáveis de ambiente e NUNCA são enviadas ao cliente. Os usuários do
// ZapFunnel só interagem com o builder visual — eles nunca veem o N8N nem têm
// acesso aos workflows/credenciais privados do admin.

const API_URL = process.env.N8N_API_URL || ""
const API_KEY = process.env.N8N_API_KEY || ""
const WEBHOOK_BASE = process.env.N8N_WEBHOOK_BASE || ""

// Prefixo que isola os workflows criados pelo ZapFunnel dos workflows privados do admin.
const TAG = "zapfunnel"

export function n8nEnabled(): boolean {
  return !!(API_URL && API_KEY)
}

function headers() {
  return { "X-N8N-API-KEY": API_KEY, "Content-Type": "application/json" }
}

async function n8nFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers || {}) },
    // não deixa a chamada pendurar a request do usuário
    signal: AbortSignal.timeout(12000),
  })
  return res
}

/** Verifica se o motor de automação está disponível (sem expor nada além de um booleano). */
export async function n8nHealth(): Promise<boolean> {
  if (!n8nEnabled()) return false
  try {
    const res = await n8nFetch("/workflows?limit=1")
    return res.ok
  } catch {
    return false
  }
}

/**
 * Dispara um webhook do N8N para executar a lógica pesada de um fluxo/automação.
 * O `path` identifica o workflow-motor genérico do ZapFunnel no N8N (ex.: "zapfunnel-flow").
 * Retorna best-effort — nunca lança para não quebrar o fluxo do usuário.
 */
export async function n8nTrigger(path: string, payload: Record<string, unknown>): Promise<{ ok: boolean; data?: any }> {
  if (!WEBHOOK_BASE) return { ok: false }
  try {
    const res = await fetch(`${WEBHOOK_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data }
  } catch {
    return { ok: false }
  }
}

/**
 * Cria (ou atualiza) um workflow no N8N que representa um fluxo do usuário.
 * O workflow é marcado com o `TAG` e o id do usuário, isolando-o dos demais.
 * Retorna o id do workflow no N8N (para guardar na tabela flows) ou null.
 */
export async function n8nUpsertFlowWorkflow(opts: {
  userId: string
  flowId: string
  name: string
  webhookPath: string
}): Promise<string | null> {
  if (!n8nEnabled()) return null
  const wfName = `${TAG}:${opts.userId.slice(0, 8)}:${opts.name}`.slice(0, 120)
  // Workflow-motor mínimo: um nó Webhook de entrada. A lógica real é orquestrada
  // pelo backend do ZapFunnel; o N8N serve como executor/rastreador profissional.
  const body = {
    name: wfName,
    nodes: [
      {
        parameters: { httpMethod: "POST", path: opts.webhookPath, responseMode: "onReceived" },
        id: "webhook",
        name: "ZapFunnel Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300],
      },
    ],
    connections: {},
    settings: {},
  }
  try {
    const res = await n8nFetch("/workflows", { method: "POST", body: JSON.stringify(body) })
    if (!res.ok) return null
    const data = await res.json()
    return data?.id ? String(data.id) : null
  } catch {
    return null
  }
}

/** Ativa ou desativa um workflow do usuário no N8N. */
export async function n8nSetActive(workflowId: string, active: boolean): Promise<boolean> {
  if (!n8nEnabled() || !workflowId) return false
  try {
    const res = await n8nFetch(`/workflows/${workflowId}/${active ? "activate" : "deactivate"}`, { method: "POST" })
    return res.ok
  } catch {
    return false
  }
}

/** Remove um workflow do usuário no N8N (ao excluir o fluxo). */
export async function n8nDeleteWorkflow(workflowId: string): Promise<boolean> {
  if (!n8nEnabled() || !workflowId) return false
  try {
    const res = await n8nFetch(`/workflows/${workflowId}`, { method: "DELETE" })
    return res.ok
  } catch {
    return false
  }
}
