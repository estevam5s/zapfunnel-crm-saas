import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"
const FIELDS = ["meta_title","meta_description","og_title","og_description","og_image","twitter_card","canonical_base","robots","ga_id","gtm_id","gsc_verification"]

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const { data } = await createAdminClient().from("seo_settings").select("*").eq("id", 1).maybeSingle()
  return NextResponse.json({ seo: data || {} })
}

export async function PATCH(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const b = await req.json().catch(() => ({}))
  const patch: any = { id: 1, updated_at: new Date().toISOString() }; for (const f of FIELDS) if (b[f] !== undefined) patch[f] = b[f]
  const db = createAdminClient()
  const { data, error } = await db.from("seo_settings").upsert(patch, { onConflict: "id" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "seo_atualizado" })
  return NextResponse.json({ seo: data })
}
