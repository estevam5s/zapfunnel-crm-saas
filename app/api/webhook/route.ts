import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { stripeReq, verifyStripeSignature, logAudit } from "@/lib/saas"
import { notifyWelcome, notifyCancellation, notifyDunning } from "@/lib/notify-email"

async function emailForUser(db: any, uid?: string | null): Promise<string | null> {
  if (!uid) return null
  const { data } = await db.from("profiles").select("email").eq("id", uid).maybeSingle()
  return (data?.email as string | undefined) || null
}
async function emailForCustomer(db: any, customer?: string | null): Promise<string | null> {
  if (!customer) return null
  const { data } = await db.from("app_subscriptions").select("user_id").eq("stripe_customer_id", customer).maybeSingle()
  return emailForUser(db, data?.user_id as string | undefined)
}

export const dynamic = "force-dynamic"
const REFUND_DAYS = parseInt(process.env.REFUND_DAYS || "7", 10)

async function planFromPrice(db: any, priceId: string) {
  const { data: plans } = await db.from("app_plans").select("slug,stripe_price_month,stripe_price_year")
  for (const p of plans || []) {
    if (p.stripe_price_month === priceId) return { slug: p.slug, cycle: "month" }
    if (p.stripe_price_year === priceId) return { slug: p.slug, cycle: "year" }
  }
  return null
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ""
  if (secret) {
    const ok = await verifyStripeSignature(body, sig, secret)
    if (!ok) return NextResponse.json({ error: "invalid signature" }, { status: 400 })
  }
  let event: any
  try { event = JSON.parse(body) } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }) }
  const db = createAdminClient()
  const { data: seen } = await db.from("app_payment_events").select("id").eq("id", event.id).maybeSingle()
  if (seen) return NextResponse.json({ received: true, duplicate: true })
  const obj = event.data?.object || {}
  const userId = obj.metadata?.user_id

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const uid = obj.metadata?.user_id, slug = obj.metadata?.slug, cycle = obj.metadata?.cycle || "month"
        if (uid && obj.subscription) {
          const subObj = await stripeReq(`subscriptions/${obj.subscription}`, undefined, "GET")
          await db.from("app_subscriptions").upsert({
            user_id: uid, plan_slug: slug, status: subObj.status,
            stripe_customer_id: obj.customer, stripe_subscription_id: obj.subscription, cycle,
            current_period_end: new Date(subObj.current_period_end * 1000).toISOString(),
            refund_eligible_until: new Date(Date.now() + REFUND_DAYS * 86400000).toISOString(),
            cancel_at_period_end: false, updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" })
          await db.from("profiles").update({ plan_slug: slug }).eq("id", uid)
          await logAudit({ actor_id: uid, action: "assinatura_ativada", target: slug, level: "info" })
          const to = await emailForUser(db, uid); if (to) void notifyWelcome(to)
        }
        break
      }
      case "invoice.payment_failed": {
        const uid = obj.metadata?.user_id
        if (obj.customer) await db.from("app_subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("stripe_customer_id", obj.customer)
        const to = uid ? await emailForUser(db, uid) : await emailForCustomer(db, obj.customer); if (to) void notifyDunning(to)
        break
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const priceId = obj.items?.data?.[0]?.price?.id
        const mapped = priceId ? await planFromPrice(db, priceId) : null
        const uid = obj.metadata?.user_id
        if (uid) {
          const patch: any = {
            status: obj.status, cancel_at_period_end: !!obj.cancel_at_period_end,
            current_period_end: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }
          if (mapped) { patch.plan_slug = mapped.slug; patch.cycle = mapped.cycle }
          await db.from("app_subscriptions").update(patch).eq("user_id", uid)
          if (mapped) await db.from("profiles").update({ plan_slug: mapped.slug }).eq("id", uid)
        }
        break
      }
      case "customer.subscription.deleted": {
        const uid = obj.metadata?.user_id
        if (uid) {
          await db.from("app_subscriptions").update({ status: "canceled", plan_slug: "inicial", updated_at: new Date().toISOString() }).eq("user_id", uid)
          await db.from("profiles").update({ plan_slug: "inicial" }).eq("id", uid)
          await logAudit({ actor_id: uid, action: "assinatura_cancelada", level: "warning" })
          const to = await emailForUser(db, uid); if (to) void notifyCancellation(to)
        }
        break
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
  await db.from("app_payment_events").insert({ id: event.id, type: event.type, user_id: userId || null })
  return NextResponse.json({ received: true })
}
