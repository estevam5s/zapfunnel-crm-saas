import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, stripeReq, siteUrl, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    const { slug, cycle, coupon } = await req.json().catch(() => ({}))
    if (!slug || slug === "inicial") return NextResponse.json({ error: "Plano inválido" }, { status: 400 })

    const db = createAdminClient()
    const { data: plan } = await db.from("app_plans").select("*").eq("slug", slug).single()
    if (!plan) return NextResponse.json({ error: "Plano não encontrado" }, { status: 400 })
    const price = cycle === "year" ? plan.stripe_price_year : plan.stripe_price_month
    if (!price) return NextResponse.json({ error: "Preço não configurado" }, { status: 400 })

    const { data: sub } = await db.from("app_subscriptions").select("stripe_customer_id,plan_slug").eq("user_id", user.id).maybeSingle()
    let customer = (sub?.stripe_customer_id as string | undefined) || undefined
    // valida o customer na conta Stripe ATUAL — se for de outra conta (migração), o Stripe dá
    // "No such customer" e o checkout estoura 500. Nesse caso, recria um customer válido.
    if (customer) {
      try {
        const existing = await stripeReq(`customers/${customer}`, undefined, "GET")
        if (existing?.deleted) customer = undefined
      } catch { customer = undefined }
    }
    if (!customer) {
      const c = await stripeReq("customers", { email: user.email, metadata: { user_id: user.id } })
      customer = c.id
      await db.from("app_subscriptions").upsert({ user_id: user.id, plan_slug: sub?.plan_slug || "inicial", stripe_customer_id: customer }, { onConflict: "user_id" })
    }

    // promo: resolve cupom Stripe se informado
    let discounts: Record<string, unknown> | undefined
    if (coupon) {
      const { data: promo } = await db.from("promotions").select("stripe_coupon_id").eq("code", coupon).eq("active", true).maybeSingle()
      if (promo?.stripe_coupon_id) discounts = { "discounts[0][coupon]": promo.stripe_coupon_id }
    }

    const session = await stripeReq("checkout/sessions", {
      mode: "subscription", customer,
      "line_items[0][price]": price, "line_items[0][quantity]": 1,
      success_url: `${siteUrl()}/gerenciar-plano?success=1`,
      cancel_url: `${siteUrl()}/gerenciar-plano?canceled=1`,
      ...(discounts || { allow_promotion_codes: true }),
      "subscription_data[metadata][user_id]": user.id, "subscription_data[metadata][slug]": slug, "subscription_data[metadata][app]": "zapfunnel",
      "metadata[user_id]": user.id, "metadata[slug]": slug, "metadata[cycle]": cycle || "month", "metadata[app]": "zapfunnel",
    })
    await logAudit({ actor: user.email, actor_id: user.id, action: "checkout_iniciado", target: slug, detail: { cycle } }).catch(() => {})
    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Falha ao iniciar o checkout." }, { status: 500 })
  }
}
