"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ChevronDown,
  UserRound,
  Settings,
  CreditCard,
  QrCode,
  ArrowUpRight,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authFetch } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

const items = [
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
  { href: "/gerenciar-plano", label: "Gerenciar plano", icon: CreditCard },
  { href: "/conectar", label: "Conectar WhatsApp", icon: QrCode },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function UserMenu() {
  const router = useRouter()
  const { user, sub, isAdmin, signOut } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  // Carrega o avatar atual e reflete atualizações feitas em /perfil (evento "zf:avatar").
  useEffect(() => {
    let alive = true
    authFetch("/api/profile").then((r) => r.ok && r.json()).then((d) => { if (alive && d?.profile?.avatar_url) setAvatarUrl(d.profile.avatar_url) }).catch(() => {})
    const onAvatar = (e: Event) => { const url = (e as CustomEvent).detail; if (url) setAvatarUrl(url) }
    window.addEventListener("zf:avatar", onAvatar)
    return () => { alive = false; window.removeEventListener("zf:avatar", onAvatar) }
  }, [])

  const email = user?.email ?? ""
  const fullName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    (email ? email.split("@")[0] : "Usuário")
  const initials = fullName
    .split(" ")
    .map((s: string) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U"
  const planLabel = isAdmin
    ? "Admin"
    : sub?.plan?.name
      ? `Plano ${sub.plan.name}`
      : sub?.trial_active
        ? "Teste Pro"
        : "Plano Inicial"

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <Avatar className="size-8">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left leading-tight lg:block">
          <p className="max-w-[120px] truncate text-sm font-medium">{fullName}</p>
          <p className="text-xs text-muted-foreground">{planLabel}</p>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-1.5 py-2">
          <Avatar className="size-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={item.href} />}
              className="cursor-pointer gap-2.5"
            >
              <Icon className="size-4 text-muted-foreground" />
              {item.label}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer gap-2.5 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
