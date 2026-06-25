import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"
import { createHash, randomBytes } from "crypto"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { data } = await createAdminClient().from("admin_api_keys").select("id,name,key_prefix,scopes,last_used_at,revoked,created_at").order("created_at", { ascending: false })
  return NextResponse.json({ keys: data || [] })
}

export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { name, scopes } = await req.json().catch(() => ({}))
  const raw = "zfk_" + randomBytes(24).toString("hex")
  const prefix = raw.slice(0, 12)
  const hash = createHash("sha256").update(raw).digest("hex")
  const db = createAdminClient()
  const { data, error } = await db.from("admin_api_keys").insert({ name: name || "API Key", key_prefix: prefix, key_hash: hash, scopes: scopes || ["read"] }).select("id,name,key_prefix").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "api_key_criada", target: name })
  return NextResponse.json({ key: data, secret: raw })  // secret mostrado só uma vez
}

export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  await createAdminClient().from("admin_api_keys").update({ revoked: true }).eq("id", id)
  return NextResponse.json({ ok: true })
}
