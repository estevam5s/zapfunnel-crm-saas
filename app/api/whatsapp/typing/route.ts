import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { evoSendPresence } from "@/lib/evolution"

export const dynamic = "force-dynamic"

// POST — envia presença "digitando" para o contato da conversa (best-effort).
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { conversation_id, state } = await req.json().catch(() => ({}))
  if (!conversation_id) return NextResponse.json({ error: "conversation_id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data: conv } = await db.from("conversations").select("contact_id,connection_id").eq("id", conversation_id).eq("user_id", user.id).maybeSingle()
  if (!conv) return NextResponse.json({ ok: false })
  const { data: contact } = await db.from("contacts").select("wa_id,phone").eq("id", conv.contact_id).maybeSingle()
  const to = contact?.wa_id || contact?.phone
  let session: any = {}
  if (conv.connection_id) { const { data } = await db.from("wa_connections").select("session").eq("id", conv.connection_id).maybeSingle(); session = data?.session || {} }
  if (to && session.provider === "evolution" && session.url && session.key && session.instance) {
    await evoSendPresence({ url: session.url, key: session.key }, session.instance, to, state === "paused" ? "paused" : "composing")
  }
  return NextResponse.json({ ok: true })
}
