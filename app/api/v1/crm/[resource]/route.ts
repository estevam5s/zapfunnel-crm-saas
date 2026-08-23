import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { findKeyOwner, touchKeyUsage } from "@/lib/integrations"

export const dynamic = "force-dynamic"

// API REST do usuário do CRM — autentica pela chave "zap_live_..." (header x-api-key
// ou Authorization: Bearer). Retorna apenas os dados do DONO da chave.
const RESOURCES: Record<string, { table: string; cols: string; order?: string }> = {
  leads: { table: "leads", cols: "id,name,phone,stage,value,source,created_at", order: "created_at" },
  contacts: { table: "contacts", cols: "id,name,phone,email,created_at", order: "created_at" },
  conversations: { table: "conversations", cols: "id,contact_name,last_message_at,unread", order: "last_message_at" },
}

export async function GET(req: Request, ctx: { params: Promise<{ resource: string }> }) {
  const key = req.headers.get("x-api-key") || (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")
  if (!key || !key.startsWith("zap_live_")) return NextResponse.json({ error: "Chave de API ausente ou inválida." }, { status: 401 })

  const owner = await findKeyOwner(key)
  if (!owner) return NextResponse.json({ error: "Chave de API inválida ou revogada." }, { status: 401 })
  touchKeyUsage(owner.userId, owner.keyId).catch(() => {})

  const { resource } = await ctx.params
  const cfg = RESOURCES[resource]
  if (!cfg) return NextResponse.json({ error: "Recurso não encontrado.", available: Object.keys(RESOURCES) }, { status: 404 })

  const db = createAdminClient()
  const limit = Math.min(500, Number(new URL(req.url).searchParams.get("limit") || 100))
  let q = db.from(cfg.table).select(cfg.cols).eq("user_id", owner.userId).limit(limit)
  if (cfg.order) q = q.order(cfg.order, { ascending: false })
  const { data, error } = await q
  if (error) return NextResponse.json({ error: "Falha ao consultar dados." }, { status: 500 })
  return NextResponse.json({ resource, count: (data || []).length, data: data || [] })
}
