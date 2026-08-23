"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/contexts/auth-context"

/**
 * Conta as mensagens não lidas das conversas reais do usuário.
 * Retorna 0 enquanto não houver WhatsApp conectado / sem conversas —
 * nada de números fictícios.
 */
export function useUnreadCount(pollMs = 20000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const r = await authFetch("/api/conversations")
        if (!r.ok) return
        const { conversations } = await r.json()
        const total = (conversations || []).reduce((s: number, c: any) => s + (c.unread || 0), 0)
        if (alive) setCount(total)
      } catch {
        /* silencioso */
      }
    }
    load()
    const t = setInterval(load, pollMs)
    return () => { alive = false; clearInterval(t) }
  }, [pollMs])

  return count
}
