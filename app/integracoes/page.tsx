"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, KeyRound, Webhook, Plug, ShieldCheck, Users, Headset, Plus, Trash2, Loader2, Check, X, Power } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { authFetch } from "@/contexts/auth-context"
import { usePlan } from "@/hooks/use-plan"

type Key = { id: string; name: string; prefix: string; created_at: string; last_used_at: string | null }
type Wh = { id: string; url: string; events: string[]; secret: string; active: boolean; last_status: number | null }

const CONNECTORS = [
  { name: "Zapier", desc: "Conecte a 6.000+ apps sem código.", href: "https://zapier.com" },
  { name: "n8n", desc: "Automação self-hosted e workflows avançados.", href: "/api/integrations/n8n" },
  { name: "Google Sheets", desc: "Exporte leads e métricas em tempo real.", href: "#webhooks" },
  { name: "RD Station", desc: "Sincronize leads com o marketing.", href: "#webhooks" },
  { name: "Pipedrive", desc: "Espelhe negócios entre CRMs.", href: "#webhooks" },
  { name: "Webhook custom", desc: "Receba eventos em qualquer endpoint.", href: "#webhooks" },
]

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const show = (text: string, ok = true) => { setMsg({ ok, text }); setTimeout(() => setMsg(null), 3500) }
  return { msg, show }
}

export default function IntegracoesPage() {
  const { unlimitedUsers, successManager, slaSecurity } = usePlan()
  const { msg, show } = useToast()

  const [keys, setKeys] = useState<Key[]>([])
  const [keyLimit, setKeyLimit] = useState(0)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [genKey, setGenKey] = useState(false)

  const [webhooks, setWebhooks] = useState<Wh[]>([])
  const [whLimit, setWhLimit] = useState(0)
  const [whUrl, setWhUrl] = useState("")
  const [addingWh, setAddingWh] = useState(false)

  const load = useCallback(async () => {
    try {
      const [k, w] = await Promise.all([
        authFetch("/api/integrations/keys").then((r) => r.json()),
        authFetch("/api/integrations/webhooks").then((r) => r.json()),
      ])
      setKeys(k.keys || []); setKeyLimit(k.limit ?? 0)
      setWebhooks(w.webhooks || []); setWhLimit(w.limit ?? 0)
    } catch { /* ignore */ }
  }, [])
  useEffect(() => { load() }, [load])

  async function generateKey() {
    setGenKey(true); setNewKey(null)
    try {
      const res = await authFetch("/api/integrations/keys", { method: "POST", body: JSON.stringify({ name: "Chave de API" }) })
      const d = await res.json()
      if (!res.ok) return show(d.error || "Falha ao gerar chave.", false)
      setNewKey(d.plain)
      await load()
      show("Chave gerada! Copie agora — ela não será exibida novamente.")
    } finally { setGenKey(false) }
  }
  async function revokeKey(id: string) {
    if (!confirm("Revogar esta chave? Integrações que a usam vão parar de funcionar.")) return
    await authFetch(`/api/integrations/keys?id=${id}`, { method: "DELETE" })
    await load(); show("Chave revogada.")
  }
  async function addWebhook() {
    if (!whUrl.trim()) return
    setAddingWh(true)
    try {
      const res = await authFetch("/api/integrations/webhooks", { method: "POST", body: JSON.stringify({ url: whUrl.trim() }) })
      const d = await res.json()
      if (!res.ok) return show(d.error || "Falha ao adicionar webhook.", false)
      setWhUrl(""); await load(); show("Webhook adicionado!")
    } finally { setAddingWh(false) }
  }
  async function toggleWebhook(w: Wh) {
    await authFetch("/api/integrations/webhooks", { method: "PATCH", body: JSON.stringify({ id: w.id, active: !w.active }) })
    await load()
  }
  async function deleteWebhook(id: string) {
    await authFetch(`/api/integrations/webhooks?id=${id}`, { method: "DELETE" })
    await load(); show("Webhook removido.")
  }

  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => show("Copiado!"))
  const limitLabel = (used: number, limit: number) => (limit === -1 ? `${used} · ilimitado` : `${used} de ${limit}`)
  const keyBlocked = keyLimit === 0
  const whBlocked = whLimit === 0

  return (
    <AppShell title="API & Integrações" subtitle="API REST, webhooks e conectores">
      {msg && (
        <div className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${msg.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {msg.ok ? <Check className="size-4" /> : <X className="size-4" />} {msg.text}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* API Keys */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-accent" />
              <h3 className="font-semibold text-foreground">Chaves de API</h3>
            </div>
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {limitLabel(keys.length, keyLimit)}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Autentique na API REST do ZapFunnel com <code className="rounded bg-secondary/60 px-1">x-api-key</code>. Ex.:{" "}
            <code className="rounded bg-secondary/60 px-1">GET /api/v1/crm/leads</code>.
          </p>

          {newKey && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="mb-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Copie sua chave agora — ela não será exibida de novo:</p>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="flex-1 truncate">{newKey}</span>
                <button onClick={() => copy(newKey)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Copy className="size-3.5" /> Copiar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm">
                <span className="flex-1 truncate font-mono text-foreground">{k.prefix}••••••••</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {k.last_used_at ? `usada ${new Date(k.last_used_at).toLocaleDateString("pt-BR")}` : "nunca usada"}
                </span>
                <button onClick={() => revokeKey(k.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10" title="Revogar"><Trash2 className="size-4" /></button>
              </div>
            ))}
            {keys.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma chave criada ainda.</p>}
          </div>

          <button
            onClick={generateKey}
            disabled={genKey || keyBlocked || (keyLimit !== -1 && keys.length >= keyLimit)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {genKey ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {keyBlocked ? "Indisponível no seu plano" : "Gerar nova chave"}
          </button>
        </div>

        {/* Webhooks */}
        <div id="webhooks" className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Webhook className="size-5 text-accent" />
              <h3 className="font-semibold text-foreground">Webhooks</h3>
            </div>
            <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {limitLabel(webhooks.length, whLimit)}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Receba eventos (novo lead, mensagem, mudança de etapa) num endpoint HTTPS.</p>

          <div className="mb-3 space-y-2">
            {webhooks.map((w) => (
              <div key={w.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <span className={`size-2 shrink-0 rounded-full ${w.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span className="flex-1 truncate text-sm text-foreground">{w.url}</span>
                  <button onClick={() => toggleWebhook(w)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary" title={w.active ? "Pausar" : "Ativar"}><Power className="size-4" /></button>
                  <button onClick={() => deleteWebhook(w.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10" title="Remover"><Trash2 className="size-4" /></button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {w.events.map((e) => <span key={e} className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{e}</span>)}
                  <button onClick={() => copy(w.secret)} className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><Copy className="size-3" /> segredo</button>
                </div>
              </div>
            ))}
            {webhooks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum webhook configurado.</p>}
          </div>

          {!whBlocked && (whLimit === -1 || webhooks.length < whLimit) ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={whUrl}
                onChange={(e) => setWhUrl(e.target.value)}
                placeholder="https://seu-endpoint.com/webhook"
                className="flex-1 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button onClick={addWebhook} disabled={addingWh || !whUrl.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50">
                {addingWh ? <Loader2 className="size-4 animate-spin" /> : <Plug className="size-4" />} Adicionar
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{whBlocked ? "Webhooks indisponíveis no seu plano — faça upgrade." : "Limite de webhooks atingido no seu plano."}</p>
          )}
        </div>

        {/* Conectores */}
        <div>
          <h3 className="mb-3 font-semibold text-foreground">Conectores</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONNECTORS.map((i) => (
              <div key={i.name} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium text-foreground">{i.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
                <a href={i.href} className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">Conectar →</a>
              </div>
            ))}
          </div>
        </div>

        {/* Benefícios Enterprise */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Users, on: unlimitedUsers, title: "Usuários ilimitados", desc: "Adicione toda a equipe, sem teto de assentos." },
            { icon: Headset, on: successManager, title: "Gerente de sucesso", desc: "Onboarding assistido e acompanhamento dedicado." },
            { icon: ShieldCheck, on: slaSecurity, title: "SLA e segurança avançada", desc: "SSO, auditoria e acordo de nível de serviço." },
          ].map((b) => {
            const Icon = b.icon
            return (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-5">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
                <p className="font-semibold text-foreground">{b.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                {b.on
                  ? <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Ativo</span>
                  : <span className="mt-2 inline-block rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Enterprise</span>}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
