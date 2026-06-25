import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://zapfunnel-crm.vercel.app"
  const now = new Date()
  const routes = ["", "/login", "/dashboard", "/funil", "/contatos", "/inbox", "/relatorios", "/conectar", "/gerenciar-plano"]
  return routes.map((r) => ({ url: `${base}${r}`, lastModified: now, changeFrequency: "weekly", priority: r === "" ? 1 : 0.7 }))
}
