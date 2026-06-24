"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

const mobileNav = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/funil", label: "Funil", icon: KanbanSquare },
  { href: "/contatos", label: "Contatos", icon: Users },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
]

export function AppShell({
  title,
  subtitle,
  children,
  noPadding,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  noPadding?: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main
          className={cn(
            "flex-1 overflow-auto pb-20 md:pb-0",
            !noPadding && "p-4 md:p-6",
          )}
        >
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-sidebar/95 backdrop-blur md:hidden">
        {mobileNav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
