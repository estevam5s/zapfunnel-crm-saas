import { AppShell } from "@/components/crm/app-shell"
import { PlanGate } from "@/components/crm/plan-gate"
import { BroadcastManager } from "@/components/crm/broadcast-manager"

export default function BroadcastPage() {
  return (
    <AppShell title="Broadcast" subtitle="Campanhas de mensagens em massa pelo WhatsApp">
      <PlanGate
        feature="automations"
        title="Campanhas de Broadcast"
        description="Envie mensagens em massa segmentadas por etiqueta, acompanhe entregas e falhas. Disponível a partir do plano Pro."
      >
        <BroadcastManager />
      </PlanGate>
    </AppShell>
  )
}
