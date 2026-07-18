"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { authFetch } from "@/contexts/auth-context"
type F = { id: number; name: string | null; email: string | null; type: string; message: string; created_at: string }
const TL: Record<string, string> = { sugestao: "Sugestão", elogio: "Elogio", critica: "Crítica", bug: "Problema", outro: "Outro" }
export default function AdminFeedback() {
  const { isAdmin, loading } = useAuth()
  const [items, setItems] = useState<F[]>([]); const [ready, setReady] = useState(false)
  useEffect(() => { if (loading) return; if (!isAdmin) { setReady(true); return } authFetch("/api/feedback").then((r) => r.json()).then((d) => setItems(d.items || [])).finally(() => setReady(true)) }, [loading, isAdmin])
  if (loading || !ready) return <div className="p-6 text-muted-foreground">Carregando…</div>
  if (!isAdmin) return <div className="p-6 text-muted-foreground">Acesso restrito ao administrador.</div>
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
      <p className="mt-1 text-sm text-muted-foreground">{items.length} mensagem(ns).</p>
      {items.length === 0 ? (<div className="mt-6 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">Nenhum feedback ainda.</div>) : (
        <div className="mt-6 space-y-3">{items.map((f) => (
          <div key={f.id} className="rounded-xl border bg-card p-4"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-medium text-green-600">{TL[f.type] ?? f.type}</span><span className="text-sm font-medium text-foreground">{f.name || "Anônimo"}</span>{f.email && <span className="text-xs text-muted-foreground">· {f.email}</span>}<span className="ml-auto text-xs text-muted-foreground">{new Date(f.created_at).toLocaleString("pt-BR")}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{f.message}</p></div>
        ))}</div>
      )}
    </div>
  )
}
