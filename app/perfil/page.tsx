"use client"

import { useEffect, useRef, useState } from "react"
import { Mail, Phone, Building2, User, Trophy, Target, Users, Loader2, Check, Camera, Briefcase, Globe, FileText, Bell, MessageSquare } from "lucide-react"
import { AppShell } from "@/components/crm/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authFetch } from "@/contexts/auth-context"
import { toast } from "sonner"

type Settings = {
  bio?: string
  role?: string
  website?: string
  timezone?: string
  notify_email?: boolean
  notify_new_lead?: boolean
  notify_new_message?: boolean
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>(null)
  const [dash, setDash] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [form, setForm] = useState({ full_name: "", phone: "", company: "" })
  const [settings, setSettings] = useState<Settings>({ notify_email: true, notify_new_lead: true, notify_new_message: true })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    authFetch("/api/profile").then((r) => r.ok && r.json().then((d) => {
      setProfile(d.profile)
      setForm({ full_name: d.profile?.full_name || "", phone: d.profile?.phone || "", company: d.profile?.company || "" })
      setAvatarUrl(d.profile?.avatar_url || "")
      setSettings({ notify_email: true, notify_new_lead: true, notify_new_message: true, ...(d.profile?.settings || {}) })
    }))
    authFetch("/api/dashboard").then((r) => r.ok && r.json().then(setDash)).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    const r = await authFetch("/api/profile", { method: "PATCH", body: JSON.stringify({ ...form, settings }) })
    setSaving(false)
    if (r.ok) { const d = await r.json(); setProfile(d.profile); toast.success("Perfil salvo!") } else toast.error("Erro ao salvar")
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem acima de 5MB"); return }
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const r = await authFetch("/api/profile/avatar", { method: "POST", body: fd })
    setUploading(false)
    if (r.ok) { const d = await r.json(); setAvatarUrl(d.avatar_url); window.dispatchEvent(new CustomEvent("zf:avatar", { detail: d.avatar_url })); toast.success("Foto atualizada!") } else toast.error("Erro ao enviar imagem")
  }

  const initials = (form.full_name || profile?.email || "U").slice(0, 2).toUpperCase()
  const stats = [
    { label: "Negócios ganhos", value: dash?.by_stage?.ganho ?? 0, icon: Trophy },
    { label: "Taxa de conversão", value: `${dash?.conversion ?? 0}%`, icon: Target },
    { label: "Contatos", value: dash?.contacts ?? 0, icon: Users },
  ]

  const S = (k: keyof Settings, v: any) => setSettings((s) => ({ ...s, [k]: v }))

  return (
    <AppShell title="Perfil" subtitle="Gerencie suas informações pessoais e preferências">
      <div className="flex w-full flex-col gap-6">
        {/* cabeçalho com avatar */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-28 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <div className="relative -mt-12">
              <Avatar className="size-24 border-4 border-card">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                <AvatarFallback className="bg-accent text-2xl font-semibold text-accent-foreground">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                title="Alterar foto"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{form.full_name || profile?.email?.split("@")[0] || "—"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email} · Plano {profile?.plan_slug || "inicial"}</p>
            </div>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Salvar alterações
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => { const Icon = s.icon; return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Icon className="size-5" /></span><div><p className="text-lg font-semibold tracking-tight">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div></div>
          )})}
        </div>

        {/* grid 2 colunas: dados + preferências (usa a largura toda) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold">Informações pessoais</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nome completo" icon={User} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
              <Field label="E-mail" icon={Mail} value={profile?.email || ""} readOnly />
              <Field label="Telefone" icon={Phone} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+55 …" />
              <Field label="Empresa" icon={Building2} value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Sua empresa" />
              <Field label="Cargo" icon={Briefcase} value={settings.role || ""} onChange={(v) => S("role", v)} placeholder="Ex.: Gerente de vendas" />
              <Field label="Site" icon={Globe} value={settings.website || ""} onChange={(v) => S("website", v)} placeholder="https://…" />
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Bio</span>
              <span className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <textarea value={settings.bio || ""} onChange={(e) => S("bio", e.target.value)} rows={3} placeholder="Fale um pouco sobre você…" className="w-full resize-none rounded-lg border border-input bg-secondary/40 pl-9 pr-3 pt-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40" />
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold">Preferências de notificação</h3>
              <div className="mt-4 flex flex-col divide-y divide-border">
                <Toggle icon={Bell} label="Resumo por e-mail" desc="Receba um resumo diário da sua atividade." checked={!!settings.notify_email} onChange={(v) => S("notify_email", v)} />
                <Toggle icon={Users} label="Novo lead" desc="Avise quando um novo lead entrar no funil." checked={!!settings.notify_new_lead} onChange={(v) => S("notify_new_lead", v)} />
                <Toggle icon={MessageSquare} label="Nova mensagem" desc="Notifique quando um contato responder." checked={!!settings.notify_new_message} onChange={(v) => S("notify_new_message", v)} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold">Regional</h3>
              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Fuso horário</span>
                <select value={settings.timezone || "America/Sao_Paulo"} onChange={(e) => S("timezone", e.target.value)} className="h-10 w-full rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40">
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                  <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, icon: Icon, value, onChange, readOnly, placeholder }: { label: string; icon: any; value: string; onChange?: (v: string) => void; readOnly?: boolean; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} readOnly={readOnly} placeholder={placeholder} className={`h-10 w-full rounded-lg border border-input bg-secondary/40 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40 pl-9 pr-3 ${readOnly ? "opacity-70" : ""}`} />
      </span>
    </label>
  )
}

function Toggle({ icon: Icon, label, desc, checked, onChange }: { icon: any; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  )
}
