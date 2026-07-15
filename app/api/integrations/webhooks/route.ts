import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { getUserFromRequest } from "@/lib/saas"
import { getProfileSettings, saveProfileSettings, limitsFor, newId, type Webhook } from "@/lib/integrations"

export const dynamic = "force-dynamic"

const VALID_EVENTS = ["lead.created", "message.received", "stage.changed", "lead.won", "lead.lost"]

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { planSlug, settings } = await getProfileSettings(user.id)
  const limit = limitsFor(planSlug).webhooks
  return NextResponse.json({ webhooks: settings.webhooks || [], limit, used: (settings.webhooks || []).length, events: VALID_EVENTS })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { planSlug, settings } = await getProfileSettings(user.id)
  const limit = limitsFor(planSlug).webhooks
  const current = settings.webhooks || []
  if (limit === 0) return NextResponse.json({ error: "Seu plano não inclui webhooks. Faça upgrade." }, { status: 403 })
  if (limit !== -1 && current.length >= limit)
    return NextResponse.json({ error: `Limite de ${limit} webhook(s) atingido no seu plano.` }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const url = String(body?.url || "").trim()
  try {
    const u = new URL(url)
    if (u.protocol !== "https:") return NextResponse.json({ error: "A URL do webhook deve ser HTTPS." }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "URL inválida." }, { status: 400 })
  }
  const events = Array.isArray(body?.events) && body.events.length
    ? body.events.filter((e: string) => VALID_EVENTS.includes(e))
    : VALID_EVENTS.slice(0, 3)

  const wh: Webhook = {
    id: newId(), url, events, secret: `whsec_${randomBytes(18).toString("base64url")}`,
    active: true, created_at: new Date().toISOString(), last_status: null, last_delivery_at: null,
  }
  await saveProfileSettings(user.id, { webhooks: [...current, wh] })
  return NextResponse.json({ webhook: wh })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { settings } = await getProfileSettings(user.id)
  const list = (settings.webhooks || []).map((w) => (w.id === body?.id ? { ...w, active: Boolean(body.active) } : w))
  await saveProfileSettings(user.id, { webhooks: list })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const { settings } = await getProfileSettings(user.id)
  await saveProfileSettings(user.id, { webhooks: (settings.webhooks || []).filter((w) => w.id !== id) })
  return NextResponse.json({ ok: true })
}
