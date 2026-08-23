import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"

// GET /api/broadcast — lista campanhas do usuário
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db
    .from("broadcasts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  return NextResponse.json({ broadcasts: data || [] })
}

// POST /api/broadcast — cria uma campanha (rascunho)
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { name, message, media_url, audience, scheduled_at } = await req.json().catch(() => ({}))
  if (!name || !message) return NextResponse.json({ error: "name e message são obrigatórios" }, { status: 400 })

  const db = createAdminClient()

  // resolve o público-alvo: por tags ou todos os contatos
  let q = db.from("contacts").select("id,phone,wa_id,tags").eq("user_id", user.id)
  const tags: string[] = audience?.tags || []
  const { data: contacts } = await q
  const filtered = (contacts || []).filter((c) => {
    if (audience?.all || tags.length === 0) return true
    return (c.tags || []).some((t: string) => tags.includes(t))
  })

  const { data: bc, error } = await db
    .from("broadcasts")
    .insert({
      user_id: user.id,
      name,
      message,
      media_url: media_url || null,
      audience: audience || { all: true },
      scheduled_at: scheduled_at || null,
      status: scheduled_at ? "scheduled" : "draft",
      total: filtered.length,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (filtered.length) {
    await db.from("broadcast_recipients").insert(
      filtered.map((c) => ({
        broadcast_id: bc.id,
        user_id: user.id,
        contact_id: c.id,
        phone: c.wa_id || c.phone,
        status: "pending",
      })),
    )
  }

  return NextResponse.json({ broadcast: bc })
}
