"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ChevronDown,
  ShieldCheck,
  UserRound,
  Search,
  Bell,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function AdminTopbar({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  return (
    <header className="flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur md:gap-4 md:px-6 sticky top-0 z-30">
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no painel..."
          className="h-9 w-44 rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition-[width,box-shadow] placeholder:text-muted-foreground focus:w-64 focus:ring-2 focus:ring-ring/40 lg:w-56"
        />
      </div>

      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
      </button>

      {/* Seletor de papel (acesso simulado) */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 p-1 pr-2 transition-colors hover:bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent/20 text-accent">
            <ShieldCheck className="size-4" />
          </span>
          <div className="hidden text-left leading-tight lg:block">
            <p className="text-sm font-medium">Administrador</p>
            <p className="text-xs text-muted-foreground">Acesso total</p>
          </div>
          <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Visualizar como
          </p>
          <DropdownMenuItem className="cursor-pointer gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-accent/20 text-accent">
              <ShieldCheck className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-muted-foreground">Gestão completa</p>
            </div>
            <span className="ml-auto size-2 rounded-full bg-primary" />
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/dashboard" />}
            className="cursor-pointer gap-2.5"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
              <UserRound className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">Usuário</p>
              <p className="text-xs text-muted-foreground">App do cliente</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer gap-2.5 text-destructive focus:text-destructive"
          >
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Avatar className="size-9">
        <AvatarFallback
          className={cn(
            "bg-accent text-accent-foreground text-xs font-semibold",
          )}
        >
          AD
        </AvatarFallback>
      </Avatar>
    </header>
  )
}
