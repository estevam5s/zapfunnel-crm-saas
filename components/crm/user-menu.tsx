"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  UserRound,
  Settings,
  CreditCard,
  QrCode,
  ArrowUpRight,
  LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const items = [
  { href: "/perfil", label: "Meu perfil", icon: UserRound },
  { href: "/gerenciar-plano", label: "Gerenciar plano", icon: CreditCard },
  { href: "/conectar", label: "Conectar WhatsApp", icon: QrCode },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function UserMenu() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-secondary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          <Avatar className="size-8">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              BV
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight lg:block">
            <p className="text-sm font-medium">Bryan V.</p>
            <p className="text-xs text-muted-foreground">Plano Pro</p>
          </div>
          <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              BV
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-sm font-medium">Bryan Vieira</p>
            <p className="text-xs font-normal text-muted-foreground">
              bryan@zapfunnel.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="cursor-pointer gap-2.5">
                <Icon className="size-4 text-muted-foreground" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
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
  )
}
