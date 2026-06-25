"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { leads, stages, brl } from "@/lib/mock-data"

export function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return leads
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [query])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  useEffect(() => setActive(0), [query])

  function go(stage: string) {
    setOpen(false)
    setQuery("")
    router.push(`/funil?stage=${stage}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % results.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + results.length) % results.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(results[active].stage)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar leads, contatos..."
        className="h-9 w-44 rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm outline-none transition-[width,box-shadow] placeholder:text-muted-foreground focus:w-72 focus:ring-2 focus:ring-ring/40 lg:w-56"
      />

      {open && query.trim() && (
        <div className="absolute left-0 top-11 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado para “{query}”.
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1.5">
              {results.map((l, i) => {
                const stage = stages.find((s) => s.id === l.stage)
                return (
                  <li key={l.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(l.stage)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left",
                        i === active && "bg-secondary/60",
                      )}
                    >
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-background"
                        style={{ background: l.avatarColor }}
                      >
                        {l.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {l.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {l.phone} · {stage?.title}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {brl(l.value)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex items-center gap-2 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
            <CornerDownLeft className="size-3" />
            Enter para abrir no funil
          </div>
        </div>
      )}
    </div>
  )
}
