import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const q = (new URL(req.url).searchParams.get("q") || "").trim()
  let query = db.from("contacts")
    .select("id,wa_id,name,phone,avatar_url,tags,created_at,conversations(id,last_message_at)")
    .eq("user_id", user.id).order("name", { ascending: true }).limit(1000)
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
  const { data } = await query
  return NextResponse.json({ contacts: data || [] })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  await db.from("contacts").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
