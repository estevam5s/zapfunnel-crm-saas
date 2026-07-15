import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const id = new URL(req.url).searchParams.get("id")
  if (id) {
    const { data: messages } = await db.from("messages").select("*").eq("conversation_id", id).eq("user_id", user.id).order("created_at")
    const { data: conv } = await db.from("conversations").select("typing_until").eq("id", id).eq("user_id", user.id).maybeSingle()
    await db.from("conversations").update({ unread: 0 }).eq("id", id).eq("user_id", user.id)
    const typing = !!conv?.typing_until && new Date(conv.typing_until) > new Date()
    return NextResponse.json({ messages: messages || [], typing })
  }
  const { data: convs } = await db.from("conversations").select("*, contact:contacts(name,phone,wa_id,avatar_url)")
    .eq("user_id", user.id).order("last_message_at", { ascending: false }).limit(200)
  return NextResponse.json({ conversations: convs || [] })
}
