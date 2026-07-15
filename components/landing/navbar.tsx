"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { supabase } from "@/lib/supabase"

const links = [
  { href: "#recursos", label: "Recursos" },
  { href: "#funil", label: "Funil" },
  { href: "#planos", label: "Planos" },
  { href: "#depoimentos", label: "Depoimentos" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(!!data.session)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authed ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:brightness-110"
              >
                Começar grátis
              </Link>
            </>
          )}
        </div>

        <button
          className="flex size-9 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* menu mobile FULL-SCREEN (ocupa a tela toda) */}
      {open && (
        <div className="fixed inset-0 z-50 flex min-h-dvh w-full flex-col bg-background px-4 py-3 md:hidden">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}><Logo /></Link>
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid size-12 place-items-center rounded-full text-foreground hover:bg-secondary">
              <X className="size-8" strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-between pb-8 pt-12">
            <nav className="flex flex-col gap-8">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-4xl font-semibold leading-none text-foreground transition-opacity hover:opacity-70"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              {authed ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex h-16 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex h-14 items-center justify-center rounded-2xl border border-border text-lg font-medium text-foreground">Entrar</Link>
                  <Link href="/login" onClick={() => setOpen(false)} className="flex h-16 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">Começar grátis</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
