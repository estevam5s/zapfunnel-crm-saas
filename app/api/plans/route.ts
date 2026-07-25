import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  const db = createAdminClient()
  const { data } = await db.from("app_plans").select("*").order("sort_order")
  return NextResponse.json({ plans: data || [] })
}
