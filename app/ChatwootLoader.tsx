"use client"
import { useEffect } from "react"
// Widget do Chatwoot (VPS) no lugar do bot. Token público (website inbox), não é segredo.
export default function ChatwootLoader() {
  useEffect(() => {
    if (document.getElementById("chatwoot-sdk")) return
    ;(window as any).chatwootSettings = { position: "right", type: "expanded_bubble", launcherTitle: "Fale com a gente", locale: "pt_BR" }
    const g = document.createElement("script")
    g.id = "chatwoot-sdk"; g.src = "https://saas-chatwoot.ucpvkj.easypanel.host/packs/js/sdk.js"; g.async = true; g.defer = true
    g.onload = () => (window as any).chatwootSDK?.run({ websiteToken: "z9S4X8xa8pdb5JBdaN3smVqC", baseUrl: "https://saas-chatwoot.ucpvkj.easypanel.host" })
    document.body.appendChild(g)
  }, [])
  return null
}
