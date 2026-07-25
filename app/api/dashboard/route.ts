import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last7 = new Date(Date.now() - 7 * 86400000).toISOString()

  const [{ data: leads }, convToday, connections, msgs, { data: recentMsgs }, { count: contactsCount }] = await Promise.all([
    db.from("leads").select("stage,created_at,value").eq("user_id", user.id),
    db.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("last_message_at", today.toISOString()),
    db.from("wa_connections").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "connected"),
    db.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", last7),
    db.from("messages").select("direction,created_at").eq("user_id", user.id).gte("created_at", last7).limit(5000),
    db.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ])
  const list = leads || []
  const byStage: Record<string, number> = { novo: 0, em_conversa: 0, qualificado: 0, proposta: 0, ganho: 0, perdido: 0 }
  let activeLeads = 0, wonValue = 0
  for (const l of list) { byStage[l.stage] = (byStage[l.stage] || 0) + 1; if (!["ganho", "perdido"].includes(l.stage)) activeLeads++; if (l.stage === "ganho") wonValue += l.value || 0 }
  const won = byStage["ganho"] || 0
  const total = list.length || 1

  // série de mensagens dos últimos 7 dias (in/out por dia)
  const days: { day: string; label: string; in: number; out: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000)
    days.push({ day: dt.toISOString().slice(0, 10), label: dt.toLocaleDateString("pt-BR", { weekday: "short" }), in: 0, out: 0 })
  }
  const idx = new Map(days.map((d, i) => [d.day, i]))
  for (const m of recentMsgs || []) {
    const k = String(m.created_at).slice(0, 10); const i = idx.get(k)
    if (i !== undefined) { if (m.direction === "out") days[i].out++; else days[i].in++ }
  }

  return NextResponse.json({
    active_leads: activeLeads, total_leads: list.length, conversations_today: convToday.count || 0,
    connections: connections.count || 0, messages_7d: msgs.count || 0, contacts: contactsCount || 0, by_stage: byStage,
    conversion: Math.round((won / total) * 100), won_value: wonValue, msg_series: days,
  })
}
