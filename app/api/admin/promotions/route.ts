import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, stripeReq, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { data } = await createAdminClient().from("promotions").select("*").order("created_at", { ascending: false })
  return NextResponse.json({ promotions: data || [] })
}

export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const b = await req.json().catch(() => ({}))
  if (!b.code || !b.amount) return NextResponse.json({ error: "código e valor obrigatórios" }, { status: 400 })
  const db = createAdminClient()
  // cria cupom no Stripe (integração de promoções → Stripe)
  let stripeCoupon: string | null = null
  try {
    const couponBody: Record<string, unknown> = { name: b.name || b.code, duration: "once" }
    if (b.kind === "fixed") { couponBody.amount_off = Math.round(b.amount); couponBody.currency = "brl" }
    else couponBody.percent_off = Math.min(100, Number(b.amount))
    if (b.max_redemptions) couponBody.max_redemptions = b.max_redemptions
    const c = await stripeReq("coupons", couponBody)
    stripeCoupon = c.id
  } catch (e: any) { /* segue sem cupom Stripe se a chave não permitir */ }
  const { data, error } = await db.from("promotions").insert({
    code: b.code.toUpperCase(), name: b.name || b.code, kind: b.kind || "percent",
    amount: Math.round(b.amount), stripe_coupon_id: stripeCoupon, applies_to: b.applies_to || "all",
    ends_at: b.ends_at || null, max_redemptions: b.max_redemptions || null, active: b.active !== false,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "promocao_criada", target: b.code, detail: { stripeCoupon } })
  return NextResponse.json({ promotion: data, stripe_coupon: stripeCoupon })
}

export async function PATCH(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { id, active } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await createAdminClient().from("promotions").update({ active }).eq("id", id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await createAdminClient().from("promotions").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
