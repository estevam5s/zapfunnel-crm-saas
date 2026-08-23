import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { evoEditText, evoDeleteMessage } from "@/lib/evolution"

export const dynamic = "force-dynamic"

async function resolve(db: any, userId: string, messageId: string) {
  const { data: msg } = await db.from("messages").select("*").eq("id", messageId).eq("user_id", userId).maybeSingle()
  if (!msg) return null
  const { data: conv } = await db.from("conversations").select("contact_id,connection_id").eq("id", msg.conversation_id).maybeSingle()
  const { data: contact } = conv ? await db.from("contacts").select("wa_id,phone").eq("id", conv.contact_id).maybeSingle() : { data: null }
  let session: any = {}
  if (conv?.connection_id) { const { data } = await db.from("wa_connections").select("session").eq("id", conv.connection_id).maybeSingle(); session = data?.session || {} }
  const to = contact?.wa_id || contact?.phone || ""
  const evo = session.provider === "evolution" && session.url && session.key && session.instance
    ? { creds: { url: session.url, key: session.key }, instance: session.instance } : null
  return { msg, to, evo }
}

// PATCH — edita o corpo de uma mensagem enviada
export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id, body } = await req.json().catch(() => ({}))
  if (!id || !body?.trim()) return NextResponse.json({ error: "id e body obrigatórios" }, { status: 400 })
  const db = createAdminClient()
  const r = await resolve(db, user.id, id)
  if (!r) return NextResponse.json({ error: "mensagem não encontrada" }, { status: 404 })
  if (r.msg.direction !== "out") return NextResponse.json({ error: "só é possível editar mensagens enviadas" }, { status: 400 })

  if (r.evo && r.msg.wa_message_id) {
    await evoEditText(r.evo.creds, r.evo.instance, r.to, r.msg.wa_message_id, body.trim())
  }
  const { data } = await db.from("messages").update({ body: body.trim(), edited_at: new Date().toISOString() }).eq("id", id).select().single()
  return NextResponse.json({ message: data })
}

// DELETE — apaga (para todos, quando conectado) e marca como excluída
export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const r = await resolve(db, user.id, id)
  if (!r) return NextResponse.json({ error: "mensagem não encontrada" }, { status: 404 })

  if (r.evo && r.msg.wa_message_id) {
    await evoDeleteMessage(r.evo.creds, r.evo.instance, r.to, r.msg.wa_message_id)
  }
  await db.from("messages").update({ deleted: true, body: "" }).eq("id", id)
  return NextResponse.json({ ok: true })
}
