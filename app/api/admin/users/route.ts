import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const db = createAdminClient()
  const [{ data: profiles }, { data: subs }] = await Promise.all([
    db.from("profiles").select("id,email,full_name,plan_slug,trial_ends_at,blocked,created_at").order("created_at", { ascending: false }).limit(1000),
    db.from("app_subscriptions").select("*"),
  ])
  const byUser = new Map((subs || []).map((s) => [s.user_id, s]))
  const users = (profiles || []).map((p) => ({ ...p, subscription: byUser.get(p.id) || null }))
  return NextResponse.json({ users })
}

// criar usuário
export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { email, password, full_name } = await req.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: "email e senha obrigatórios" }, { status: 400 })
  const db = createAdminClient()
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "usuario_criado", target: email })
  return NextResponse.json({ user: data.user })
}

// alterar plano / bloquear
export async function PATCH(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { id, plan_slug, blocked } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  if (plan_slug !== undefined) {
    await db.from("profiles").update({ plan_slug }).eq("id", id)
    await db.from("app_subscriptions").upsert({ user_id: id, plan_slug, status: plan_slug === "inicial" ? "inactive" : "active", updated_at: new Date().toISOString() }, { onConflict: "user_id" })
  }
  if (blocked !== undefined) await db.from("profiles").update({ blocked }).eq("id", id)
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "usuario_atualizado", target: id, detail: { plan_slug, blocked } })
  return NextResponse.json({ ok: true })
}

// remover usuário e todos os dados (e-mail liberado p/ novo cadastro)
export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  // apaga dados do usuário (FKs on delete cascade cuidam do resto ao remover do auth)
  await db.from("crm_contacts").delete().eq("user_id", id)
  await db.from("app_subscriptions").delete().eq("user_id", id)
  await db.from("profiles").delete().eq("id", id)
  const { error } = await db.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "usuario_removido", target: id, level: "warning" })
  return NextResponse.json({ ok: true })
}
