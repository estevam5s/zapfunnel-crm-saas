import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/saas"
import { getProfileSettings, saveProfileSettings, generateApiKey, limitsFor, type ApiKey } from "@/lib/integrations"

export const dynamic = "force-dynamic"

const publicView = (k: ApiKey) => ({ id: k.id, name: k.name, prefix: k.prefix, created_at: k.created_at, last_used_at: k.last_used_at })

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { planSlug, settings } = await getProfileSettings(user.id)
  const limit = limitsFor(planSlug).apiKeys
  return NextResponse.json({ keys: (settings.api_keys || []).map(publicView), limit, used: (settings.api_keys || []).length })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { planSlug, settings } = await getProfileSettings(user.id)
  const limit = limitsFor(planSlug).apiKeys
  const current = settings.api_keys || []
  if (limit === 0) return NextResponse.json({ error: "Seu plano não inclui chaves de API. Faça upgrade." }, { status: 403 })
  if (limit !== -1 && current.length >= limit)
    return NextResponse.json({ error: `Limite de ${limit} chave(s) atingido no seu plano. Revogue uma ou faça upgrade.` }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { plain, record } = generateApiKey(String(body?.name || "Chave de API").slice(0, 40))
  await saveProfileSettings(user.id, { api_keys: [...current, record] })
  // devolve a chave em claro APENAS nesta resposta (não é armazenada em claro)
  return NextResponse.json({ key: publicView(record), plain })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const { settings } = await getProfileSettings(user.id)
  await saveProfileSettings(user.id, { api_keys: (settings.api_keys || []).filter((k) => k.id !== id) })
  return NextResponse.json({ ok: true })
}
