import { BillsHeader } from "@/components/bills-header"
import { BillsTable } from "@/components/bills-table"

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <BillsHeader />
      <BillsTable />
    </div>
  )
}

