import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/saas"
import { envEvolution } from "@/lib/evolution"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  return NextResponse.json({ managed: !!envEvolution() })
}
