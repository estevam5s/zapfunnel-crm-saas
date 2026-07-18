"use client"

import { useEffect, useRef, useState } from "react"
import { ImageIcon, Upload, Trash2, Loader2, Check } from "lucide-react"
import { authFetch } from "@/contexts/auth-context"

export default function AdminMarca() {
  const [url, setUrl] = useState<string>("")
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const [bs, setBs] = useState<Record<string, any>>({})
  const [bsMsg, setBsMsg] = useState("")
  const [bsSaving, setBsSaving] = useState(false)

  // logo padrão do app (fallback) e a URL pública do logo custom
  const DEFAULT = "/brand-logo.png"
  useEffect(() => {
    authFetch("/api/admin/brand").then((r) => r.json()).then((d) => { if (d.url) probe(d.url) }).catch(() => {})
    authFetch("/api/admin/brand-settings").then((r) => r.json()).then((d) => setBs(d.settings || {})).catch(() => {})
  }, [])

  const saveBs = async () => {
    setBsSaving(true); setBsMsg("")
    const r = await authFetch("/api/admin/brand-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bs) })
    setBsSaving(false); setBsMsg(r.ok ? "Salvo ✓" : "Erro ao salvar")
  }
  const setB = (k: string, v: any) => setBs((f) => ({ ...f, [k]: v }))
  const LOGOS: [string, string][] = [["logo_site_px", "Logo do site"], ["logo_login_px", "Logo de login"], ["logo_dashboard_px", "Logo do dashboard"], ["logo_admin_px", "Logo do admin"], ["logo_stripe_px", "Logo Stripe"], ["favicon_px", "Favicon"]]
  const INFO: [string, string][] = [["company_name", "Nome da empresa"], ["company_email", "E-mail"], ["company_phone", "Telefone"], ["company_address", "Endereço"], ["company_cnpj", "CNPJ"]]

  // só usa a URL custom se o arquivo realmente existir (senão mostra o padrão)
  function probe(u: string) {
    const img = new Image()
    img.onload = () => setUrl(`${u}?v=${Date.now()}`)
    img.onerror = () => setUrl("")
    img.src = u
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr(""); setOk(false)
    try {
      const fd = new FormData(); fd.append("file", file)
      const r = await authFetch("/api/admin/brand", { method: "POST", body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "Falha no upload")
      setUrl(d.url); setOk(true); setTimeout(() => setOk(false), 2500)
    } catch (e) { setErr(e instanceof Error ? e.message : "Erro") } finally { setBusy(false) }
  }

  async function reset() {
    if (!confirm("Voltar ao logo padrão do app?")) return
    setBusy(true)
    try { await authFetch("/api/admin/brand", { method: "DELETE" }); setUrl("") } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ImageIcon className="size-6 text-primary" /> Marca / Logo</h1>
        <p className="text-sm text-muted-foreground mt-1">Altere o logo exibido na navbar, rodapé, login, sidebar e painel. Use PNG com fundo transparente.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium mb-3">Logo atual</p>
        <div className="flex items-center gap-6">
          <div className="grid h-24 w-40 place-items-center rounded-xl border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url || DEFAULT} alt="Logo" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/png,image/webp,image/svg+xml" hidden onChange={upload} />
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {busy ? <Loader2 className="size-4 animate-spin" /> : ok ? <Check className="size-4" /> : <Upload className="size-4" />} {ok ? "Enviado!" : "Enviar novo logo"}
            </button>
            {url && <button onClick={reset} disabled={busy} className="ml-2 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500"><Trash2 className="size-4" /> Restaurar padrão</button>}
            <p className="text-xs text-muted-foreground">Máx. 2MB. Recomendado ~256px de altura, fundo transparente.</p>
          </div>
        </div>
        {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm font-medium">Tamanhos das logos (px)</p>
        <p className="mb-3 text-xs text-muted-foreground">Ajuste onde cada logo aparece: site, login, dashboard, admin, produtos Stripe e favicon.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LOGOS.map(([k, l]) => (
            <label key={k} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm">{l}</span>
              <input type="number" min={8} max={512} value={bs[k] ?? ""} onChange={(e) => setB(k, e.target.value)} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-right text-sm" />
            </label>
          ))}
        </div>
        <p className="mb-3 mt-5 text-sm font-medium">Informações institucionais</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INFO.map(([k, l]) => (
            <label key={k} className="flex flex-col gap-1"><span className="text-xs text-muted-foreground">{l}</span><input type="text" value={bs[k] ?? ""} onChange={(e) => setB(k, e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={saveBs} disabled={bsSaving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{bsSaving ? "Salvando…" : "Salvar alterações"}</button>
          {bsMsg && <span className="text-sm text-muted-foreground">{bsMsg}</span>}
        </div>
      </div>
    </div>
  )
}
