import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { data } = await createAdminClient().from("finance_entries").select("*").order("entry_date", { ascending: false }).limit(500)
  const rows = data || []
  const by = (k: string) => rows.filter((r) => r.kind === k).reduce((s, r) => s + r.amount, 0)
  const receita = by("receita"), despesa = by("despesa"), custo = by("custo"), investimento = by("investimento")
  return NextResponse.json({
    entries: rows,
    summary: { receita, despesa, custo, investimento, lucro: receita - despesa - custo },
  })
}

export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const b = await req.json().catch(() => ({}))
  if (!b.amount || !b.kind) return NextResponse.json({ error: "kind e amount obrigatórios" }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db.from("finance_entries").insert({
    kind: b.kind, category: b.category || null, description: b.description || null,
    amount: Math.round(b.amount), recurring: !!b.recurring, entry_date: b.entry_date || new Date().toISOString().slice(0, 10),
    product_id: b.product_id || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "lancamento_financeiro", target: b.kind })
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await createAdminClient().from("finance_entries").delete().eq("id", id)
  return NextResponse.json({ ok: true })
}
