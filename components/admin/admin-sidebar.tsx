"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Boxes,
  Wallet,
  Globe,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"

export const adminNav = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos SaaS", icon: Boxes },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/monitoramento", label: "Visitantes & monitoramento", icon: Globe },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
      <div className="flex items-center px-5 h-16 border-b border-sidebar-border">
        <Link href="/admin">
          <Logo subtitle="Painel administrativo" />
        </Link>
      </div>

      <div className="px-3 pt-4">
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
          <ShieldCheck className="size-4 text-accent" />
          <span className="text-xs font-medium text-accent-foreground">
            Acesso de administrador
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Gestão
        </p>
        <ul className="flex flex-col gap-1">
          {adminNav.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
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
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar ao app
        </Link>
      </div>
    </aside>
  )
}
