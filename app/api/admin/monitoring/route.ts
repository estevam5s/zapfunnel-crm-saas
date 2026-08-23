import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const db = createAdminClient()
  // checagem viva do Supabase + Stripe
  const checks: { service: string; status: string; latency_ms: number }[] = []
  const t0 = Date.now()
  try { await db.from("app_plans").select("slug", { head: true, count: "exact" }); checks.push({ service: "Supabase", status: "operational", latency_ms: Date.now() - t0 }) }
  catch { checks.push({ service: "Supabase", status: "down", latency_ms: Date.now() - t0 }) }
  const t1 = Date.now()
  try {
    const r = await fetch("https://api.stripe.com/v1/balance", { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } })
    checks.push({ service: "Stripe", status: r.ok ? "operational" : "degraded", latency_ms: Date.now() - t1 })
  } catch { checks.push({ service: "Stripe", status: "down", latency_ms: Date.now() - t1 }) }

  const { data: stored } = await db.from("service_status").select("*")
  const map = new Map((stored || []).map((s) => [s.service, s]))
  for (const c of checks) map.set(c.service, { ...(map.get(c.service) || {}), ...c, uptime: map.get(c.service)?.uptime ?? 100 })

  const [{ data: visitors }, viCount] = await Promise.all([
    db.from("visitors").select("country,country_code,city,device,browser,os,source,lat,lng,created_at").order("created_at", { ascending: false }).limit(200),
    db.from("visitors").select("id", { count: "exact", head: true }),
  ])
  const vis = visitors || []
  const tally = (k: string) => { const m: Record<string, number> = {}; for (const v of vis) { const key = (v as any)[k] || "—"; m[key] = (m[key] || 0) + 1 } return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8) }
  return NextResponse.json({
    services: Array.from(map.values()),
    visitors: { total: viCount.count || 0, recent: vis, byCountry: tally("country"), byDevice: tally("device"), bySource: tally("source"), points: vis.filter((v) => v.lat && v.lng) },
  })
}
