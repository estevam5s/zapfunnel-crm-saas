import { NextResponse } from "next/server"
import { getUserFromRequest, getAccessForUser } from "@/lib/saas"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const acc = await getAccessForUser(user.id, user.email)
  return NextResponse.json({
    subscription: acc.subscription, plan: acc.plan, plans: acc.plans,
    is_admin: acc.isAdmin, trial_active: acc.trialActive, trial_ends_at: acc.trialEndsAt,
    has_access: acc.hasAccess, limits: acc.limits, blocked: acc.blocked,
  })
}
