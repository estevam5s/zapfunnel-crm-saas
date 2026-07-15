"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus, Zap, GitBranch, Clock, Tag, MessageSquare, ArrowRight, ArrowDown,
  Loader2, Trash2, X, Bell, UserPlus,
} from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type Action = { type: string; config: any }
type Automation = {
  id: string
  name: string
  description: string | null
  trigger_type: string
  trigger_config: any
  actions: Action[]
  is_active: boolean
  execution_count: number
}

const TRIGGERS: Record<string, { label: string; icon: any }> = {
  new_message: { label: "Nova mensagem recebida", icon: MessageSquare },
  keyword: { label: "Palavra-chave", icon: Zap },
  new_contact: { label: "Novo contato", icon: UserPlus },
  deal_stage: { label: "Mudança de etapa no funil", icon: GitBranch },
  schedule: { label: "Agendamento", icon: Clock },
}
const ACTIONS: Record<string, { label: string; icon: any }> = {
  send_message: { label: "Enviar mensagem", icon: MessageSquare },
  add_tag: { label: "Adicionar etiqueta", icon: Tag },
  move_stage: { label: "Mover no funil", icon: GitBranch },
  notify: { label: "Notificar equipe", icon: Bell },
  wait: { label: "Aguardar", icon: Clock },
}

const TEMPLATES: Omit<Automation, "id" | "is_active" | "execution_count">[] = [
  { name: "Boas-vindas automáticas", description: "Ao entrar um novo contato, envia a 1ª mensagem em segundos.", trigger_type: "new_contact", trigger_config: {}, actions: [{ type: "send_message", config: { text: "Olá! 👋 Obrigado pelo contato. Como posso ajudar?" } }] },
  { name: "Follow-up sem resposta", description: "Se não houver resposta em 24h, dispara um lembrete.", trigger_type: "schedule", trigger_config: { after_hours: 24 }, actions: [{ type: "send_message", config: { text: "Oi! Ainda posso te ajudar com algo? 😊" } }] },
  { name: "Qualificar por palavra-chave", description: "Quando o contato diz \"quero comprar\", etiqueta como lead quente.", trigger_type: "keyword", trigger_config: { keyword: "quero comprar" }, actions: [{ type: "add_tag", config: { tag: "lead-quente" } }, { type: "notify", config: {} }] },
]

export function AutomationsManager() {
  const [list, setList] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Automation | null>(null)
  const [showNew, setShowNew] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await authFetch("/api/automations")
    if (r.ok) setList((await r.json()).automations || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  async function toggle(a: Automation) {
    await authFetch("/api/automations", { method: "PATCH", body: JSON.stringify({ id: a.id, is_active: !a.is_active }) })
    setList((l) => l.map((x) => (x.id === a.id ? { ...x, is_active: !x.is_active } : x)))
  }
  async function remove(id: string) {
    if (!confirm("Excluir esta automação?")) return
    await authFetch(`/api/automations?id=${id}`, { method: "DELETE" })
    load()
  }
  async function createFrom(tpl: Partial<Automation>) {
    await authFetch("/api/automations", { method: "POST", body: JSON.stringify({ ...tpl, is_active: true }) })
    setShowNew(false); setEditing(null); load()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Gatilho → ações em cadeia, no estilo N8N. As automações rodam sozinhas.</p>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="size-4" /> Nova automação
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((a) => {
            const T = TRIGGERS[a.trigger_type] || TRIGGERS.new_message
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent"><T.icon className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">{a.name}</h3>
                    {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground"><Zap className="size-3 text-accent" /> {T.label}</span>
                      {a.actions.map((ac, i) => {
                        const A = ACTIONS[ac.type] || ACTIONS.send_message
                        return (
                          <span key={i} className="inline-flex items-center gap-1">
                            <ArrowRight className="size-3 text-muted-foreground" />
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary"><A.icon className="size-3" /> {A.label}</span>
                          </span>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{a.execution_count} execuções</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" checked={a.is_active} onChange={() => toggle(a)} className="peer sr-only" />
                      <span className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                      <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                    </label>
                    <button onClick={() => remove(a.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(showNew || editing) && (
        <AutomationModal
          initial={editing}
          onClose={() => { setShowNew(false); setEditing(null) }}
          onSave={createFrom}
          templates={TEMPLATES}
        />
      )}
    </div>
  )
}

function AutomationModal({
  onClose, onSave, templates,
}: {
  initial: Automation | null
  onClose: () => void
  onSave: (a: Partial<Automation>) => void
  templates: Omit<Automation, "id" | "is_active" | "execution_count">[]
}) {
  const [name, setName] = useState("")
  const [triggerType, setTriggerType] = useState("new_message")
  const [triggerVal, setTriggerVal] = useState("")
  const [actions, setActions] = useState<Action[]>([{ type: "send_message", config: { text: "" } }])
  const [saving, setSaving] = useState(false)

  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    onSave({
      name,
      trigger_type: triggerType,
      trigger_config: triggerType === "keyword" ? { keyword: triggerVal } : {},
      actions,
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova automação</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>

        {/* templates rápidos */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Começar de um modelo</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {templates.map((t) => (
              <button key={t.name} onClick={() => onSave({ ...t, is_active: true } as Partial<Automation>)} className="rounded-xl border border-border p-3 text-left transition hover:border-primary hover:bg-muted/40">
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> ou crie do zero <span className="h-px flex-1 bg-border" /></div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nome</label>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Boas-vindas" />
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Zap className="size-3.5" /> QUANDO (gatilho)</p>
            <select className={inp} value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
              {Object.entries(TRIGGERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {triggerType === "keyword" && <input className={cn(inp, "mt-2")} placeholder="palavra-chave" value={triggerVal} onChange={(e) => setTriggerVal(e.target.value)} />}
          </div>

          <div className="grid place-items-center"><ArrowDown className="size-5 text-muted-foreground" /></div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary"><ArrowRight className="size-3.5" /> ENTÃO (ações)</p>
            <div className="space-y-2">
              {actions.map((ac, i) => (
                <div key={i} className="flex items-start gap-2">
                  <select className={cn(inp, "flex-1")} value={ac.type} onChange={(e) => setActions((as) => as.map((x, j) => (j === i ? { type: e.target.value, config: {} } : x)))}>
                    {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  {actions.length > 1 && <button type="button" onClick={() => setActions((as) => as.filter((_, j) => j !== i))} className="mt-2 text-muted-foreground hover:text-red-500"><X className="size-4" /></button>}
                </div>
              ))}
              {actions.map((ac, i) => (
                ac.type === "send_message" ? (
                  <textarea key={`t${i}`} rows={2} className={cn(inp, "resize-none")} placeholder="Texto da mensagem…" value={ac.config.text || ""} onChange={(e) => setActions((as) => as.map((x, j) => (j === i ? { ...x, config: { text: e.target.value } } : x)))} />
                ) : ac.type === "add_tag" ? (
                  <input key={`g${i}`} className={inp} placeholder="nome da etiqueta" value={ac.config.tag || ""} onChange={(e) => setActions((as) => as.map((x, j) => (j === i ? { ...x, config: { tag: e.target.value } } : x)))} />
                ) : null
              ))}
            </div>
            <button type="button" onClick={() => setActions((as) => [...as, { type: "add_tag", config: {} }])} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="size-3.5" /> Adicionar ação
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />} Criar automação
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
