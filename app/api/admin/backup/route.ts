import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"
const TABLES = ["profiles","app_subscriptions","app_plans","saas_products","finance_entries","promotions","seo_settings","service_status","crm_contacts","audit_logs"]

// GET ?action=list | ?action=export
export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const action = new URL(req.url).searchParams.get("action") || "list"
  const db = createAdminClient()
  if (action === "export") {
    const dump: Record<string, unknown[]> = {}
    for (const t of TABLES) { const { data } = await db.from(t).select("*"); dump[t] = data || [] }
    const payload = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), tables: dump })
    const size = new TextEncoder().encode(payload).length
    await db.from("backups").insert({ kind: "manual", size_bytes: size, tables_count: TABLES.length, status: "done", note: "export manual" })
    await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "backup_exportado", detail: { size } })
    return new NextResponse(payload, { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="zapfunnel-backup-${Date.now()}.json"` } })
  }
  const { data } = await db.from("backups").select("*").order("created_at", { ascending: false }).limit(50)
  return NextResponse.json({ backups: data || [] })
}

// POST importação (restaura tabelas a partir do arquivo)
export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const body = await req.json().catch(() => null)
  if (!body?.tables) return NextResponse.json({ error: "Arquivo de backup inválido" }, { status: 400 })
  const db = createAdminClient()
  let restored = 0
  for (const t of TABLES) {
    const rows = body.tables[t]
    if (Array.isArray(rows) && rows.length) { await db.from(t).upsert(rows); restored += rows.length }
  }
  await db.from("backups").insert({ kind: "import", tables_count: TABLES.length, status: "done", note: `restaurados ${restored} registros` })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "backup_importado", target: `${restored} registros`, level: "warning" })
  return NextResponse.json({ ok: true, restored })
}
