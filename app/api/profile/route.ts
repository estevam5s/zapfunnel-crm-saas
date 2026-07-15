import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("profiles").select("id,email,full_name,phone,company,avatar_url,plan_slug,settings").eq("id", user.id).maybeSingle()
  return NextResponse.json({ profile: data || { id: user.id, email: user.email } })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const body = await req.json().catch(() => ({}))
  const patch: any = {}
  for (const k of ["full_name", "phone", "company", "avatar_url"]) if (body[k] !== undefined) patch[k] = body[k]
  if (body.settings !== undefined) patch.settings = body.settings
  // upsert (garante linha do usuário)
  const { data, error } = await db.from("profiles").upsert({ id: user.id, email: user.email, ...patch }, { onConflict: "id" }).select("id,email,full_name,phone,company,avatar_url,settings").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: data })
}
