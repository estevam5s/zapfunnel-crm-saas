import { AppShell } from "@/components/crm/app-shell"
import { Inbox } from "@/components/crm/inbox"

export default function InboxPage() {
  return (
    <AppShell
      title="Inbox"
      subtitle="Conversas do WhatsApp em um só lugar"
      noPadding
    >
      <div className="h-full p-4 md:p-6">
        <Inbox />
      </div>
    </AppShell>
  )
}
