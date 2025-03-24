import { CreateBillForm } from "@/components/create-bill-form"

export default function CreateBillPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Bill</h1>
      </div>
      <CreateBillForm />
    </div>
  )
}

