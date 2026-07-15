// Integração com Evolution API (gateway WhatsApp open-source) para pareamento por QR.
export type EvoCreds = { url: string; key: string }

export function envEvolution(): EvoCreds | null {
  const url = process.env.EVOLUTION_API_URL || ""
  const key = process.env.EVOLUTION_API_KEY || ""
  if (!url || !key) return null
  return { url: url.replace(/\/+$/, ""), key }
}

function headers(key: string) {
  return { "Content-Type": "application/json", apikey: key }
}

async function fetchT(url: string, init: RequestInit = {}, ms = 12000): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try { return await fetch(url, { ...init, signal: ctrl.signal }) } finally { clearTimeout(t) }
}

export async function createInstance(creds: EvoCreds, instanceName: string, webhookUrl?: string) {
  const base = creds.url.replace(/\/+$/, "")
  const body: Record<string, unknown> = { instanceName, qrcode: true, integration: "WHATSAPP-BAILEYS" }
  if (webhookUrl) body.webhook = { url: webhookUrl, byEvents: false, base64: true, events: ["MESSAGES_UPSERT", "CONTACTS_UPSERT", "CHATS_UPSERT", "CONNECTION_UPDATE"] }
  const res = await fetchT(`${base}/instance/create`, { method: "POST", headers: headers(creds.key), body: JSON.stringify(body) })
  const json = await res.json().catch(() => ({}))
  if (res.ok) return { ok: true, qr: json?.qrcode?.base64 || null, raw: json }
  if (res.status === 403 || res.status === 409 || /already in use|exists/i.test(JSON.stringify(json))) return connectInstance(creds, instanceName)
  return { ok: false, error: json?.response?.message || json?.message || `Evolution ${res.status}` }
}

export async function connectInstance(creds: EvoCreds, instanceName: string) {
  const base = creds.url.replace(/\/+$/, "")
  const res = await fetchT(`${base}/instance/connect/${encodeURIComponent(instanceName)}`, { headers: headers(creds.key) })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: json?.message || `Evolution ${res.status}` }
  return { ok: true, qr: json?.base64 || json?.qrcode?.base64 || null, raw: json }
}

export async function connectionState(creds: EvoCreds, instanceName: string): Promise<string> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/instance/connectionState/${encodeURIComponent(instanceName)}`, { headers: headers(creds.key) })
    const json = await res.json().catch(() => ({}))
    return json?.instance?.state || json?.state || "close"
  } catch { return "close" }
}

export async function evoSendText(creds: EvoCreds, instanceName: string, number: string, text: string): Promise<string> {
  const base = creds.url.replace(/\/+$/, "")
  const res = await fetchT(`${base}/message/sendText/${encodeURIComponent(instanceName)}`, {
    method: "POST", headers: headers(creds.key), body: JSON.stringify({ number: number.replace(/\D/g, ""), text }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || `Evolution ${res.status}`)
  return json?.key?.id || ""
}

export async function logoutInstance(creds: EvoCreds, instanceName: string) {
  const base = creds.url.replace(/\/+$/, "")
  try { await fetchT(`${base}/instance/logout/${encodeURIComponent(instanceName)}`, { method: "DELETE", headers: headers(creds.key) }) } catch { /* noop */ }
}

// ── Ações de mensagem (edição, exclusão, presença de digitação) ──────────────
// Todas são best-effort: quando não há WhatsApp conectado, apenas não fazem nada
// (o banco é a fonte da verdade para a UI). Endpoints da Evolution API v2.
export async function evoEditText(creds: EvoCreds, instanceName: string, number: string, waMessageId: string, newText: string): Promise<boolean> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/updateMessage/${encodeURIComponent(instanceName)}`, {
      method: "POST", headers: headers(creds.key),
      body: JSON.stringify({ number: number.replace(/\D/g, ""), key: { id: waMessageId, fromMe: true }, text: newText }),
    })
    return res.ok
  } catch { return false }
}

export async function evoDeleteMessage(creds: EvoCreds, instanceName: string, number: string, waMessageId: string): Promise<boolean> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/deleteMessageForEveryone/${encodeURIComponent(instanceName)}`, {
      method: "DELETE", headers: headers(creds.key),
      body: JSON.stringify({ id: waMessageId, fromMe: true, remoteJid: `${number.replace(/\D/g, "")}@s.whatsapp.net` }),
    })
    return res.ok
  } catch { return false }
}

export async function evoSendPresence(creds: EvoCreds, instanceName: string, number: string, presence: "composing" | "paused" = "composing"): Promise<boolean> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/sendPresence/${encodeURIComponent(instanceName)}`, {
      method: "POST", headers: headers(creds.key),
      body: JSON.stringify({ number: number.replace(/\D/g, ""), presence, delay: 1200 }),
    })
    return res.ok
  } catch { return false }
}

export async function evoMarkRead(creds: EvoCreds, instanceName: string, number: string, waMessageId: string): Promise<boolean> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/markMessageAsRead/${encodeURIComponent(instanceName)}`, {
      method: "POST", headers: headers(creds.key),
      body: JSON.stringify({ readMessages: [{ id: waMessageId, fromMe: false, remoteJid: `${number.replace(/\D/g, "")}@s.whatsapp.net` }] }),
    })
    return res.ok
  } catch { return false }
}

// ── Histórico (contatos + conversas) ao conectar ──────────────────────────────
export type EvoContact = { jid: string; name: string; phone: string; avatar: string }
export type EvoChat = { jid: string; name: string; lastText: string; lastAt: string | null; fromMe: boolean; avatar: string }

function jidToPhone(jid: string) { return String(jid || "").split("@")[0].split(":")[0] }
function isIndividual(jid: string) { return !!jid && jid.endsWith("@s.whatsapp.net") }

export async function fetchInstancePhone(creds: EvoCreds, instanceName: string): Promise<string | null> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`, { headers: headers(creds.key) })
    const json = await res.json().catch(() => [])
    const arr = Array.isArray(json) ? json : [json]
    const it: any = arr.find((x: any) => (x?.instance?.instanceName || x?.name) === instanceName) || arr[0]
    const owner = it?.instance?.owner || it?.ownerJid || it?.owner || null
    return owner ? jidToPhone(owner) : null
  } catch { return null }
}

export async function findContacts(creds: EvoCreds, instanceName: string): Promise<EvoContact[]> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/findContacts/${encodeURIComponent(instanceName)}`, { method: "POST", headers: headers(creds.key), body: JSON.stringify({}) }, 20000)
    const json = await res.json().catch(() => [])
    const arr: any[] = Array.isArray(json) ? json : (json?.contacts || json?.data || [])
    return arr.map((c) => {
      const jid = c?.remoteJid || c?.id || c?.jid || ""
      return { jid, name: c?.pushName || c?.name || jidToPhone(jid), phone: jidToPhone(jid), avatar: c?.profilePicUrl || "" }
    }).filter((c) => isIndividual(c.jid))
  } catch { return [] }
}

export async function findChats(creds: EvoCreds, instanceName: string): Promise<EvoChat[]> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/findChats/${encodeURIComponent(instanceName)}`, { method: "POST", headers: headers(creds.key), body: JSON.stringify({}) }, 20000)
    const json = await res.json().catch(() => [])
    const arr: any[] = Array.isArray(json) ? json : (json?.chats || json?.data || [])
    return arr.map((c) => {
      const jid = c?.remoteJid || c?.id || c?.jid || ""
      const lm = c?.lastMessage || c?.last_message || {}
      const msg = lm?.message || {}
      const text = msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || lm?.body || ""
      const ts = lm?.messageTimestamp || c?.updatedAt || c?.updated_at || null
      return {
        jid, name: c?.pushName || c?.name || jidToPhone(jid),
        lastText: text, fromMe: !!(lm?.key?.fromMe),
        lastAt: ts ? new Date(typeof ts === "number" ? ts * 1000 : ts).toISOString() : null,
        avatar: c?.profilePicUrl || "",
      }
      // inclui chats individuais (@s.whatsapp.net) E os do novo formato @lid; exclui só grupos
    }).filter((c) => !!c.jid && !c.jid.endsWith("@g.us"))
  } catch { return [] }
}

export type EvoMessage = { id: string; fromMe: boolean; body: string; ts: string | null }

export async function findMessages(creds: EvoCreds, instanceName: string, remoteJid: string, limit = 40): Promise<EvoMessage[]> {
  const base = creds.url.replace(/\/+$/, "")
  try {
    const res = await fetchT(`${base}/chat/findMessages/${encodeURIComponent(instanceName)}`, {
      method: "POST", headers: headers(creds.key), body: JSON.stringify({ where: { key: { remoteJid } } }),
    }, 20000)
    const json = await res.json().catch(() => ({}))
    const recs: any[] = json?.messages?.records || json?.messages || (Array.isArray(json) ? json : [])
    return recs.map((m) => {
      const k = m?.key || {}; const msg = m?.message || {}
      const body = msg?.conversation || msg?.extendedTextMessage?.text || msg?.imageMessage?.caption || msg?.videoMessage?.caption
        || (msg?.audioMessage ? "[áudio]" : "") || (msg?.imageMessage ? "[imagem]" : "") || (msg?.documentMessage ? "[documento]" : "") || ""
      const ts = m?.messageTimestamp || null
      return { id: k?.id || "", fromMe: !!k?.fromMe, body, ts: ts ? new Date(typeof ts === "number" ? ts * 1000 : ts).toISOString() : null }
    }).filter((m) => !!m.body)
  } catch { return [] }
}
