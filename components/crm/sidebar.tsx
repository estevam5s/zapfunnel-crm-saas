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
import { Sparkles, Zap, Megaphone, Workflow, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUnreadCount } from "@/hooks/use-unread"
import { Logo } from "@/components/brand/logo"
import { usePlan, type FeatureKey } from "@/hooks/use-plan"
import { PlanBadge } from "@/components/crm/plan-gate"

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; feature?: FeatureKey }

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/funil", label: "Funil de vendas", icon: KanbanSquare },
  { href: "/contatos", label: "Contatos", icon: Users },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/broadcast", label: "Broadcast", icon: Megaphone, feature: "automations" },
  { href: "/flows", label: "Flows", icon: Workflow, feature: "automations" },
  { href: "/automacoes", label: "Automações", icon: Zap, feature: "automations" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, feature: "realTimeMetrics" },
]

const accountNav: NavItem[] = [
  { href: "/conectar", label: "Conectar WhatsApp", icon: QrCode },
  { href: "/integracoes", label: "API & Integrações", icon: Settings, feature: "dedicatedApi" },
  { href: "/gerenciar-plano", label: "Gerenciar plano", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: UserRound },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const unread = useUnreadCount()
  const { planName, can, waNumbers } = usePlan()

  function NavLink({ href, label, icon: Icon, feature }: NavItem) {
    const active = pathname.startsWith(href)
    const locked = !!feature && !can(feature)
    return (
      <li>
        <Link
          href={locked ? "/gerenciar-plano" : href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            locked && "opacity-70",
          )}
          title={locked ? `${label} — requer upgrade` : undefined}
        >
          <Icon className="size-[18px] shrink-0" />
          <span className="flex-1 truncate">{label}</span>
          {locked && feature && <PlanBadge feature={feature} />}
          {!locked && href === "/inbox" && unread > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <aside className="hidden md:flex h-dvh md:w-64 lg:w-72 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="flex items-center px-5 h-16 border-b border-sidebar-border">
        <Link href="/dashboard">
          <Logo subtitle="CRM para WhatsApp" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
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
          <p className="flex items-center justify-between gap-1.5 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-accent" /> Plano {planName}
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {waNumbers.unlimited ? "∞ números" : `${waNumbers.limit} ${waNumbers.limit === 1 ? "número" : "números"}`}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {waNumbers.unlimited || waNumbers.limit > 1
              ? "Troque ou adicione números de WhatsApp da sua conta."
              : "Troque o número de WhatsApp conectado quando precisar."}
          </p>
          <Link
            href="/conectar"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw className="size-3.5" />
            {waNumbers.unlimited || waNumbers.limit > 1 ? "Trocar / adicionar número" : "Trocar de número"}
          </Link>
          <Link
            href="/gerenciar-plano"
            className="mt-2 flex w-full items-center justify-center rounded-lg border border-sidebar-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {planName === "Enterprise" || planName === "Admin" ? "Gerenciar plano" : "Fazer upgrade"}
          </Link>
        </div>
      </div>
    </aside>
  )
}
