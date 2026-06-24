"use client"

import { useState } from "react"
import {
  MessageCircle,
  Phone,
  EllipsisVertical,
  Plus,
} from "lucide-react"
import {
  leads as initialLeads,
  stages,
  brl,
  type Lead,
  type StageId,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

function LeadCard({
  lead,
  onDragStart,
}: {
  lead: Lead
  onDragStart: (id: string) => void
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="group cursor-grab rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-primary/40 active:cursor-grabbing"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-primary-foreground"
          style={{ background: lead.avatarColor }}
        >
          {initials(lead.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          <p className="truncate text-xs text-muted-foreground">{lead.phone}</p>
        </div>
        <button
          className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          aria-label="Mais opções"
        >
          <EllipsisVertical className="size-4" />
        </button>
      </div>

      {lead.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">
          {brl(lead.value)}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="size-3.5" />
            {lead.unread}
          </span>
          <Phone className="size-3.5" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {lead.lastContact} · {lead.owner}
      </p>
    </article>
  )
}

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<StageId | null>(null)

  function handleDrop(stage: StageId) {
    if (!dragId) return
    setLeads((prev) =>
      prev.map((l) => (l.id === dragId ? { ...l, stage } : l)),
    )
    setDragId(null)
    setOverStage(null)
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const list = leads.filter((l) => l.stage === stage.id)
        const total = list.reduce((s, l) => s + l.value, 0)
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOverStage(stage.id)
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
            onDrop={() => handleDrop(stage.id)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-card/50 transition-colors",
              overStage === stage.id
                ? "border-primary/60 bg-card"
                : "border-border",
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: stage.accent }}
                />
                <h2 className="text-sm font-semibold">{stage.title}</h2>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                  {list.length}
                </span>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                aria-label="Adicionar lead"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <p className="px-3 pt-2 text-xs text-muted-foreground">
              {brl(total)}
            </p>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
              {list.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onDragStart={setDragId}
                />
              ))}
              {list.length === 0 && (
                <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  Solte um lead aqui
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
