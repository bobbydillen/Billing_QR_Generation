"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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

export function BillsTable() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/bills")
        const data = await res.json()

        // Sort by date (newest first)
        const sortedBills = data.sort(
          (a: Bill, b: Bill) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        setBills(sortedBills)
      } catch (error) {
        console.error("Failed to fetch bills:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">Loading bills...</div>
        </CardContent>
      </Card>
    )
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            <p className="mb-4 text-center text-muted-foreground">
              No bills found. Create your first bill to get started.
            </p>
            <Button asChild>
              <Link href="/create-bill">Create Your First Bill</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>GSTIN</TableHead>
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
                <TableCell>{bill.buyer.gstNumber}</TableCell>
                <TableCell className="text-right">₹{bill.totalAmount.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/bills/${bill._id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View bill</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/api/bills/${bill._id}/download`} target="_blank">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download bill</span>
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

