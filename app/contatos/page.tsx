import { AppShell } from "@/components/crm/app-shell"
import { ContactsTable } from "@/components/crm/contacts-table"

export default function ContatosPage() {
  return (
    <AppShell
      title="Contatos"
      subtitle="Todos os seus leads e clientes"
    >
      <ContactsTable />
    </AppShell>
  )
}
