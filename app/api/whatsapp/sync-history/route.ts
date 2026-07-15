import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { connectionState, EvoCreds } from "@/lib/evolution"
import { syncHistory } from "@/lib/wa-sync"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// POST /api/whatsapp/sync-history  { id }  → puxa contatos + conversas + histórico de mensagens
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const id = body?.id
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data: conn } = await db.from("wa_connections").select("id,session,status").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (!conn) return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 })
  const s: any = conn.session || {}
  if (s.provider !== "evolution") return NextResponse.json({ error: "Conexão não é por QR Code." }, { status: 400 })
  const creds: EvoCreds = { url: s.url, key: s.key }
  const state = await connectionState(creds, s.instance)
  if (state !== "open") return NextResponse.json({ error: "WhatsApp não está conectado.", state }, { status: 409 })
  try {
    const result = await syncHistory(db, user.id, conn.id, creds, s.instance, { withMessages: true, maxChats: 30 })
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Falha ao sincronizar." }, { status: 500 })
  }
}
