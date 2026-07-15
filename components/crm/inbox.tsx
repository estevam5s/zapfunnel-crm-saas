"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Search, Send, Loader2, MessageCircle, Sparkles, Lock, Check, CheckCheck, Pencil, Trash2, X, MoreVertical } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { usePlan } from "@/hooks/use-plan"

// Sugestões simuladas de IA (feature Pro). Preenchem o rascunho.
const AI_SUGGESTIONS = [
  "Olá! Tudo bem? Vi seu interesse e posso te ajudar agora mesmo. Qual a melhor forma de te atender?",
  "Perfeito! Consigo fechar isso hoje com uma condição especial. Posso te enviar os detalhes?",
  "Entendo sua dúvida. Deixa eu te explicar rapidinho como funciona e já resolvemos por aqui.",
]

type Conv = { id: string; last_message: string; last_message_at: string; unread: number; contact: { name: string; phone: string; wa_id: string; avatar_url?: string | null } }
type Msg = { id: string; direction: "in" | "out"; body: string; status: string; created_at: string; edited_at?: string | null; deleted?: boolean }

function Avatar({ name, url, size = 40 }: { name?: string | null; url?: string | null; size?: number }) {
  const [err, setErr] = useState(false)
  const initials = (name || "?").slice(0, 2).toUpperCase()
  if (url && !err) return <img src={url} alt="" onError={() => setErr(true)} style={{ width: size, height: size }} className="rounded-full object-cover bg-muted shrink-0" />
  return <div style={{ width: size, height: size }} className="rounded-full bg-emerald-600 text-white grid place-items-center text-sm font-semibold shrink-0">{initials}</div>
}

const hhmm = (iso: string) => (iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "")

// Confirmação de leitura (✓ enviado, ✓✓ entregue, ✓✓ azul lido).
function Receipt({ status }: { status: string }) {
  if (status === "read") return <CheckCheck className="size-3.5 text-sky-300" />
  if (status === "delivered") return <CheckCheck className="size-3.5 text-white/70" />
  if (status === "sending") return <Loader2 className="size-3 animate-spin text-white/60" />
  if (status === "failed") return <span className="text-[10px] text-red-200">falhou</span>
  return <Check className="size-3.5 text-white/70" />
}

export function Inbox() {
  const [convs, setConvs] = useState<Conv[]>([])
  const [active, setActive] = useState<Conv | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [aiOn, setAiOn] = useState(false)
  const [typing, setTyping] = useState(false)
  const [editing, setEditing] = useState<Msg | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const typingSentRef = useRef(0)
  const { aiReplies, requiredPlanLabel } = usePlan()

  const suggestAi = () => {
    setAiOn(true)
    setDraft(AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)])
    setTimeout(() => setAiOn(false), 400)
  }

  const loadConvs = useCallback(async () => {
    const r = await authFetch("/api/conversations")
    if (r.ok) setConvs((await r.json()).conversations || [])
    setLoading(false)
  }, [])
  useEffect(() => { loadConvs() }, [loadConvs])
  useEffect(() => { const t = setInterval(loadConvs, 15000); return () => clearInterval(t) }, [loadConvs])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, sending, typing])

  const refreshMsgs = useCallback(async (convId: string) => {
    const r = await authFetch(`/api/conversations?id=${convId}`)
    if (r.ok) { const d = await r.json(); setMsgs(d.messages || []); setTyping(!!d.typing) }
  }, [])

  // enquanto a conversa está aberta, atualiza mensagens + status de digitação a cada 3s
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => refreshMsgs(active.id), 3000)
    return () => clearInterval(t)
  }, [active, refreshMsgs])

  async function open(c: Conv) {
    setActive(c); setEditing(null); setMenuFor(null)
    await refreshMsgs(c.id)
    setConvs((cs) => cs.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)))
  }

  // envia "digitando" (com throttle de 2.5s) enquanto o usuário digita
  function onDraftChange(v: string) {
    setDraft(v)
    if (!active) return
    const now = Date.now()
    if (now - typingSentRef.current > 2500) {
      typingSentRef.current = now
      authFetch("/api/whatsapp/typing", { method: "POST", body: JSON.stringify({ conversation_id: active.id, state: "composing" }) }).catch(() => {})
    }
  }

  async function send() {
    const body = draft.trim()
    if (!body || !active || sending) return

    // modo edição
    if (editing) {
      const id = editing.id
      setEditing(null); setDraft("")
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, body, edited_at: new Date().toISOString() } : x)))
      await authFetch("/api/whatsapp/message", { method: "PATCH", body: JSON.stringify({ id, body }) })
      refreshMsgs(active.id)
      return
    }

    setDraft(""); setSending(true)
    setMsgs((m) => [...m, { id: "tmp" + Date.now(), direction: "out", body, status: "sending", created_at: new Date().toISOString() }])
    try {
      const r = await authFetch("/api/whatsapp/send", { method: "POST", body: JSON.stringify({ conversation_id: active.id, body }) })
      if (r.ok) { await refreshMsgs(active.id); loadConvs() }
    } finally { setSending(false) }
  }

  async function del(m: Msg) {
    if (!active) return
    setMenuFor(null)
    if (!confirm("Apagar esta mensagem para todos?")) return
    setMsgs((ms) => ms.map((x) => (x.id === m.id ? { ...x, deleted: true, body: "" } : x)))
    await authFetch(`/api/whatsapp/message?id=${m.id}`, { method: "DELETE" })
    refreshMsgs(active.id)
  }

  function startEdit(m: Msg) {
    setEditing(m); setDraft(m.body); setMenuFor(null)
  }

  const filtered = convs.filter((c) => (c.contact?.name || "").toLowerCase().includes(query.toLowerCase()) || (c.contact?.phone || "").includes(query))

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card">
      {/* Lista */}
      <div className="flex w-full max-w-[340px] flex-col border-r border-border">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar conversas…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border text-sm outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid place-items-center py-16"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground"><MessageCircle className="size-8 mx-auto mb-2 opacity-40" />Nenhuma conversa ainda.<br />Conecte o WhatsApp para trazê-las.</div>
          ) : filtered.map((c) => (
            <button key={c.id} onClick={() => open(c)} className={cn("w-full flex items-center gap-3 px-4 py-3 border-b border-border text-left hover:bg-muted/40 transition", active?.id === c.id && "bg-muted/60")}>
              <Avatar name={c.contact?.name} url={c.contact?.avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground text-sm truncate">{c.contact?.name || c.contact?.phone}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{hhmm(c.last_message_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
                  {c.unread > 0 && <span className="size-5 rounded-full bg-emerald-600 text-white text-[10px] grid place-items-center shrink-0">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat — fundo na cor do WhatsApp (#0b141a) + doodle */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#0b141a] bg-[url('/inbox-doodle.svg')] bg-repeat">
        {!active ? (
          <div className="flex-1 grid place-items-center text-center text-muted-foreground/80">
            <div><MessageCircle className="size-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Selecione uma conversa</p></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[#202c33]">
              <Avatar name={active.contact?.name} url={active.contact?.avatar_url} size={36} />
              <div>
                <p className="font-medium text-foreground text-sm">{active.contact?.name}</p>
                <p className="text-xs text-muted-foreground">{typing ? <span className="text-emerald-600">digitando…</span> : active.contact?.phone}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" onClick={() => setMenuFor(null)}>
              {msgs.map((m) => (
                <div key={m.id} className={cn("group flex items-end gap-1", m.direction === "out" ? "justify-end" : "justify-start")}>
                  {/* ações (só mensagens enviadas, não apagadas) */}
                  {m.direction === "out" && !m.deleted && !String(m.id).startsWith("tmp") && (
                    <div className="relative self-center">
                      <button onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === m.id ? null : m.id) }} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground">
                        <MoreVertical className="size-4" />
                      </button>
                      {menuFor === m.id && (
                        <div className="absolute right-0 bottom-6 z-10 w-32 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                          <button onClick={(e) => { e.stopPropagation(); startEdit(m) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"><Pencil className="size-3.5" /> Editar</button>
                          <button onClick={(e) => { e.stopPropagation(); del(m) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-muted"><Trash2 className="size-3.5" /> Apagar</button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm", m.deleted ? "bg-muted/50 border border-border italic text-muted-foreground" : m.direction === "out" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-card border border-border rounded-bl-sm")}>
                    {m.deleted ? (
                      <p className="flex items-center gap-1.5"><Trash2 className="size-3.5" /> Mensagem apagada</p>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    )}
                    <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10px]", m.direction === "out" && !m.deleted ? "text-white/70" : "text-muted-foreground")}>
                      {m.edited_at && !m.deleted && <span className="italic">editada</span>}
                      {hhmm(m.created_at)}
                      {m.direction === "out" && !m.deleted && <Receipt status={m.status} />}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                    <span className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {editing && (
              <div className="flex items-center justify-between gap-2 border-t border-border bg-amber-500/10 px-4 py-2 text-xs text-amber-700">
                <span className="flex items-center gap-1.5"><Pencil className="size-3.5" /> Editando mensagem</span>
                <button onClick={() => { setEditing(null); setDraft("") }} className="hover:text-foreground"><X className="size-4" /></button>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2 p-3 border-t border-border bg-[#202c33]">
              {aiReplies ? (
                <button type="button" onClick={suggestAi} title="Sugerir resposta com IA"
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 text-sm font-medium text-accent transition hover:bg-accent/20">
                  <Sparkles className={cn("size-4", aiOn && "animate-spin")} /> <span className="hidden sm:inline">IA</span>
                </button>
              ) : (
                <Link href="/gerenciar-plano" title={`Respostas com IA — plano ${requiredPlanLabel("aiReplies")}`}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                  <Lock className="size-3.5" /> <span className="hidden sm:inline">IA</span>
                </Link>
              )}
              <input value={draft} onChange={(e) => onDraftChange(e.target.value)} placeholder={editing ? "Edite a mensagem…" : "Digite uma mensagem…"} className="flex-1 px-4 py-2.5 rounded-full bg-muted/50 border border-border text-sm outline-none" />
              <button type="submit" disabled={sending || !draft.trim()} className="size-10 rounded-full bg-emerald-600 text-white grid place-items-center disabled:opacity-40 hover:bg-emerald-700 transition">
                {sending ? <Loader2 className="size-4 animate-spin" /> : editing ? <Check className="size-4" /> : <Send className="size-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
