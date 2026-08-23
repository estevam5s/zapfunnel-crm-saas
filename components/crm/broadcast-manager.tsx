"use client"

import { useEffect, useState } from "react"
import { Plus, Megaphone, Send, Users, Clock, CheckCheck, X, Loader2, AlertTriangle } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type Broadcast = {
  id: string
  name: string
  message: string
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  total: number
  sent_count: number
  failed_count: number
  scheduled_at: string | null
  created_at: string
}

const STATUS: Record<Broadcast["status"], { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
  scheduled: { label: "Agendada", cls: "bg-amber-500/15 text-amber-600" },
  sending: { label: "Enviando…", cls: "bg-blue-500/15 text-blue-600" },
  sent: { label: "Enviada", cls: "bg-emerald-500/15 text-emerald-600" },
  failed: { label: "Falhou", cls: "bg-red-500/15 text-red-600" },
}

export function BroadcastManager() {
  const [list, setList] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const r = await authFetch("/api/broadcast")
    if (r.ok) setList((await r.json()).broadcasts || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function fire(id: string) {
    setSendingId(id)
    const r = await authFetch(`/api/broadcast/${id}/send`, { method: "POST" })
    const d = await r.json().catch(() => ({}))
    if (d.offline) alert("Nenhuma conexão WhatsApp ativa. Conecte um número em 'Conectar WhatsApp' antes de disparar.")
    setSendingId(null)
    load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Crie campanhas e dispare mensagens para segmentos de contatos.</p>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="size-4" /> Nova campanha
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Megaphone className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-foreground">Nenhuma campanha ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Crie sua primeira campanha de broadcast para alcançar seus contatos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((b) => {
            const st = STATUS[b.status]
            const pct = b.total ? Math.round((b.sent_count / b.total) * 100) : 0
            return (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{b.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.message}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", st.cls)}>{st.label}</span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {b.total} contatos</span>
                  {b.sent_count > 0 && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCheck className="size-3.5" /> {b.sent_count}</span>}
                  {b.failed_count > 0 && <span className="inline-flex items-center gap-1 text-red-600"><AlertTriangle className="size-3.5" /> {b.failed_count}</span>}
                </div>
                {b.status === "sending" || pct > 0 ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                ) : null}
                {(b.status === "draft" || b.status === "scheduled") && (
                  <button
                    onClick={() => fire(b.id)}
                    disabled={sendingId === b.id}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {sendingId === b.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {sendingId === b.id ? "Enviando…" : "Disparar agora"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {open && <NewBroadcastModal onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load() }} />}
    </div>
  )
}

function NewBroadcastModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [all, setAll] = useState(true)
  const [scheduled, setScheduled] = useState("")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) { setErr("Preencha o nome e a mensagem."); return }
    setSaving(true); setErr("")
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    const r = await authFetch("/api/broadcast", {
      method: "POST",
      body: JSON.stringify({ name, message, audience: { all: all || tags.length === 0, tags }, scheduled_at: scheduled || null }),
    })
    setSaving(false)
    if (!r.ok) { setErr((await r.json().catch(() => ({}))).error || "Erro ao criar campanha."); return }
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Nova campanha de broadcast</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Nome da campanha</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Promoção de Julho" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Mensagem</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Digite a mensagem que será enviada…" className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="size-4 accent-primary" />
              Enviar para todos os contatos
            </label>
            {!all && (
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Etiquetas (separadas por vírgula): cliente, lead-quente" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            )}
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"><Clock className="size-3.5" /> Agendar (opcional)</label>
            <input type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />} Criar campanha
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
