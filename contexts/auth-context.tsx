"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)

export type SubData = {
  subscription: any; plan: any; plans: any[]; is_admin: boolean
  trial_active: boolean; trial_ends_at: string | null; has_access: boolean; limits: Record<string, any>
}

interface AuthCtx {
  user: any; loading: boolean; sub: SubData | null; isAdmin: boolean; hasAccess: boolean
  signIn: (e: string, p: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (e: string, p: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>; reload: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export async function authFetch(path: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  // NÃO forçar Content-Type quando o body é FormData/Blob — o browser precisa
  // definir o boundary do multipart/form-data (senão o upload de avatar dá 400).
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData
  return fetch(path, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.body && !isForm ? { "Content-Type": "application/json" } : {}),
    },
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<SubData | null>(null)

  const loadSub = useCallback(async () => {
    try { const res = await authFetch("/api/subscription"); if (res.ok) setSub(await res.json()) } catch { /* noop */ }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null); setLoading(false); if (session?.user) loadSub()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null); if (session?.user) loadSub(); else setSub(null)
    })
    return () => subscription.unsubscribe()
  }, [loadSub])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) await loadSub()
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } })
    return { error }
  }
  const signUp = async (email: string, password: string, full_name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } })
    if (error) return { error }
    if (!data.session) { const r = await supabase.auth.signInWithPassword({ email, password }); if (!r.error) await loadSub(); return { error: r.error } }
    await loadSub(); return { error: null }
  }
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setSub(null) }

  const isAdmin = !!user?.email && ADMINS.includes(user.email.toLowerCase())
  const hasAccess = isAdmin || !!sub?.has_access

  return (
    <Ctx.Provider value={{ user, loading, sub, isAdmin, hasAccess, signIn, signInWithGoogle, signUp, signOut, reload: loadSub }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error("useAuth must be used within AuthProvider")
  return c
}
