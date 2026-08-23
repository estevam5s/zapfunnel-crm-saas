"use client"

import { useAuth } from "@/contexts/auth-context"

// ── Mapa de funcionalidades por plano ────────────────────────────────────────
// Fonte da verdade: app_plans.limits (Supabase). Aqui traduzimos os limites
// crus em booleans/labels de negócio, com o plano mínimo que libera cada um.
export type FeatureKey =
  | "funnel" | "inbox"                          // Starter+
  | "aiReplies" | "automations" | "realTimeMetrics" | "prioritySupport"  // Pro+
  | "dedicatedApi" | "unlimitedUsers" | "successManager" | "slaSecurity"  // Enterprise

export const FEATURE_MIN_PLAN: Record<FeatureKey, "starter" | "pro" | "enterprise"> = {
  funnel: "starter",
  inbox: "starter",
  aiReplies: "pro",
  automations: "pro",
  realTimeMetrics: "pro",
  prioritySupport: "pro",
  dedicatedApi: "enterprise",
  unlimitedUsers: "enterprise",
  successManager: "enterprise",
  slaSecurity: "enterprise",
}

// chave em limits (Supabase) que representa cada feature
const LIMIT_KEY: Record<FeatureKey, string> = {
  funnel: "funnel",
  inbox: "inbox",
  aiReplies: "ai_replies",
  automations: "automations",
  realTimeMetrics: "real_time_metrics",
  prioritySupport: "priority_support",
  dedicatedApi: "dedicated_api",
  unlimitedUsers: "unlimited_users",
  successManager: "success_manager",
  slaSecurity: "sla_security",
}

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  funnel: "Funil de vendas visual",
  inbox: "Inbox unificado",
  aiReplies: "Respostas com IA",
  automations: "Automações de funil",
  realTimeMetrics: "Métricas em tempo real",
  prioritySupport: "Suporte prioritário",
  dedicatedApi: "API e integrações dedicadas",
  unlimitedUsers: "Usuários ilimitados",
  successManager: "Gerente de sucesso",
  slaSecurity: "SLA e segurança avançada",
}

const PLAN_LABEL: Record<string, string> = {
  inicial: "Inicial", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
}

const isUnlimited = (v: unknown) => v === -1 || v === "unlimited" || v === Infinity

export function usePlan() {
  const { sub, isAdmin } = useAuth()
  const limits: Record<string, any> = sub?.limits ?? {}
  const slug: string = isAdmin ? "enterprise" : (sub?.plan?.slug ?? "inicial")
  const planName = isAdmin ? "Admin" : (sub?.plan?.name ?? PLAN_LABEL[slug] ?? "Inicial")

  const can = (f: FeatureKey): boolean => {
    if (isAdmin) return true
    const v = limits[LIMIT_KEY[f]]
    // flags booleanas (ai_replies, api…) ou limites numéricos (funnel/inbox sempre true no starter+)
    if (typeof v === "boolean") return v
    if (typeof v === "number") return v !== 0
    return !!v
  }

  const waNumbers = { limit: limits.wa_numbers ?? 1, unlimited: isUnlimited(limits.wa_numbers) }
  const leads = { limit: limits.contacts ?? 100, unlimited: isUnlimited(limits.contacts) }
  const members = { limit: limits.members ?? 2, unlimited: isUnlimited(limits.members) }

  // plano mínimo (label) que desbloqueia uma feature — para o CTA de upgrade
  const requiredPlanLabel = (f: FeatureKey) => PLAN_LABEL[FEATURE_MIN_PLAN[f]]

  return {
    slug, planName, isAdmin, limits,
    can, requiredPlanLabel,
    waNumbers, leads, members,
    // atalhos
    aiReplies: can("aiReplies"),
    automations: can("automations"),
    realTimeMetrics: can("realTimeMetrics"),
    prioritySupport: can("prioritySupport"),
    dedicatedApi: can("dedicatedApi"),
    unlimitedUsers: can("unlimitedUsers"),
    successManager: can("successManager"),
    slaSecurity: can("slaSecurity"),
  }
}
