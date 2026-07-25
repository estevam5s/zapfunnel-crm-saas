import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"
export const STAGES = ["novo", "em_conversa", "qualificado", "proposta", "ganho", "perdido"] as const

// Semeia leads a partir das conversas reais (uma vez), para o funil não ficar vazio.
async function autoSeed(db: any, userId: string) {
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId)
  if ((count || 0) > 0) return
  const { data: convs } = await db.from("conversations").select("id,contact_id,last_message_at,contact:contacts(name,phone)").eq("user_id", userId).order("last_message_at", { ascending: false }).limit(100)
  if (!convs?.length) return
  const rows = convs.map((c: any, i: number) => ({
    user_id: userId, contact_id: c.contact_id, conversation_id: c.id,
    name: c.contact?.name || c.contact?.phone || "Contato", phone: c.contact?.phone || null,
    stage: "novo", value: 0, position: i,
  }))
  for (let i = 0; i < rows.length; i += 200) await db.from("leads").insert(rows.slice(i, i + 200))
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  try { await autoSeed(db, user.id) } catch { /* noop */ }
  const { data } = await db.from("leads").select("*").eq("user_id", user.id).order("position")
  return NextResponse.json({ leads: data || [] })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const body = await req.json().catch(() => ({}))
  if (!body.name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
  const { data, error } = await db.from("leads").insert({
    user_id: user.id, name: body.name, phone: body.phone || null,
    stage: STAGES.includes(body.stage) ? body.stage : "novo", value: Math.round(body.value || 0), note: body.note || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ lead: data })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const patch: any = { updated_at: new Date().toISOString() }
  for (const k of ["name", "phone", "stage", "value", "note", "position"]) if (body[k] !== undefined) patch[k] = body[k]
  const { data, error } = await db.from("leads").update(patch).eq("id", body.id).eq("user_id", user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ lead: data })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  await db.from("leads").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
