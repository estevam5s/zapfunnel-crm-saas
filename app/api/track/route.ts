import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// registro de visitante global (chamado pela landing). País/cidade via headers da Vercel.
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    const h = req.headers
    const ua = h.get("user-agent") || ""
    const device = /mobile/i.test(ua) ? "Mobile" : /tablet|ipad/i.test(ua) ? "Tablet" : "Desktop"
    const browser = /edg/i.test(ua) ? "Edge" : /chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : /firefox/i.test(ua) ? "Firefox" : "—"
    const os = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /mac/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "—"
    await createAdminClient().from("visitors").insert({
      country: h.get("x-vercel-ip-country-region") ? undefined : h.get("x-vercel-ip-country") || "—",
      country_code: h.get("x-vercel-ip-country") || null,
      city: h.get("x-vercel-ip-city") ? decodeURIComponent(h.get("x-vercel-ip-city")!) : null,
      region: h.get("x-vercel-ip-country-region") || null,
      lat: h.get("x-vercel-ip-latitude") ? Number(h.get("x-vercel-ip-latitude")) : null,
      lng: h.get("x-vercel-ip-longitude") ? Number(h.get("x-vercel-ip-longitude")) : null,
      device, browser, os, source: b.source || "direct", path: b.path || "/",
    })
  } catch { /* noop */ }
  return NextResponse.json({ ok: true })
}
