import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://zapfunnel-crm.vercel.app'; const now = new Date()
  return ['', '/login', '/termos', '/privacidade', '/cookies'].map((p) => ({ url: base + p, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.6 }))
}
