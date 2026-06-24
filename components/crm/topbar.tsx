"use client"

import { Bell, Search, Plus, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Topbar({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6 sticky top-0 z-20">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar leads, contatos..."
          className="h-9 w-44 rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition-[width,box-shadow] placeholder:text-muted-foreground focus:w-64 focus:ring-2 focus:ring-ring/40 lg:w-56"
        />
      </div>

      <button className="hidden items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:flex">
        <Plus className="size-4" />
        Novo lead
      </button>

      <button
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
      </button>

      <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-secondary/60">
        <Avatar className="size-8">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
            BV
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left leading-tight lg:block">
          <p className="text-sm font-medium">Bryan V.</p>
          <p className="text-xs text-muted-foreground">Vendedor</p>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
      </button>
    </header>
  )
}
