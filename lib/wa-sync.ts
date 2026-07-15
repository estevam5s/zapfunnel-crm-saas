// Sincroniza contatos + conversas (e histórico de mensagens) do WhatsApp conectado
// para o CRM, a partir da Evolution API. Robusto a @lid (novo formato de ID do WhatsApp)
// e resiliente (erros por chat não interrompem o resto).
import { EvoCreds, findContacts, findChats, findMessages } from "@/lib/evolution"

const localpart = (jid: string) => String(jid || "").split("@")[0].split(":")[0]

export type SyncResult = { contacts: number; conversations: number; messages: number }

export async function syncHistory(
  db: any, userId: string, connId: string, creds: EvoCreds, instance: string,
  opts: { withMessages?: boolean; maxChats?: number } = {},
): Promise<SyncResult> {
  const withMessages = opts.withMessages !== false
  const maxChats = opts.maxChats ?? 25
  const res: SyncResult = { contacts: 0, conversations: 0, messages: 0 }

  // 1) Contatos (nome + foto por telefone) — só @s.whatsapp.net têm telefone/nome
  const contacts = await findContacts(creds, instance)
  const nameByPhone = new Map<string, string>()
  const avatarByPhone = new Map<string, string>()
  const crows = contacts.map((c) => {
    nameByPhone.set(c.phone, c.name); if (c.avatar) avatarByPhone.set(c.phone, c.avatar)
    // chaves UNIFORMES em todas as linhas (PostgREST rejeita bulk upsert com chaves diferentes)
    return { user_id: userId, wa_id: c.phone, name: c.name, phone: c.phone, avatar_url: c.avatar || null }
  })
  for (let i = 0; i < crows.length; i += 500) {
    try { await db.from("contacts").upsert(crows.slice(i, i + 500), { onConflict: "user_id,wa_id" }) } catch { /* noop */ }
  }
  res.contacts = crows.length

  // 2) Conversas a partir dos chats (inclui @lid); histórico de mensagens nos mais recentes
  const chats = (await findChats(creds, instance)).sort((a, b) => (b.lastAt || "").localeCompare(a.lastAt || ""))
  let idx = 0
  for (const ch of chats) {
    const i = idx++
    const jid = ch.jid
    if (!jid || jid.endsWith("@g.us")) continue
    const wa = localpart(jid)
    const isLid = jid.endsWith("@lid")
    const name = nameByPhone.get(wa) || ch.name || wa
    const avatar = avatarByPhone.get(wa) || ch.avatar || ""
    try {
      await db.from("contacts").upsert([{ user_id: userId, wa_id: wa, name, phone: isLid ? null : wa, avatar_url: avatar || null }], { onConflict: "user_id,wa_id" })
      const { data: got } = await db.from("contacts").select("id").eq("user_id", userId).eq("wa_id", wa).maybeSingle()
      if (!got) continue
      const cid = got.id
      const lastAt = ch.lastAt || new Date().toISOString()
      const { data: existing } = await db.from("conversations").select("id").eq("user_id", userId).eq("contact_id", cid).maybeSingle()
      let convId = existing?.id
      if (existing) {
        await db.from("conversations").update({ last_message: ch.lastText || "", last_message_at: lastAt, connection_id: connId }).eq("id", convId)
      } else {
        const { data: nc } = await db.from("conversations").insert({
          user_id: userId, contact_id: cid, connection_id: connId, last_message: ch.lastText || "", last_message_at: lastAt, unread: 0, status: "open",
        }).select("id").single()
        convId = nc?.id
      }
      res.conversations++
      if (!convId) continue
      // histórico de mensagens (só se ainda não houver e for um dos chats mais recentes)
      const { data: hasMsg } = await db.from("messages").select("id").eq("conversation_id", convId).limit(1).maybeSingle()
      if (hasMsg) continue
      if (withMessages && i < maxChats) {
        const msgs = (await findMessages(creds, instance, jid)).sort((a, b) => (a.ts || "").localeCompare(b.ts || "")).slice(-40)
        const batch = msgs.map((m) => ({ user_id: userId, conversation_id: convId, direction: m.fromMe ? "out" : "in", body: m.body, wa_message_id: m.id || null, status: "delivered" }))
        if (batch.length) { try { await db.from("messages").insert(batch); res.messages += batch.length } catch { /* noop */ } }
      } else if (ch.lastText) {
        try { await db.from("messages").insert({ user_id: userId, conversation_id: convId, direction: ch.fromMe ? "out" : "in", body: ch.lastText, status: "delivered" }); res.messages++ } catch { /* noop */ }
      }
    } catch { /* um chat com erro não interrompe os demais */ }
  }
  return res
}
