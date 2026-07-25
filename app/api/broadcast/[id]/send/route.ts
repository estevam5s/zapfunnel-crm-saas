import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { evoSendText } from "@/lib/evolution"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// POST /api/broadcast/[id]/send — dispara a campanha para todos os destinatários pendentes.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id } = await params
  const db = createAdminClient()

  const { data: bc } = await db.from("broadcasts").select("*").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (!bc) return NextResponse.json({ error: "campanha não encontrada" }, { status: 404 })

  // conexão ativa (Evolution/QR)
  const { data: conn } = await db
    .from("wa_connections")
    .select("session,status")
    .eq("user_id", user.id)
    .eq("status", "connected")
    .maybeSingle()
  const session: any = conn?.session || {}
  const canSend = session.provider === "evolution" && session.url && session.key && session.instance

  await db.from("broadcasts").update({ status: "sending" }).eq("id", id)

  const { data: recipients } = await db
    .from("broadcast_recipients")
    .select("*")
    .eq("broadcast_id", id)
    .eq("status", "pending")

  let sent = 0, failed = 0
  for (const r of recipients || []) {
    if (!canSend) {
      await db.from("broadcast_recipients").update({ status: "failed", error: "Sem conexão WhatsApp ativa" }).eq("id", r.id)
      failed++
      continue
    }
    try {
      const waId = await evoSendText({ url: session.url, key: session.key }, session.instance, r.phone, bc.message)
      await db.from("broadcast_recipients").update({ status: "sent", wa_message_id: waId, sent_at: new Date().toISOString() }).eq("id", r.id)
      sent++
      // pequeno atraso para não estourar o rate limit do WhatsApp
      await new Promise((res) => setTimeout(res, 800))
    } catch (e: any) {
      await db.from("broadcast_recipients").update({ status: "failed", error: e.message }).eq("id", r.id)
      failed++
    }
  }

  const status = failed === 0 ? "sent" : sent === 0 ? "failed" : "sent"
  await db.from("broadcasts").update({ status, sent_count: sent, failed_count: failed }).eq("id", id)

  return NextResponse.json({ sent, failed, offline: !canSend })
}
