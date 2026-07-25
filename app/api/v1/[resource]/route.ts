import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { createHash } from "crypto"

export const dynamic = "force-dynamic"

// API administrativa segura p/ outros sistemas — autentica via API Key (x-api-key)
async function authKey(req: Request): Promise<boolean> {
  const key = req.headers.get("x-api-key") || ""
  if (!key) return false
  if (process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY) return true
  const hash = createHash("sha256").update(key).digest("hex")
  const db = createAdminClient()
  const { data } = await db.from("admin_api_keys").select("id,revoked").eq("key_hash", hash).maybeSingle()
  if (!data || data.revoked) return false
  await db.from("admin_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)
  return true
}

const ALLOWED: Record<string, { table: string; cols: string }> = {
  products: { table: "saas_products", cols: "*" },
  metrics: { table: "saas_products", cols: "slug,name,mrr,arr,customers,churn,conversion,arpu,ltv" },
  finance: { table: "finance_entries", cols: "kind,category,amount,recurring,entry_date" },
  promotions: { table: "promotions", cols: "code,name,kind,amount,active,ends_at" },
}

export async function GET(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  if (!(await authKey(req))) return NextResponse.json({ error: "API key inválida" }, { status: 401 })
  const { resource } = await ctx.params
  const cfg = ALLOWED[resource]
  if (!cfg) return NextResponse.json({ error: "recurso não encontrado", available: Object.keys(ALLOWED) }, { status: 404 })
  const { data } = await createAdminClient().from(cfg.table).select(cfg.cols).limit(500)
  return NextResponse.json({ resource, count: (data || []).length, data: data || [] })
}
