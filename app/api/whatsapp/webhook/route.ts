import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Recebe eventos da Evolution API (messages.upsert) e grava contato + conversa + mensagem.
async function ingest(db: any, ownerId: string, connId: string | null, waId: string, name: string, text: string, waMsgId?: string) {
  const { data: contact } = await db.from("contacts").upsert(
    { user_id: ownerId, wa_id: waId, name: name || waId, phone: waId, updated_at: new Date().toISOString() },
    { onConflict: "user_id,wa_id" },
  ).select("id").single()
  if (!contact) return
  const { data: existing } = await db.from("conversations").select("id").eq("user_id", ownerId).eq("contact_id", contact.id).maybeSingle()
  let convId = existing?.id
  if (existing) await db.from("conversations").update({ last_message: text, last_message_at: new Date().toISOString(), unread: 1, status: "open" }).eq("id", convId)
  else { const { data: nc } = await db.from("conversations").insert({ user_id: ownerId, contact_id: contact.id, connection_id: connId, last_message: text, last_message_at: new Date().toISOString(), unread: 1, status: "open" }).select("id").single(); convId = nc?.id }
  if (convId) await db.from("messages").insert({ user_id: ownerId, conversation_id: convId, direction: "in", body: text, wa_message_id: waMsgId, status: "delivered" })
}

export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch { return NextResponse.json({ ok: true }) }
  const db = createAdminClient()
  if (payload?.event && (payload?.instance || payload?.data)) {
    try {
      const evt = String(payload.event).toLowerCase().replace(/\./g, "_")
      const { data: conn } = await db.from("wa_connections").select("id,user_id").eq("qr_token", payload.instance).maybeSingle()

      if (evt === "messages_upsert" && conn) {
        const items = Array.isArray(payload.data) ? payload.data : [payload.data]
        for (const m of items) {
          const key = m?.key || {}
          if (key.fromMe) continue
          const jid = key.remoteJid || ""
          if (!jid || jid.endsWith("@g.us")) continue
          const waId = jid.split("@")[0].split(":")[0]
          const text = m?.message?.conversation || m?.message?.extendedTextMessage?.text || m?.message?.imageMessage?.caption || `[${m?.messageType || "mensagem"}]`
          await ingest(db, conn.user_id, conn.id, waId, m?.pushName || waId, text, key.id)
        }
      }

      // Confirmações de leitura/entrega: atualiza o status das mensagens enviadas (✓ / ✓✓ / lido).
      else if (evt === "messages_update" && conn) {
        const items = Array.isArray(payload.data) ? payload.data : [payload.data]
        for (const u of items) {
          const waMsgId = u?.key?.id || u?.keyId
          const st = String(u?.update?.status || u?.status || "").toUpperCase()
          if (!waMsgId) continue
          const status = st.includes("READ") || st === "4" ? "read" : st.includes("DELIVERY") || st === "3" ? "delivered" : st.includes("SERVER") || st === "2" ? "sent" : null
          if (status) await db.from("messages").update({ status }).eq("wa_message_id", waMsgId).eq("user_id", conn.user_id)
        }
      }

      // Digitação do contato: grava uma janela curta (typing_until) na conversa.
      else if (evt === "presence_update" && conn) {
        const jid = payload?.data?.id || payload?.data?.remoteJid || ""
        const presences = payload?.data?.presences || {}
        const isTyping = Object.values(presences).some((p: any) => ["composing", "recording"].includes(p?.lastKnownPresence))
        if (jid && !jid.endsWith("@g.us")) {
          const waId = jid.split("@")[0].split(":")[0]
          const { data: contact } = await db.from("contacts").select("id").eq("user_id", conn.user_id).eq("wa_id", waId).maybeSingle()
          if (contact) {
            const until = isTyping ? new Date(Date.now() + 8000).toISOString() : new Date(0).toISOString()
            await db.from("conversations").update({ typing_until: until }).eq("user_id", conn.user_id).eq("contact_id", contact.id)
          }
        }
      }

      // Exclusão para todos: marca a mensagem como excluída.
      else if ((evt === "messages_delete" || evt === "message_delete") && conn) {
        const items = Array.isArray(payload.data) ? payload.data : [payload.data]
        for (const d of items) {
          const waMsgId = d?.key?.id || d?.id
          if (waMsgId) await db.from("messages").update({ deleted: true, body: "" }).eq("wa_message_id", waMsgId).eq("user_id", conn.user_id)
        }
      }
    } catch { /* noop */ }
  }
  return NextResponse.json({ received: true })
}
