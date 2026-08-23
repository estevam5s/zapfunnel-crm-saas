import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const level = new URL(req.url).searchParams.get("level")
  let q = createAdminClient().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300)
  if (level && level !== "all") q = q.eq("level", level)
  const { data } = await q
  return NextResponse.json({ logs: data || [] })
}
