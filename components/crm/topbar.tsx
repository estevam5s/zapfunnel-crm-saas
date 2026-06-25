"use client"

import Link from "next/link"
import { Plus, ArrowUpRight } from "lucide-react"
import { SearchBox } from "./search-box"
import { NotificationsMenu } from "./notifications-menu"
import { UserMenu } from "./user-menu"

export function Topbar({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
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

      <div className="hidden sm:block">
        <SearchBox />
      </div>

      <Link
        href="/"
        className="hidden items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground xl:flex"
      >
        <ArrowUpRight className="size-4" />
        Voltar ao site
      </Link>

      <button className="hidden items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:flex">
        <Plus className="size-4" />
        <span className="hidden md:inline">Novo lead</span>
      </button>

      <NotificationsMenu />

      <UserMenu />
    </header>
  )
}
