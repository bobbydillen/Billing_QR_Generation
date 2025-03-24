import { DashboardStats } from "@/components/dashboard-stats"
import { RecentBills } from "@/components/recent-bills"
import { DashboardHeader } from "@/components/dashboard-header"

export default function Home() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats />
      <RecentBills />
    </div>
  )
}

