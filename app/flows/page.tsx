import { AppShell } from "@/components/crm/app-shell"
import { PlanGate } from "@/components/crm/plan-gate"
import { FlowsManager } from "@/components/crm/flows-manager"

export default function FlowsPage() {
  return (
    <AppShell title="Flows" subtitle="Chatbots e fluxos conversacionais no WhatsApp" noPadding>
      <PlanGate
        feature="automations"
        title="Flows conversacionais"
        description="Monte chatbots visuais: gatilho → mensagens, perguntas, condições e ações. Disponível a partir do plano Pro."
      >
        <FlowsManager />
      </PlanGate>
    </AppShell>
  )
}
