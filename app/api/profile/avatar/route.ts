import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"

export const dynamic = "force-dynamic"
export const maxDuration = 30

// POST /api/profile/avatar — recebe multipart com o arquivo "file" e grava no bucket avatars.
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get("file") as File | null
  if (!file) return NextResponse.json({ error: "arquivo obrigatório" }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "imagem acima de 5MB" }, { status: 400 })

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const path = `${user.id}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())

  const db = createAdminClient()
  const { error: upErr } = await db.storage.from("avatars").upload(path, buf, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

  const { data: pub } = db.storage.from("avatars").getPublicUrl(path)
  const avatar_url = pub.publicUrl

  await db.from("profiles").upsert({ id: user.id, email: user.email, avatar_url }, { onConflict: "id" })

  return NextResponse.json({ avatar_url })
}
