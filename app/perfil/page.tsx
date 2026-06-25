"use client"

import { Camera, Mail, Phone, MapPin, Trophy, Target, Clock } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const stats = [
  { label: "Negócios ganhos", value: "96", icon: Trophy },
  { label: "Taxa de conversão", value: "32,4%", icon: Target },
  { label: "Tempo de resposta", value: "3,2 min", icon: Clock },
]

const fields = [
  { label: "Nome completo", value: "Bryan Vieira", type: "text" },
  { label: "E-mail", value: "bryan@zapfunnel.com", type: "email", icon: Mail },
  { label: "Telefone", value: "+55 11 99999-0001", type: "tel", icon: Phone },
  { label: "Cargo", value: "Head de Vendas", type: "text" },
  { label: "Localização", value: "São Paulo, SP", type: "text", icon: MapPin },
  { label: "Fuso horário", value: "GMT-3 (Brasília)", type: "text" },
]

const activity = [
  { text: "Fechou negócio com Lucas Pereira", time: "há 25 min", value: "R$ 5.600" },
  { text: "Moveu Mariana Lopes para Negociação", time: "há 1 h" },
  { text: "Respondeu 12 conversas no Inbox", time: "há 2 h" },
  { text: "Conectou novo número de WhatsApp", time: "ontem" },
]

export default function PerfilPage() {
  return (
    <AppShell title="Perfil" subtitle="Gerencie suas informações pessoais">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-28 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <div className="relative -mt-12">
              <Avatar className="size-24 border-4 border-card">
                <AvatarFallback className="bg-accent text-2xl font-semibold text-accent-foreground">
                  BV
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
                aria-label="Alterar foto"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">
                Bryan Vieira
              </h2>
              <p className="text-sm text-muted-foreground">
                Head de Vendas · Plano Pro
              </p>
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Salvar alterações
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-5"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal info form */}
          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold">Informações pessoais</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((f) => {
                const Icon = f.icon
                return (
                  <label key={f.label} className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      {f.label}
                    </span>
                    <span className="relative">
                      {Icon && (
                        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      )}
                      <input
                        type={f.type}
                        defaultValue={f.value}
                        className={cnInput(Boolean(Icon))}
                      />
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold">Atividade recente</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.time}
                      {a.value && (
                        <span className="ml-1 font-medium text-primary">
                          · {a.value}
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function cnInput(hasIcon: boolean) {
  return [
    "h-10 w-full rounded-lg border border-input bg-secondary/40 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40",
    hasIcon ? "pl-9 pr-3" : "px-3",
  ].join(" ")
}
