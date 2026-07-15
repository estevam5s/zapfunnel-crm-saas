import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { evoSendText } from "@/lib/evolution"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { conversation_id, body } = await req.json().catch(() => ({}))
  if (!conversation_id || !body) return NextResponse.json({ error: "conversation_id e body obrigatórios" }, { status: 400 })

  const db = createAdminClient()
  const { data: conv } = await db.from("conversations").select("id,contact_id,connection_id").eq("id", conversation_id).eq("user_id", user.id).maybeSingle()
  if (!conv) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
  const { data: contact } = await db.from("contacts").select("wa_id,phone").eq("id", conv.contact_id).single()
  const to = contact?.wa_id || contact?.phone
  if (!to) return NextResponse.json({ error: "Contato sem número" }, { status: 400 })

  let conn: any = null
  if (conv.connection_id) { const { data } = await db.from("wa_connections").select("session,status").eq("id", conv.connection_id).maybeSingle(); conn = data }
  const session: any = conn?.session || {}
  let waMsgId = "", status = "sent", warn: string | undefined
  if (session.provider === "evolution") {
    try { waMsgId = await evoSendText({ url: session.url, key: session.key }, session.instance, to, body) }
    catch (e: any) { status = "failed"; warn = e.message }
  } else warn = "Conexão sem WhatsApp por QR — mensagem registrada, mas não enviada."

  const { data: saved } = await db.from("messages").insert({ user_id: user.id, conversation_id, direction: "out", body, wa_message_id: waMsgId || null, status }).select().single()
  await db.from("conversations").update({ last_message: body, last_message_at: new Date().toISOString(), unread: 0 }).eq("id", conversation_id)
  return NextResponse.json({ message: saved, warning: warn })
}
