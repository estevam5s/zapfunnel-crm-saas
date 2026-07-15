import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/saas"
import { n8nEnabled, n8nHealth } from "@/lib/n8n"

export const dynamic = "force-dynamic"

// GET — status do motor de automação (N8N). Só expõe um booleano; nenhum dado
// privado do N8N (URL, key, workflows) chega ao cliente.
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!n8nEnabled()) return NextResponse.json({ connected: false, configured: false })
  const ok = await n8nHealth()
  return NextResponse.json({ connected: ok, configured: true })
}
