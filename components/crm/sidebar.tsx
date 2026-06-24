"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  MessageCircle,
  Zap,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { leads } from "@/lib/mock-data"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funil", label: "Funil de vendas", icon: KanbanSquare },
  { href: "/contatos", label: "Contatos", icon: Users },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const unread = leads.reduce((s, l) => s + l.unread, 0)

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Zap className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">ZapFunnel</p>
          <p className="text-xs text-muted-foreground">CRM para WhatsApp</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <ul className="flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/inbox" && unread > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-sidebar-border bg-gradient-to-br from-accent/25 to-primary/15 p-4">
          <p className="text-sm font-semibold">Conecte seu WhatsApp</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Integre a API oficial para sincronizar conversas em tempo real.
          </p>
          <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Conectar número
          </button>
        </div>
        <Link
          href="#"
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="size-[18px]" />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
