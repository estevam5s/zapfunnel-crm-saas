import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"
const FIELDS = ["slug","name","description","category","domain","status","price_month","price_year","price_lifetime","customers","mrr","arr","revenue_month","costs","profit","conversion","churn","arpu","ltv","trial_customers","paying_customers","canceled_customers","sort_order"]

export async function GET(req: Request) {
  const { ok, status } = await requireAdmin(req)
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status })
  const { data } = await createAdminClient().from("saas_products").select("*").order("sort_order")
  return NextResponse.json({ products: data || [] })
}

export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const body = await req.json().catch(() => ({}))
  const row: any = {}; for (const f of FIELDS) if (body[f] !== undefined) row[f] = body[f]
  if (!row.name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db.from("saas_products").insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "produto_criado", target: row.name })
  return NextResponse.json({ product: data })
}

export async function PATCH(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const patch: any = { updated_at: new Date().toISOString() }; for (const f of FIELDS) if (body[f] !== undefined) patch[f] = body[f]
  const db = createAdminClient()
  const { data, error } = await db.from("saas_products").update(patch).eq("id", body.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "produto_editado", target: data.name })
  return NextResponse.json({ product: data })
}

export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await createAdminClient().from("saas_products").delete().eq("id", id)
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "produto_removido", target: id, level: "warning" })
  return NextResponse.json({ ok: true })
}
