"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  CreditCard,
  QrCode,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { leads } from "@/lib/mock-data"
import { Logo } from "@/components/brand/logo"

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funil", label: "Funil de vendas", icon: KanbanSquare },
  { href: "/contatos", label: "Contatos", icon: Users },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
]

const accountNav = [
  { href: "/conectar", label: "Conectar WhatsApp", icon: QrCode },
  { href: "/gerenciar-plano", label: "Gerenciar plano", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: UserRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const unread = leads.reduce((s, l) => s + l.unread, 0)

  function NavLink({
    href,
    label,
    icon: Icon,
  }: {
    href: string
    label: string
    icon: typeof LayoutDashboard
  }) {
    const active = pathname.startsWith(href)
    return (
      <li>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          )}
        >
          <Icon className="size-[18px] shrink-0" />
          <span className="flex-1">{label}</span>
          {href === "/inbox" && unread > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="flex items-center px-5 h-16 border-b border-sidebar-border">
        <Link href="/dashboard">
          <Logo subtitle="CRM para WhatsApp" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        <ul className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </ul>

        <p className="px-3 pb-2 pt-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Conta
        </p>
        <ul className="flex flex-col gap-1">
          {accountNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </ul>
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-sidebar-border bg-gradient-to-br from-accent/25 to-primary/15 p-4">
          <p className="text-sm font-semibold">Plano Pro</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Você usou 3 de 5 números conectados.
          </p>
          <Link
            href="/gerenciar-plano"
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Gerenciar plano
          </Link>
        </div>
      </div>
    </aside>
  )
}
