import { AppShell } from "@/components/crm/app-shell"
import { KanbanBoard } from "@/components/crm/kanban-board"

export default function FunilPage() {
  return (
    <AppShell
      title="Funil de vendas"
      subtitle="Arraste os cards entre as etapas"
      noPadding
    >
      <div className="h-full p-4 md:p-6">
        <KanbanBoard />
      </div>
    </AppShell>
  )
}
