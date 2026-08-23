import { AppShell } from "@/components/crm/app-shell"
import { PlanGate } from "@/components/crm/plan-gate"
import { AutomationsManager } from "@/components/crm/automations-manager"

export default function AutomacoesPage() {
  return (
    <AppShell title="Automações" subtitle="Fluxos de follow-up e ações por gatilho">
      <PlanGate
        feature="automations"
        title="Automações de funil"
        description="Crie gatilhos e ações automáticas (boas-vindas, follow-up, mover etapa, etiquetar). Disponível a partir do plano Pro."
      >
        <AutomationsManager />
      </PlanGate>
    </AppShell>
  )
}
