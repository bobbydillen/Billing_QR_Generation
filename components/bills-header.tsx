import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FilePlus } from "lucide-react"

export function BillsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Bills</h1>
      <Button asChild>
        <Link href="/create-bill">
          <FilePlus className="mr-2 h-4 w-4" />
          Create Bill
        </Link>
      </Button>
    </div>
  )
}

