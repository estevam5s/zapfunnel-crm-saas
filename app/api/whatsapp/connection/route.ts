import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest, getAccessForUser, siteUrl } from "@/lib/saas"
import { envEvolution, createInstance, logoutInstance, EvoCreds } from "@/lib/evolution"

export const dynamic = "force-dynamic"

// Quantos números o plano do usuário permite conectar.
async function waLimitFor(userId: string, email?: string | null): Promise<number> {
  const acc = await getAccessForUser(userId, email)
  const raw = (acc.limits as any)?.wa_numbers
  if (raw === -1 || raw === "unlimited" || acc.isAdmin) return 999
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("wa_connections").select("id,label,channel,phone,status,connected_at,created_at").eq("user_id", user.id).order("created_at")
  const limit = await waLimitFor(user.id, user.email)
  return NextResponse.json({ connections: data || [], limit })
}

// canal QR — SEMPRE via a Evolution API gerenciada pelo admin (env). O usuário só escaneia o QR.
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const evo: EvoCreds | null = envEvolution()
  if (!evo) return NextResponse.json({ error: "A conexão por QR Code ainda não foi habilitada pelo administrador.", code: "NO_MANAGED" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const label: string = (body?.label || "").toString().trim()

  // Limite por plano: conta números já conectados/pendentes (exclui os que falharam/desconectaram).
  const { data: existing } = await db.from("wa_connections").select("id,status").eq("user_id", user.id)
  const active = (existing || []).filter((c) => c.status === "connected" || c.status === "pending")
  const limit = await waLimitFor(user.id, user.email)
  if (active.length >= limit) {
    return NextResponse.json(
      { error: `Seu plano permite ${limit} número(s) de WhatsApp. Faça upgrade para conectar mais.`, code: "WA_LIMIT", limit },
      { status: 403 },
    )
  }

  const instanceName = `wp_${user.id.slice(0, 8)}_${Date.now().toString(36)}`
  const webhookUrl = `${siteUrl()}/api/whatsapp/webhook`
  let result: any
  try { result = await createInstance(evo, instanceName, webhookUrl) }
  catch (e: any) { return NextResponse.json({ error: `Não foi possível acessar a Evolution API (${e.message}).`, code: "GATEWAY_ERROR" }, { status: 400 }) }
  if (!result.ok || !result.qr) return NextResponse.json({ error: result.error || "Não foi possível gerar o QR Code.", code: "GATEWAY_ERROR" }, { status: 400 })

  const { data, error } = await db.from("wa_connections").insert({
    user_id: user.id, label: label || `WhatsApp ${active.length + 1}`, channel: "qr", status: "pending", qr_token: instanceName,
    session: { provider: "evolution", mode: "managed", url: evo.url, key: evo.key, instance: instanceName },
  }).select("id,label,channel,status").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ connection: data, qr: result.qr, instance: instanceName, limit })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data: conn } = await db.from("wa_connections").select("session").eq("id", id).eq("user_id", user.id).maybeSingle()
  const s: any = conn?.session || {}
  if (s.provider === "evolution" && s.url && s.key && s.instance) { try { await logoutInstance({ url: s.url, key: s.key }, s.instance) } catch { /* noop */ } }
  await db.from("wa_connections").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
