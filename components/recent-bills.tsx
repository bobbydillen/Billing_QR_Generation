"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface Bill {
  _id: string
  invoiceNumber: string
  createdAt: string
  buyer: {
    name: string
    gstNumber: string
  }
  totalAmount: number
}

export function RecentBills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("/api/bills")
        const data = await res.json()

        // Sort by date (newest first) and take only the 5 most recent
        const sortedBills = data
          .sort((a: Bill, b: Bill) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)

        setBills(sortedBills)
      } catch (error) {
        console.error("Failed to fetch bills:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
        <CardDescription>Your 5 most recently created bills</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading recent bills...</div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="mb-4 text-center text-muted-foreground">No bills created yet</p>
            <Button asChild>
              <Link href="/create-bill">Create Your First Bill</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                  <TableCell>{format(new Date(bill.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell>{bill.buyer.name}</TableCell>
                  <TableCell className="text-right">₹{bill.totalAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/bills/${bill._id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View bill</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

