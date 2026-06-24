"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  CheckCheck,
  ArrowUpRight,
  EllipsisVertical,
} from "lucide-react"
import {
  leads,
  conversations,
  stages,
  brl,
  type ChatMessage,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

const chatLeads = leads.filter((l) => conversations[l.id])

export function Inbox() {
  const [activeId, setActiveId] = useState(chatLeads[0]?.id ?? "")
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState("")
  const [allMessages, setAllMessages] =
    useState<Record<string, ChatMessage[]>>(conversations)

  const filteredLeads = useMemo(
    () =>
      chatLeads.filter((l) =>
        l.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const activeLead = leads.find((l) => l.id === activeId)
  const messages = allMessages[activeId] ?? []
  const stage = activeLead
    ? stages.find((s) => s.id === activeLead.stage)
    : undefined

  function send() {
    const text = draft.trim()
    if (!text || !activeLead) return
    const msg: ChatMessage = {
      id: "m" + Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
    setAllMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), msg],
    }))
    setDraft("")
  }

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card">
      {/* Lista de conversas */}
      <div
        className={cn(
          "flex w-full flex-col border-r border-border md:w-80 lg:w-96",
          activeLead && "hidden md:flex",
        )}
      >
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar conversa"
              className="h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.map((lead) => {
            const msgs = allMessages[lead.id] ?? []
            const last = msgs[msgs.length - 1]
            return (
              <button
                key={lead.id}
                onClick={() => setActiveId(lead.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-secondary/40",
                  activeId === lead.id && "bg-secondary/60",
                )}
              >
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                  style={{ background: lead.avatarColor }}
                >
                  {initials(lead.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {last?.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {last?.from === "me" && "Você: "}
                      {last?.text}
                    </p>
                    {lead.unread > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                        {lead.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conversa ativa */}
      {activeLead ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button
              onClick={() => setActiveId("")}
              className="text-sm text-muted-foreground md:hidden"
            >
              Voltar
            </button>
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
              style={{ background: activeLead.avatarColor }}
            >
              {initials(activeLead.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{activeLead.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {activeLead.phone}
              </p>
            </div>
            {stage && (
              <span
                className="hidden items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium sm:inline-flex"
                style={{
                  color: stage.accent,
                  background:
                    "color-mix(in oklch, " + stage.accent + " 15%, transparent)",
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: stage.accent }}
                />
                {stage.title}
              </span>
            )}
            <button
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Ligar"
            >
              <Phone className="size-[18px]" />
            </button>
            <button
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Mais opções"
            >
              <EllipsisVertical className="size-[18px]" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.from === "me" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    m.from === "me"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span
                    className={cn(
                      "mt-1 flex items-center justify-end gap-1 text-[10px]",
                      m.from === "me"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {m.time}
                    {m.from === "me" && <CheckCheck className="size-3" />}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <button
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Anexar"
            >
              <Paperclip className="size-[18px]" />
            </button>
            <button
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Emoji"
            >
              <Smile className="size-[18px]" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escreva uma mensagem..."
              className="h-10 flex-1 rounded-lg border border-input bg-secondary/50 px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
            />
            <button
              onClick={send}
              className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="Enviar"
            >
              <Send className="size-[18px]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center text-sm text-muted-foreground md:flex">
          Selecione uma conversa para começar
        </div>
      )}

      {/* Painel do lead */}
      {activeLead && (
        <aside className="hidden w-72 flex-col border-l border-border p-4 xl:flex">
          <div className="flex flex-col items-center text-center">
            <span
              className="flex size-16 items-center justify-center rounded-full text-lg font-semibold text-primary-foreground"
              style={{ background: activeLead.avatarColor }}
            >
              {initials(activeLead.name)}
            </span>
            <p className="mt-3 font-medium">{activeLead.name}</p>
            <p className="text-xs text-muted-foreground">{activeLead.phone}</p>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">Valor do negócio</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {brl(activeLead.value)}
            </p>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Origem</dt>
              <dd className="font-medium">{activeLead.source}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Responsável</dt>
              <dd className="font-medium">{activeLead.owner}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Último contato</dt>
              <dd className="font-medium">{activeLead.lastContact}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {activeLead.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
            Ver no funil <ArrowUpRight className="size-4" />
          </button>
        </aside>
      )}
    </div>
  )
}
