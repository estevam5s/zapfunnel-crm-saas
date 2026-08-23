import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { connectionState, connectInstance, fetchInstancePhone, EvoCreds } from "@/lib/evolution"
import { syncHistory } from "@/lib/wa-sync"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data: conn } = await db.from("wa_connections").select("id,session,status").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (!conn) return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 })
  const s: any = conn.session || {}
  if (s.provider !== "evolution") return NextResponse.json({ status: conn.status })
  const creds: EvoCreds = { url: s.url, key: s.key }
  const state = await connectionState(creds, s.instance)
  if (state === "open") {
    const wasConnected = conn.status === "connected"
    const phone = await fetchInstancePhone(creds, s.instance).catch(() => null)
    await db.from("wa_connections").update({
      status: "connected", phone: phone || undefined,
      connected_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (!wasConnected) {
      // sync rápido de contatos + conversas (sem histórico de mensagens, para não estourar o tempo).
      // O histórico completo é puxado depois pelo endpoint /sync-history (chamado pela UI).
      try { await syncHistory(db, user.id, conn.id, creds, s.instance, { withMessages: false }) } catch { /* não bloqueia */ }
    }
    return NextResponse.json({ status: "connected", phone: phone || null })
  }
  let qr: string | null = null
  try { const r = await connectInstance(creds, s.instance); qr = r.qr || null } catch { /* noop */ }
  return NextResponse.json({ status: "pending", qr })
}
