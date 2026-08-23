import { AppShell } from "@/components/crm/app-shell"
import { WhatsappConnect } from "@/components/crm/whatsapp-connect"

export default function ConectarPage() {
  return (
    <AppShell
      title="Conectar WhatsApp"
      subtitle="Vincule um ou mais números conforme o seu plano"
    >
      <div className="w-full">
        <WhatsappConnect />
      </div>
    </AppShell>
  )
}
