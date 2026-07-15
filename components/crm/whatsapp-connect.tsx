"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RefreshCw, Smartphone, CheckCircle2, Loader2, ShieldCheck, Wifi, Plus, Trash2, Crown, Phone } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type Status = "idle" | "loading" | "ready" | "connected" | "error"
type Conn = { id: string; label: string | null; phone: string | null; status: string; connected_at?: string | null }

const steps = [
  "Abra o WhatsApp no seu celular",
  "Toque em Menu ou Configurações e selecione Aparelhos conectados",
  "Toque em Conectar um aparelho",
  "Aponte a câmera para esta tela para ler o código",
]

export function WhatsappConnect() {
  const [conns, setConns] = useState<Conn[]>([])
  const [limit, setLimit] = useState(1)
  const [status, setStatus] = useState<Status>("idle")
  const [qr, setQr] = useState("")
  const [connId, setConnId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [adding, setAdding] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadConns = useCallback(async () => {
    const r = await authFetch("/api/whatsapp/connection")
    if (r.ok) { const d = await r.json(); setConns(d.connections || []); if (typeof d.limit === "number") setLimit(d.limit) }
  }, [])

  const connectedCount = conns.filter((c) => c.status === "connected").length
  const activeCount = conns.filter((c) => c.status === "connected" || c.status === "pending").length
  const canAddMore = activeCount < limit

  const start = useCallback(async () => {
    setStatus("loading"); setError(""); setQr(""); setConnId(null); setAdding(true)
    const r = await authFetch("/api/whatsapp/connection", { method: "POST", body: JSON.stringify({ channel: "qr" }) })
    const d = await r.json().catch(() => ({}))
    if (!r.ok || !d.qr) {
      setError(d.error || "Não foi possível gerar o QR Code."); setStatus("error")
      if (d.code === "WA_LIMIT") setAdding(false)
      return
    }
    setQr(d.qr); setConnId(d.connection?.id || null); setStatus("ready")
  }, [])

  useEffect(() => { loadConns() }, [loadConns])

  // poll acelerado: 2s enquanto o QR está na tela
  useEffect(() => {
    if (status !== "ready" || !connId) return
    let n = 0
    pollRef.current = setInterval(async () => {
      n++
      const r = await authFetch(`/api/whatsapp/qr-status?id=${connId}`)
      if (!r.ok) return
      const d = await r.json()
      if (d.status === "connected") {
        setStatus("connected"); setAdding(false)
        if (pollRef.current) clearInterval(pollRef.current)
        authFetch("/api/whatsapp/sync-history", { method: "POST", body: JSON.stringify({ id: connId }) }).catch(() => {})
        loadConns()
      } else if (d.qr) setQr(d.qr)
      // após ~3min sem conectar, para de poluir a rede
      if (n > 90 && pollRef.current) clearInterval(pollRef.current)
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [status, connId, loadConns])

  async function removeConn(id: string) {
    if (!confirm("Desconectar este número?")) return
    await authFetch(`/api/whatsapp/connection?id=${id}`, { method: "DELETE" })
    loadConns()
  }

  const src = qr ? (qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`) : ""

  return (
    <div className="flex flex-col gap-6">
      {/* barra: contagem de números vs limite do plano */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Phone className="size-5" /></span>
          <div>
            <p className="text-sm font-semibold text-foreground">{connectedCount} de {limit === 999 ? "∞" : limit} número(s) conectado(s)</p>
            <p className="text-xs text-muted-foreground">
              {limit === 999 ? "Seu plano permite números ilimitados." : `Seu plano permite conectar ${limit} número${limit > 1 ? "s" : ""} de WhatsApp.`}
            </p>
          </div>
        </div>
        {!adding && canAddMore && (
          <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="size-4" /> Conectar número
          </button>
        )}
        {!adding && !canAddMore && (
          <a href="/gerenciar-plano" className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-500/20">
            <Crown className="size-4" /> Fazer upgrade
          </a>
        )}
      </div>

      {/* lista de números já conectados */}
      {conns.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conns.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl",
                c.status === "connected" ? "bg-emerald-500/15 text-emerald-600" : c.status === "pending" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground")}>
                {c.status === "connected" ? <Wifi className="size-5" /> : c.status === "pending" ? <Loader2 className="size-5 animate-spin" /> : <Smartphone className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{c.label || "WhatsApp"}</p>
                <p className="text-xs text-muted-foreground">{c.phone || (c.status === "connected" ? "Conectado" : c.status === "pending" ? "Aguardando leitura…" : "Desconectado")}</p>
              </div>
              <button onClick={() => removeConn(c.id)} className="text-muted-foreground hover:text-red-500" title="Desconectar"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* painel de conexão (QR) — só quando adicionando */}
      {adding && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center md:p-8">
            <div className="relative flex size-[260px] items-center justify-center overflow-hidden rounded-2xl bg-white p-3 sm:size-[300px]">
              {src && status !== "connected" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="QR Code para conectar o WhatsApp" className={cn("size-full transition-all duration-300", status === "loading" && "blur-sm opacity-40")} />
              )}
              {status === "loading" && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>}
              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 px-4">
                  <p className="text-sm font-medium text-[#0c0e14]">{error || "Código indisponível"}</p>
                  <button onClick={start} className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground"><RefreshCw className="size-4" /> Tentar de novo</button>
                </div>
              )}
              {status === "connected" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground"><CheckCircle2 className="size-12" /><p className="text-sm font-semibold">Conectado!</p></div>}
            </div>
            <div className="mt-5 text-sm">
              {status === "connected" ? <span className="flex items-center gap-1.5 font-medium text-primary"><Wifi className="size-4" /> Número conectado com sucesso</span>
                : status === "ready" ? <span className="text-muted-foreground">Escaneie o código — ele atualiza sozinho</span>
                : status === "loading" ? <span className="text-muted-foreground">Gerando código seguro…</span>
                : <span className="text-muted-foreground">Pronto para conectar</span>}
            </div>
            {status !== "connected" && status !== "error" && (
              <button onClick={start} disabled={status === "loading"} className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                <RefreshCw className={cn("size-4", status === "loading" && "animate-spin")} /> Atualizar QR Code
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            {status === "connected" ? (
              <div className="flex flex-1 flex-col justify-center rounded-xl border border-primary/40 bg-primary/5 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="size-6" /></div>
                <h2 className="mt-4 text-lg font-semibold">WhatsApp conectado</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Seu número está sincronizado. As conversas e contatos aparecem no Inbox automaticamente.</p>
                <button onClick={() => { setAdding(false); loadConns() }} className="mt-4 self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Concluir</button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2"><Smartphone className="size-5 text-primary" /><h2 className="text-sm font-semibold">Como conectar seu número</h2></div>
                <ol className="mt-5 flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{i + 1}</span>
                      <span className="text-sm leading-relaxed text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
                <button onClick={() => setAdding(false)} className="mt-5 text-xs font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* estado vazio */}
      {!adding && conns.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Smartphone className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-foreground">Nenhum número conectado</p>
          <p className="mt-1 text-sm text-muted-foreground">Conecte seu primeiro WhatsApp para começar a receber conversas no Inbox.</p>
          <button onClick={start} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="size-4" /> Conectar WhatsApp</button>
        </div>
      )}
    </div>
  )
}
