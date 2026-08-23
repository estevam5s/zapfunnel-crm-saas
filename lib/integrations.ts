import { createHash, randomBytes } from "crypto"
import { createAdminClient } from "@/lib/supabase"

// Limites por plano — API keys e webhooks funcionam em TODOS os planos, com teto.
// -1 = ilimitado.
export const PLAN_LIMITS: Record<string, { apiKeys: number; webhooks: number }> = {
  inicial: { apiKeys: 1, webhooks: 1 },
  starter: { apiKeys: 2, webhooks: 3 },
  pro: { apiKeys: 5, webhooks: 10 },
  enterprise: { apiKeys: -1, webhooks: -1 },
  admin: { apiKeys: -1, webhooks: -1 },
}

export function limitsFor(planSlug?: string | null) {
  return PLAN_LIMITS[(planSlug || "inicial").toLowerCase()] ?? PLAN_LIMITS.inicial
}

export type ApiKey = { id: string; name: string; prefix: string; hash: string; created_at: string; last_used_at: string | null }
export type Webhook = { id: string; url: string; events: string[]; secret: string; active: boolean; created_at: string; last_status: number | null; last_delivery_at: string | null }
type Settings = { api_keys?: ApiKey[]; webhooks?: Webhook[]; [k: string]: unknown }

export function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex")
}
export function newId() {
  return randomBytes(12).toString("hex")
}

/** Gera uma nova chave "zap_live_..." e devolve a chave em claro + o registro (com hash). */
export function generateApiKey(name: string): { plain: string; record: ApiKey } {
  const raw = randomBytes(24).toString("base64url")
  const plain = `zap_live_${raw}`
  const prefix = plain.slice(0, 12) // zap_live_XXX
  return {
    plain,
    record: { id: newId(), name: name || "Chave de API", prefix, hash: sha256(plain), created_at: new Date().toISOString(), last_used_at: null },
  }
}

/** Lê profiles.settings do usuário (com plano). */
export async function getProfileSettings(userId: string): Promise<{ planSlug: string; settings: Settings }> {
  const db = createAdminClient()
  const { data } = await db.from("profiles").select("plan_slug, settings").eq("id", userId).maybeSingle()
  return { planSlug: data?.plan_slug || "inicial", settings: (data?.settings as Settings) || {} }
}

/** Persiste settings mesclando com o existente. */
export async function saveProfileSettings(userId: string, patch: Settings) {
  const db = createAdminClient()
  const { data } = await db.from("profiles").select("settings").eq("id", userId).maybeSingle()
  const merged = { ...((data?.settings as Settings) || {}), ...patch }
  await db.from("profiles").update({ settings: merged }).eq("id", userId)
  return merged
}

/** Localiza o dono de uma API key (para a API pública v1). */
export async function findKeyOwner(plainKey: string): Promise<{ userId: string; keyId: string } | null> {
  const hash = sha256(plainKey)
  const db = createAdminClient()
  // busca via filtro JSON no array settings.api_keys
  const { data } = await db.from("profiles").select("id, settings").not("settings", "is", null).limit(5000)
  for (const row of data || []) {
    const keys = ((row.settings as Settings)?.api_keys || []) as ApiKey[]
    const k = keys.find((x) => x.hash === hash)
    if (k) return { userId: row.id, keyId: k.id }
  }
  return null
}

export async function touchKeyUsage(userId: string, keyId: string) {
  const { settings } = await getProfileSettings(userId)
  const keys = (settings.api_keys || []).map((k) => (k.id === keyId ? { ...k, last_used_at: new Date().toISOString() } : k))
  await saveProfileSettings(userId, { api_keys: keys })
}
