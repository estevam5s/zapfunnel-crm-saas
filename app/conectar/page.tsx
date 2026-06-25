import { AppShell } from "@/components/crm/app-shell"
import { WhatsappConnect } from "@/components/crm/whatsapp-connect"

export default function ConectarPage() {
  return (
    <AppShell
      title="Conectar WhatsApp"
      subtitle="Leia o QR Code para vincular seu número"
    >
      <div className="mx-auto w-full max-w-5xl">
        <WhatsappConnect />
      </div>
    </AppShell>
  )
}
