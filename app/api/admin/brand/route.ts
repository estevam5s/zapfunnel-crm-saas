import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { requireAdmin, logAudit } from "@/lib/saas"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const BUCKET = "brand"
const FILE = "logo.png" // caminho fixo — o Logo aponta para a URL pública deste arquivo

function publicUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${BUCKET}/${FILE}`
}

// GET — devolve a URL pública do logo atual (se houver upload custom).
export async function GET() {
  return NextResponse.json({ url: publicUrl() })
}

// POST — admin faz upload de um novo logo (multipart "file"). Sobrescreve o caminho fixo.
export async function POST(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })

  const form = await req.formData().catch(() => null)
  const file = form?.get("file") as File | null
  if (!file) return NextResponse.json({ error: "arquivo obrigatório" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "imagem acima de 2MB" }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  const db = createAdminClient()
  const { error } = await db.storage.from(BUCKET).upload(FILE, buf, { contentType: file.type || "image/png", upsert: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await logAudit({ actor: a.user!.email, actor_id: a.user!.id, action: "logo_alterado", detail: {} }).catch(() => {})
  return NextResponse.json({ url: `${publicUrl()}?v=${Date.now()}` })
}

// DELETE — remove o logo custom (volta ao logo padrão do app).
export async function DELETE(req: Request) {
  const a = await requireAdmin(req)
  if (!a.ok) return NextResponse.json({ error: "forbidden" }, { status: a.status })
  const db = createAdminClient()
  await db.storage.from(BUCKET).remove([FILE])
  return NextResponse.json({ ok: true })
}
