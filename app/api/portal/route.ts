import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, stripeReq, siteUrl } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data: sub } = await db.from("app_subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle()
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 400 })
  const session = await stripeReq("billing_portal/sessions", { customer: sub.stripe_customer_id, return_url: `${siteUrl()}/gerenciar-plano` })
  return NextResponse.json({ url: session.url })
}
