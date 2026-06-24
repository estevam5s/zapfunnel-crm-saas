import { AppShell } from "@/components/crm/app-shell"
import { KpiCards } from "@/components/crm/kpi-cards"
import { RevenueChart, MessagesChart } from "@/components/crm/charts"
import { FunnelOverview } from "@/components/crm/funnel-overview"
import { RecentLeads } from "@/components/crm/recent-leads"

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão geral das suas vendas no WhatsApp"
    >
      <div className="flex flex-col gap-4 md:gap-6">
        <KpiCards />
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <RevenueChart />
          <MessagesChart />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <FunnelOverview />
          <RecentLeads />
        </div>
      </div>
    </AppShell>
  )
}
