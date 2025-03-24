import { ProductsHeader } from "@/components/products-header"
import { ProductsTable } from "@/components/products-table"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <ProductsHeader />
      <ProductsTable />
    </div>
  )
}

