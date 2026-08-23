import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/saas"
import { n8nUpsertFlowWorkflow, n8nSetActive, n8nDeleteWorkflow, n8nEnabled } from "@/lib/n8n"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const db = createAdminClient()
  const { data } = await db.from("flows").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
  return NextResponse.json({ flows: data || [] })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const db = createAdminClient()
  const { data, error } = await db
    .from("flows")
    .insert({
      user_id: user.id,
      name: body.name || "Novo fluxo",
      description: body.description || null,
      trigger_type: body.trigger_type || "keyword",
      trigger_config: body.trigger_config || {},
      nodes: body.nodes || [],
      edges: body.edges || [],
      entry_node: body.entry_node || null,
      status: body.status || "draft",
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: data })
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { id, ...patch } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const allowed: any = {}
  for (const k of ["name", "description", "trigger_type", "trigger_config", "nodes", "edges", "entry_node", "status"]) {
    if (k in patch) allowed[k] = patch[k]
  }

  // Ao ATIVAR um fluxo, registra/ativa o workflow-motor no N8N (server-side).
  // O usuário nunca vê o N8N; só recebe o resultado (fluxo "ativo").
  if (patch.status && n8nEnabled()) {
    const { data: cur } = await db.from("flows").select("n8n_workflow_id,webhook_path,name").eq("id", id).eq("user_id", user.id).maybeSingle()
    if (cur) {
      if (patch.status === "active") {
        let wfId = cur.n8n_workflow_id
        const webhookPath = cur.webhook_path || `zf-${id.slice(0, 12)}`
        if (!wfId) {
          wfId = await n8nUpsertFlowWorkflow({ userId: user.id, flowId: id, name: patch.name || cur.name || "fluxo", webhookPath })
          if (wfId) allowed.n8n_workflow_id = wfId
          allowed.webhook_path = webhookPath
        }
        if (wfId) await n8nSetActive(wfId, true)
      } else if (cur.n8n_workflow_id) {
        await n8nSetActive(cur.n8n_workflow_id, false)
      }
    }
  }

  const { data, error } = await db.from("flows").update(allowed).eq("id", id).eq("user_id", user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ flow: data })
}

export async function DELETE(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })
  const db = createAdminClient()
  const { data: cur } = await db.from("flows").select("n8n_workflow_id").eq("id", id).eq("user_id", user.id).maybeSingle()
  if (cur?.n8n_workflow_id) await n8nDeleteWorkflow(cur.n8n_workflow_id)
  await db.from("flows").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
