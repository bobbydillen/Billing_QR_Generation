"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Package, IndianRupee, TrendingUp } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalBills: 0,
    totalProducts: 0,
    totalRevenue: 0,
    averageBillValue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch bills
        const billsRes = await fetch("/api/bills")
        const bills = await billsRes.json()

        // Fetch products
        const productsRes = await fetch("/api/products")
        const products = await productsRes.json()

        // Calculate stats
        const totalRevenue = bills.reduce((sum: number, bill: any) => sum + bill.totalAmount, 0)

        setStats({
          totalBills: bills.length,
          totalProducts: products.length,
          totalRevenue,
          averageBillValue: bills.length ? totalRevenue / bills.length : 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBills}</div>
          <p className="text-xs text-muted-foreground">Bills generated</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">Products in inventory</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
          <p className="text-xs text-muted-foreground">Total sales amount</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Bill Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats.averageBillValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">Average transaction value</p>
        </CardContent>
      </Card>
    </div>
  )
}

