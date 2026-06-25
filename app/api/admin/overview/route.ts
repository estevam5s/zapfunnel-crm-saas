import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { ok, status } = await requireAdmin(req)
  if (!ok) return NextResponse.json({ error: status === 401 ? "unauthorized" : "forbidden" }, { status })
  const db = createAdminClient()
  const [{ data: products }, { data: subs }, profiles, trials, { data: finance }] = await Promise.all([
    db.from("saas_products").select("*").order("sort_order"),
    db.from("app_subscriptions").select("plan_slug,status"),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gt("trial_ends_at", new Date().toISOString()),
    db.from("finance_entries").select("kind,amount"),
  ])
  const prods = products || []
  const sum = (k: string) => prods.reduce((s, p: any) => s + (Number(p[k]) || 0), 0)
  const paying = (subs || []).filter((s) => s.plan_slug !== "inicial" && ["active", "trialing"].includes(s.status)).length
  const canceled = (subs || []).filter((s) => s.status === "canceled").length
  const revenue = (finance || []).filter((f) => f.kind === "receita").reduce((s, f) => s + f.amount, 0)
  const expenses = (finance || []).filter((f) => f.kind !== "receita").reduce((s, f) => s + f.amount, 0)
  const mrr = sum("mrr"), customers = sum("customers")
  return NextResponse.json({
    totals: {
      mrr, arr: mrr * 12, revenue_total: revenue || mrr, profit_total: (revenue || mrr) - expenses,
      customers, paying, trials: trials.count || 0, canceled, users: profiles.count || 0,
      products: prods.length, churn: prods.length ? +(sum("churn") / prods.length).toFixed(1) : 0,
      conversion: prods.length ? +(sum("conversion") / prods.length).toFixed(1) : 0,
      arpu: customers ? Math.round(mrr / customers) : 0, ltv: sum("ltv"),
    },
    products: prods,
  })
}
