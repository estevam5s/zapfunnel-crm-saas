import { createAdminClient } from "@/lib/supabase"

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function siteUrl(): string {
  return process.env.APP_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://zapfunnel-crm.vercel.app"
}

export async function getUserFromRequest(req: Request) {
  const authz = req.headers.get("authorization") || ""
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : ""
  if (!token) return null
  const db = createAdminClient()
  const { data, error } = await db.auth.getUser(token)
  if (error || !data?.user) return null
  return data.user
}

export async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return { user: null, ok: false, status: 401 as const }
  if (!isAdminEmail(user.email)) return { user, ok: false, status: 403 as const }
  return { user, ok: true as const, status: 200 as const }
}

export async function getAccessForUser(userId: string, email?: string | null) {
  const db = createAdminClient()
  const admin = isAdminEmail(email)
  const [{ data: sub }, { data: profile }, { data: plans }] = await Promise.all([
    db.from("app_subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    db.from("profiles").select("trial_ends_at, blocked").eq("id", userId).maybeSingle(),
    db.from("app_plans").select("*").order("sort_order"),
  ])
  const trialEndsAt = profile?.trial_ends_at ?? null
  const trialActive = !!trialEndsAt && new Date(trialEndsAt) > new Date()
  const paidActive = !!sub && sub.plan_slug !== "inicial" && ["active", "trialing"].includes(sub.status)
  const realSlug = admin ? "enterprise" : (sub?.plan_slug || "inicial")
  const effectiveSlug = admin ? "enterprise" : paidActive ? sub!.plan_slug : trialActive ? "pro" : realSlug
  const planList = plans || []
  const effPlan = planList.find((p) => p.slug === effectiveSlug)
  const realPlan = planList.find((p) => p.slug === realSlug)
  const hasAccess = admin || paidActive || trialActive
  return {
    isAdmin: admin, subscription: sub || null, plan: realPlan || null, plans: planList,
    trialActive, trialEndsAt, hasAccess, effectiveSlug, realSlug, limits: effPlan?.limits ?? {},
    blocked: !!profile?.blocked,
  }
}

export async function logAudit(entry: {
  actor?: string | null; actor_id?: string | null; level?: string; action: string
  target?: string; detail?: Record<string, unknown>; ip?: string | null; user_agent?: string | null
}) {
  try {
    await createAdminClient().from("audit_logs").insert({
      actor: entry.actor || null, actor_id: entry.actor_id || null, level: entry.level || "info",
      action: entry.action, target: entry.target || null, detail: entry.detail || {},
      ip: entry.ip || null, user_agent: entry.user_agent || null,
    })
  } catch { /* noop */ }
}

function toForm(obj: Record<string, unknown>, prefix = "", form = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === "object" && !Array.isArray(v)) toForm(v as Record<string, unknown>, key, form)
    else form.append(key, String(v))
  }
  return form
}

export async function stripeReq(path: string, body?: Record<string, unknown>, method = "POST") {
  const key = process.env.STRIPE_SECRET_KEY!
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? toForm(body).toString() : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || `Stripe error ${res.status}`)
  return json
}

export async function verifyStripeSignature(payload: string, sig: string | null, secret: string): Promise<boolean> {
  if (!sig || !secret) return false
  const parts = Object.fromEntries(sig.split(",").map((p) => p.split("=")))
  const t = parts["t"]; const v1 = parts["v1"]
  if (!t || !v1) return false
  const enc = new TextEncoder()
  const keyData = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = await crypto.subtle.sign("HMAC", keyData, enc.encode(`${t}.${payload}`))
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("")
  if (expected.length !== v1.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i)
  return diff === 0
}
