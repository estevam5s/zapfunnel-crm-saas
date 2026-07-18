import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'ZapFunnel — CRM e funil de vendas para WhatsApp', short_name: 'ZapFunnel', description: 'Organize leads do WhatsApp num funil visual, com automações e disparos.', start_url: '/', display: 'standalone', background_color: '#0a0f0d', theme_color: '#22c55e', icons: [{ src: '/brand-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/brand-logo.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' }] }
}
