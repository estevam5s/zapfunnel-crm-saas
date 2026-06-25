"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Info,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { notificationsSeed, type Notification } from "@/lib/mock-data"

const iconByType = {
  lead: UserPlus,
  message: MessageSquare,
  deal: TrendingUp,
  system: Info,
} as const

const colorByType = {
  lead: "text-[var(--chart-3)] bg-[var(--chart-3)]/15",
  message: "text-[var(--chart-2)] bg-[var(--chart-2)]/15",
  deal: "text-primary bg-primary/15",
  system: "text-[var(--chart-4)] bg-[var(--chart-4)]/15",
} as const

export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>(notificationsSeed)
  const ref = useRef<HTMLDivElement>(null)

  const unread = items.filter((n) => !n.read).length

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function toggleRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Notificações"
        aria-expanded={open}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} não lidas` : "Tudo em dia"}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Check className="size-3.5" />
                Marcar lidas
              </button>
            )}
          </div>

          <div className="max-h-[min(420px,60vh)] overflow-y-auto">
            {items.map((n) => {
              const Icon = iconByType[n.type]
              return (
                <button
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      colorByType[n.type],
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {n.description}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground/70">
                      {n.time}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <button className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
