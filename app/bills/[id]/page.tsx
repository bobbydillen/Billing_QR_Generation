import { BillDetails } from "@/components/bill-details"

export default function BillDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bill Details</h1>
      </div>
      <BillDetails id={params.id} />
    </div>
  )
}

