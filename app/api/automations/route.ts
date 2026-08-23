import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("automations").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  return NextResponse.json({ automations: data || [] })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  if (!body.name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db
    .from("automations")
    .insert({
      user_id: user.id,
      name: body.name,
      description: body.description || null,
      trigger_type: body.trigger_type || "new_message",
      trigger_config: body.trigger_config || {},
      actions: body.actions || [],
      is_active: body.is_active ?? false,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ automation: data })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id, ...patch } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const allowed: any = {}
  for (const k of ["name", "description", "trigger_type", "trigger_config", "actions", "is_active"]) {
    if (k in patch) allowed[k] = patch[k]
  }
  const { data, error } = await db.from("automations").update(allowed).eq("id", id).eq("user_id", user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ automation: data })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  await db.from("automations").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
