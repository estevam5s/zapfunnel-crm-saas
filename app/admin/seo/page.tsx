"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Panel } from "@/components/admin/ui"
import { authFetch } from "@/contexts/auth-context"
import { Loader2, Check } from "lucide-react"

const FIELDS: { key: string; label: string; area?: boolean }[] = [
  { key: "meta_title", label: "Meta Title" },
  { key: "meta_description", label: "Meta Description", area: true },
  { key: "og_title", label: "Open Graph Title" },
  { key: "og_description", label: "Open Graph Description", area: true },
  { key: "og_image", label: "Open Graph Image (URL)" },
  { key: "twitter_card", label: "Twitter Card" },
  { key: "canonical_base", label: "URL Canônica base" },
  { key: "robots", label: "Robots" },
  { key: "ga_id", label: "Google Analytics ID" },
  { key: "gtm_id", label: "Google Tag Manager ID" },
  { key: "gsc_verification", label: "Search Console (verificação)" },
]

export default function SeoPage() {
  const [f, setF] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { authFetch("/api/admin/seo").then((r) => r.json()).then((d) => { setF(d.seo || {}); setLoading(false) }) }, [])
  async function save() { setSaving(true); const r = await authFetch("/api/admin/seo", { method: "PATCH", body: JSON.stringify(f) }); setSaving(false); if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) } }
  const inp = "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"

  return (
    <AdminShell title="SEO" subtitle="Meta tags, Open Graph, Analytics, Sitemap e Robots.txt">
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-primary" /></div> : (
        <div className="flex flex-col gap-6">
          <Panel title="Configurações de indexação">
            <div className="grid gap-4 md:grid-cols-2">
              {FIELDS.map((fl) => (
                <label key={fl.key} className={`block text-xs text-muted-foreground ${fl.area ? "md:col-span-2" : ""}`}>
                  {fl.label}
                  {fl.area
                    ? <textarea rows={2} className={`${inp} mt-1 resize-none`} value={f[fl.key] || ""} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })} />
                    : <input className={`${inp} mt-1`} value={f[fl.key] || ""} onChange={(e) => setF({ ...f, [fl.key]: e.target.value })} />}
                </label>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button onClick={save} disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "Salvando…" : "Salvar SEO"}</button>
              {saved && <span className="flex items-center gap-1 text-sm text-primary"><Check className="size-4" /> Salvo</span>}
            </div>
          </Panel>
          <Panel title="Recursos gerados automaticamente">
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Sitemap dinâmico em <code className="text-foreground">/sitemap.xml</code></li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Robots.txt em <code className="text-foreground">/robots.txt</code> (bloqueia /admin e /api)</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> URLs canônicas e Open Graph aplicados ao site</li>
            </ul>
          </Panel>
        </div>
      )}
    </AdminShell>
  )
}
