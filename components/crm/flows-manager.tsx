"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Plus, Workflow, Play, Pause, Trash2, Loader2, ArrowLeft, Save,
  MessageSquare, HelpCircle, GitBranch, Tag, Clock, Zap, X,
  Image as ImageIcon, Sparkles, Webhook, UserCheck, Copy, FlaskConical, ServerCog,
} from "lucide-react"
import { authFetch } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

// ---------- tipos ----------
type NodeType = "trigger" | "message" | "question" | "condition" | "action" | "delay" | "media" | "ai" | "webhook" | "handoff"
type FNode = { key: string; type: NodeType; config: any; x: number; y: number }
type FEdge = { from: string; to: string; on?: string }
type Flow = {
  id: string
  name: string
  description: string | null
  status: "draft" | "active" | "paused"
  trigger_type: string
  trigger_config: any
  nodes: FNode[]
  edges: FEdge[]
  entry_node: string | null
  execution_count: number
}

const NODE_META: Record<NodeType, { label: string; icon: any; color: string }> = {
  trigger: { label: "Gatilho", icon: Zap, color: "#f59e0b" },
  message: { label: "Mensagem", icon: MessageSquare, color: "#22c55e" },
  question: { label: "Pergunta", icon: HelpCircle, color: "#3b82f6" },
  condition: { label: "Condição", icon: GitBranch, color: "#a855f7" },
  media: { label: "Mídia", icon: ImageIcon, color: "#06b6d4" },
  ai: { label: "Resposta IA", icon: Sparkles, color: "#eab308" },
  action: { label: "Ação", icon: Tag, color: "#ec4899" },
  delay: { label: "Espera", icon: Clock, color: "#64748b" },
  webhook: { label: "Webhook", icon: Webhook, color: "#8b5cf6" },
  handoff: { label: "Atendente", icon: UserCheck, color: "#f43f5e" },
}

// Modelos prontos de fluxo (1 clique).
const FLOW_TEMPLATES: { name: string; description: string; nodes: FNode[]; edges: FEdge[] }[] = [
  {
    name: "Menu de atendimento",
    description: "Recebe o contato, mostra opções e encaminha conforme a resposta.",
    nodes: [
      { key: "start", type: "trigger", config: { keyword: "menu" }, x: 60, y: 160 },
      { key: "m1", type: "message", config: { text: "Olá! 👋 Escolha uma opção:\n1️⃣ Vendas\n2️⃣ Suporte\n3️⃣ Falar com atendente" }, x: 300, y: 160 },
      { key: "q1", type: "question", config: { text: "Digite o número da opção" }, x: 540, y: 160 },
      { key: "h1", type: "handoff", config: {}, x: 780, y: 160 },
    ],
    edges: [{ from: "start", to: "m1" }, { from: "m1", to: "q1" }, { from: "q1", to: "h1" }],
  },
  {
    name: "Qualificação de lead",
    description: "Faz perguntas, etiqueta o lead e avisa a equipe.",
    nodes: [
      { key: "start", type: "trigger", config: {}, x: 60, y: 160 },
      { key: "m1", type: "message", config: { text: "Que bom te ver por aqui! Posso te fazer 2 perguntas rápidas?" }, x: 300, y: 160 },
      { key: "q1", type: "question", config: { text: "Qual o seu orçamento?" }, x: 540, y: 160 },
      { key: "t1", type: "action", config: { action: "add_tag", tag: "lead-qualificado" }, x: 780, y: 160 },
    ],
    edges: [{ from: "start", to: "m1" }, { from: "m1", to: "q1" }, { from: "q1", to: "t1" }],
  },
  {
    name: "Fora do horário",
    description: "Responde automaticamente quando ninguém está disponível.",
    nodes: [
      { key: "start", type: "trigger", config: {}, x: 60, y: 160 },
      { key: "m1", type: "message", config: { text: "Nosso horário é de 9h às 18h. Deixe sua mensagem que retornamos em breve! ⏰" }, x: 320, y: 160 },
    ],
    edges: [{ from: "start", to: "m1" }],
  },
]

// ============ LISTA ============
export function FlowsManager() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Flow | null>(null)
  const [engine, setEngine] = useState<{ connected: boolean; configured: boolean } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await authFetch("/api/flows")
    if (r.ok) setFlows((await r.json()).flows || [])
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { authFetch("/api/integrations/n8n").then((r) => r.ok && r.json().then(setEngine)).catch(() => {}) }, [])

  async function createWith(nodes: FNode[], edges: FEdge[], name: string) {
    const r = await authFetch("/api/flows", {
      method: "POST",
      body: JSON.stringify({ name, nodes, edges, entry_node: nodes.find((n) => n.type === "trigger")?.key || "start" }),
    })
    if (r.ok) { const { flow } = await r.json(); setEditing(flow) }
  }
  const create = () => createWith([{ key: "start", type: "trigger", config: { keyword: "oi" }, x: 80, y: 120 }], [], "Novo fluxo")

  async function duplicate(f: Flow) {
    await createWith(f.nodes || [], f.edges || [], `${f.name} (cópia)`)
  }

  async function toggle(f: Flow) {
    const status = f.status === "active" ? "paused" : "active"
    setFlows((fs) => fs.map((x) => (x.id === f.id ? { ...x, status } : x)))
    await authFetch("/api/flows", { method: "PATCH", body: JSON.stringify({ id: f.id, status, name: f.name }) })
    load()
  }
  async function remove(id: string) {
    if (!confirm("Excluir este fluxo?")) return
    await authFetch(`/api/flows?id=${id}`, { method: "DELETE" })
    load()
  }

  if (editing) return <FlowBuilder flow={editing} onBack={() => { setEditing(null); load() }} />

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Monte chatbots que respondem e qualificam seus contatos automaticamente.</p>
          {/* status do motor de automação (N8N) — só informa conectado/indisponível */}
          {engine && (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              engine.connected ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
              <ServerCog className="size-3.5" /> Motor {engine.connected ? "conectado" : "indisponível"}
            </span>
          )}
        </div>
        <button onClick={create} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="size-4" /> Novo fluxo
        </button>
      </div>

      {/* modelos prontos */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modelos prontos</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FLOW_TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => createWith(t.nodes, t.edges, t.name)} className="rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-muted/40">
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><p className="text-sm font-semibold text-foreground">{t.name}</p></div>
              <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>
      ) : flows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Workflow className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-foreground">Nenhum fluxo ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">Crie um chatbot conversacional para automatizar seu atendimento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Workflow className="size-5" /></span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium",
                  f.status === "active" ? "bg-emerald-500/15 text-emerald-600" : f.status === "paused" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground")}>
                  {f.status === "active" ? "Ativo" : f.status === "paused" ? "Pausado" : "Rascunho"}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{f.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{(f.nodes?.length || 0)} passos · {f.execution_count} execuções</p>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => setEditing(f)} className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50">Editar</button>
                <button onClick={() => toggle(f)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground" title={f.status === "active" ? "Pausar" : "Ativar"}>
                  {f.status === "active" ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <button onClick={() => duplicate(f)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground" title="Duplicar"><Copy className="size-4" /></button>
                <button onClick={() => remove(f.id)} className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-red-500"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ BUILDER VISUAL (canvas de nós, estilo N8N) ============
function FlowBuilder({ flow, onBack }: { flow: Flow; onBack: () => void }) {
  const [name, setName] = useState(flow.name)
  const [nodes, setNodes] = useState<FNode[]>(flow.nodes?.length ? flow.nodes : [{ key: "start", type: "trigger", config: {}, x: 80, y: 120 }])
  const [edges, setEdges] = useState<FEdge[]>(flow.edges || [])
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const dragRef = useRef<{ key: string; dx: number; dy: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  function addNode(type: NodeType) {
    const key = `n${Date.now().toString(36)}`
    setNodes((ns) => [...ns, { key, type, config: {}, x: 160 + Math.random() * 200, y: 100 + Math.random() * 200 }])
  }

  function onMouseDown(e: React.MouseEvent, key: string) {
    if (linkFrom) return
    const node = nodes.find((n) => n.key === key)!
    dragRef.current = { key, dx: e.clientX - node.x, dy: e.clientY - node.y }
    setSelected(key)
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    const { key, dx, dy } = dragRef.current
    setNodes((ns) => ns.map((n) => (n.key === key ? { ...n, x: e.clientX - dx, y: e.clientY - dy } : n)))
  }
  function onMouseUp() { dragRef.current = null }

  function startLink(key: string) { setLinkFrom(key) }
  function completeLink(key: string) {
    if (linkFrom && linkFrom !== key) {
      setEdges((es) => (es.some((e) => e.from === linkFrom && e.to === key) ? es : [...es, { from: linkFrom, to: key }]))
    }
    setLinkFrom(null)
  }

  function updateConfig(key: string, patch: any) {
    setNodes((ns) => ns.map((n) => (n.key === key ? { ...n, config: { ...n.config, ...patch } } : n)))
  }
  function deleteNode(key: string) {
    setNodes((ns) => ns.filter((n) => n.key !== key))
    setEdges((es) => es.filter((e) => e.from !== key && e.to !== key))
    setSelected(null)
  }

  async function save() {
    setSaving(true)
    await authFetch("/api/flows", {
      method: "PATCH",
      body: JSON.stringify({ id: flow.id, name, nodes, edges, entry_node: nodes.find((n) => n.type === "trigger")?.key || null }),
    })
    setSaving(false)
  }

  const sel = nodes.find((n) => n.key === selected)

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <button onClick={onBack} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft className="size-5" /></button>
        <input value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-sm font-semibold outline-none focus:bg-muted/50" />
        <div className="flex items-center gap-1">
          {(Object.keys(NODE_META) as NodeType[]).filter((t) => t !== "trigger").map((t) => {
            const M = NODE_META[t]
            return (
              <button key={t} onClick={() => addNode(t)} title={`Adicionar ${M.label}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium hover:bg-muted/50">
                <M.icon className="size-3.5" style={{ color: M.color }} /> {M.label}
              </button>
            )
          })}
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Salvar
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* canvas */}
        <div
          ref={canvasRef}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onClick={() => { if (linkFrom) setLinkFrom(null) }}
          className="relative flex-1 overflow-hidden bg-muted/20 bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] [background-size:20px_20px]"
        >
          {/* edges */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {edges.map((e, i) => {
              const a = nodes.find((n) => n.key === e.from); const b = nodes.find((n) => n.key === e.to)
              if (!a || !b) return null
              const x1 = a.x + 180, y1 = a.y + 28, x2 = b.x, y2 = b.y + 28
              const mx = (x1 + x2) / 2
              return <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} stroke="var(--primary)" strokeWidth="2" fill="none" />
            })}
          </svg>

          {/* nodes */}
          {nodes.map((n) => {
            const M = NODE_META[n.type]
            return (
              <div
                key={n.key}
                onMouseDown={(e) => onMouseDown(e, n.key)}
                onClick={(e) => { e.stopPropagation(); if (linkFrom) completeLink(n.key); else setSelected(n.key) }}
                style={{ left: n.x, top: n.y }}
                className={cn(
                  "absolute w-[180px] cursor-grab rounded-xl border-2 bg-card shadow-sm active:cursor-grabbing",
                  selected === n.key ? "border-primary" : "border-border",
                  linkFrom && linkFrom !== n.key && "ring-2 ring-primary/40",
                )}
              >
                <div className="flex items-center gap-2 rounded-t-[10px] px-3 py-2" style={{ background: `${M.color}18` }}>
                  <M.icon className="size-4" style={{ color: M.color }} />
                  <span className="text-xs font-semibold" style={{ color: M.color }}>{M.label}</span>
                </div>
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {n.type === "trigger" && (n.config.keyword ? `Palavra: "${n.config.keyword}"` : "Qualquer mensagem")}
                  {n.type === "message" && (n.config.text || "Mensagem…")}
                  {n.type === "question" && (n.config.text || "Pergunta…")}
                  {n.type === "condition" && (n.config.expr || "Se…")}
                  {n.type === "action" && (n.config.action || "Ação…")}
                  {n.type === "delay" && `Aguardar ${n.config.minutes || 5} min`}
                  {n.type === "media" && (n.config.url ? "Enviar mídia" : "Mídia…")}
                  {n.type === "ai" && (n.config.prompt || "Resposta com IA…")}
                  {n.type === "webhook" && (n.config.url || "Webhook…")}
                  {n.type === "handoff" && "Transferir p/ atendente"}
                </div>
                {/* connector out */}
                <button
                  onClick={(e) => { e.stopPropagation(); startLink(n.key) }}
                  title="Conectar a outro passo"
                  className="absolute -right-2.5 top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-card bg-primary text-primary-foreground"
                />
              </div>
            )
          })}

          {linkFrom && (
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Clique em um passo para conectar
            </div>
          )}
        </div>

        {/* painel de config */}
        {sel && (
          <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{NODE_META[sel.type].label}</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <NodeConfig node={sel} onChange={(p) => updateConfig(sel.key, p)} />
            {sel.type !== "trigger" && (
              <button onClick={() => deleteNode(sel.key)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10">
                <Trash2 className="size-4" /> Excluir passo
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

function NodeConfig({ node, onChange }: { node: FNode; onChange: (p: any) => void }) {
  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
  if (node.type === "trigger")
    return (
      <div className="space-y-3">
        <label className="block text-xs font-medium text-muted-foreground">Palavra-chave que inicia o fluxo</label>
        <input className={inp} placeholder="Ex.: oi, menu, começar" value={node.config.keyword || ""} onChange={(e) => onChange({ keyword: e.target.value })} />
        <p className="text-xs text-muted-foreground">Deixe vazio para acionar em qualquer mensagem recebida.</p>
      </div>
    )
  if (node.type === "message" || node.type === "question")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Texto {node.type === "question" ? "da pergunta" : "da mensagem"}</label>
        <textarea rows={4} className={cn(inp, "resize-none")} placeholder="Digite o texto…" value={node.config.text || ""} onChange={(e) => onChange({ text: e.target.value })} />
      </div>
    )
  if (node.type === "condition")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Condição (ex.: resposta contém "sim")</label>
        <input className={inp} placeholder='resposta contém "sim"' value={node.config.expr || ""} onChange={(e) => onChange({ expr: e.target.value })} />
      </div>
    )
  if (node.type === "action")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Ação</label>
        <select className={inp} value={node.config.action || ""} onChange={(e) => onChange({ action: e.target.value })}>
          <option value="">Selecione…</option>
          <option value="add_tag">Adicionar etiqueta</option>
          <option value="move_stage">Mover no funil</option>
          <option value="notify">Notificar equipe</option>
          <option value="handoff">Transferir para humano</option>
        </select>
        {node.config.action === "add_tag" && <input className={inp} placeholder="nome da etiqueta" value={node.config.tag || ""} onChange={(e) => onChange({ tag: e.target.value })} />}
      </div>
    )
  if (node.type === "media")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">URL da mídia (imagem, PDF, áudio)</label>
        <input className={inp} placeholder="https://…" value={node.config.url || ""} onChange={(e) => onChange({ url: e.target.value })} />
        <label className="block text-xs font-medium text-muted-foreground">Legenda (opcional)</label>
        <input className={inp} placeholder="Legenda…" value={node.config.caption || ""} onChange={(e) => onChange({ caption: e.target.value })} />
      </div>
    )
  if (node.type === "ai")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Instrução para a IA responder</label>
        <textarea rows={3} className={cn(inp, "resize-none")} placeholder="Ex.: Responda dúvidas sobre preços de forma simpática." value={node.config.prompt || ""} onChange={(e) => onChange({ prompt: e.target.value })} />
        <p className="text-xs text-muted-foreground">A IA usa o contexto da conversa para gerar a resposta.</p>
      </div>
    )
  if (node.type === "webhook")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">URL do webhook (integração externa)</label>
        <input className={inp} placeholder="https://sua-api.com/hook" value={node.config.url || ""} onChange={(e) => onChange({ url: e.target.value })} />
        <p className="text-xs text-muted-foreground">Envia os dados do contato/conversa para o seu sistema via o motor de automação.</p>
      </div>
    )
  if (node.type === "handoff")
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">Mensagem antes de transferir (opcional)</label>
        <input className={inp} placeholder="Vou te transferir para um atendente 😊" value={node.config.text || ""} onChange={(e) => onChange({ text: e.target.value })} />
        <p className="text-xs text-muted-foreground">O fluxo é pausado e a conversa vai para o Inbox da equipe.</p>
      </div>
    )
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">Aguardar (minutos)</label>
      <input type="number" min={1} className={inp} value={node.config.minutes || 5} onChange={(e) => onChange({ minutes: Number(e.target.value) })} />
    </div>
  )
}
