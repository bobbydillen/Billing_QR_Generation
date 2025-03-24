"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Image from "next/image"

interface BillItem {
  name: string
  hsnCode: string
  quantity: number
  rate: number
  gstPercentage: number
}

interface Bill {
  _id: string
  invoiceNumber: string
  createdAt: string
  dueDate?: string
  seller: {
    name: string
    address: string
    phone: string
    gstNumber: string
    email: string
  }
  buyer: {
    name: string
    gstNumber: string
    address: string
    state: string
    stateCode: string
  }
  items: BillItem[]
  subtotal: number
  taxes: {
    cgst: number
    sgst: number
    igst: number
  }
  totalAmount: number
  isIntraState: boolean
  qrCodeUrl: string
}

export function BillDetails({ id }: { id: string }) {
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeError, setQrCodeError] = useState(false)

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/bills/${id}`)

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Bill not found")
          }
          throw new Error("Failed to fetch bill")
        }

        const data = await res.json()
        console.log("Bill data:", data) // For debugging
        setBill(data)
      } catch (error) {
        console.error("Error fetching bill:", error)
        setError(error instanceof Error ? error.message : "Failed to load bill details")
        toast.error(error instanceof Error ? error.message : "Failed to load bill details")
      } finally {
        setLoading(false)
      }
    }

    fetchBill()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleQrCodeError = () => {
    console.error("QR code image failed to load")
    setQrCodeError(true)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading bill details...</div>
  }

  if (error || !bill) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="mb-4 text-center text-muted-foreground">{error || "Bill not found"}</p>
        <Button onClick={() => router.push("/bills")}>Back to Bills</Button>
      </div>
    )
  }

  // Format the date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd-MMM-yyyy")
    } catch (error) {
      console.error("Invalid date format:", error)
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/bills")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/bills/${id}/download`} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between border-b pb-6 md:flex-row">
              <div>
                <h2 className="text-2xl font-bold">{bill.seller.name}</h2>
                <p className="text-muted-foreground">GSTIN: {bill.seller.gstNumber}</p>
                <p className="text-muted-foreground">{bill.seller.address}</p>
                <p className="text-muted-foreground">Phone: {bill.seller.phone}</p>
                <p className="text-muted-foreground">Email: {bill.seller.email}</p>
              </div>
              <div className="mt-4 text-right md:mt-0">
                <h3 className="text-xl font-semibold">Invoice #{bill.invoiceNumber}</h3>
                <p className="text-muted-foreground">Invoice Date: {formatDate(bill.createdAt)}</p>
                {bill.dueDate && <p className="text-muted-foreground">Due Date: {formatDate(bill.dueDate)}</p>}
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-b pb-6">
              <h3 className="mb-2 font-semibold">Bill To:</h3>
              <p>{bill.buyer.name}</p>
              <p>GSTIN: {bill.buyer.gstNumber}</p>
              <p>{bill.buyer.address}</p>
              <p>
                Place of Supply: {bill.buyer.state} ({bill.buyer.stateCode})
              </p>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Item</th>
                    <th className="py-2 text-left">HSN Code</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Taxable Value</th>
                    {bill.isIntraState ? (
                      <>
                        <th className="py-2 text-right">CGST</th>
                        <th className="py-2 text-right">SGST</th>
                      </>
                    ) : (
                      <th className="py-2 text-right">IGST</th>
                    )}
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, index) => {
                    const taxableValue = item.quantity * item.rate
                    const taxAmount = (taxableValue * item.gstPercentage) / 100
                    const itemTotal = taxableValue + taxAmount

                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.hsnCode}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">₹{item.rate.toLocaleString("en-IN")}</td>
                        <td className="py-2 text-right">₹{taxableValue.toLocaleString("en-IN")}</td>
                        {bill.isIntraState ? (
                          <>
                            <td className="py-2 text-right">
                              ₹{(taxAmount / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                              <br />
                              <span className="text-xs text-muted-foreground">({item.gstPercentage / 2}%)</span>
                            </td>
                            <td className="py-2 text-right">
                              ₹{(taxAmount / 2).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                              <br />
                              <span className="text-xs text-muted-foreground">({item.gstPercentage / 2}%)</span>
                            </td>
                          </>
                        ) : (
                          <td className="py-2 text-right">
                            ₹{taxAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            <br />
                            <span className="text-xs text-muted-foreground">({item.gstPercentage}%)</span>
                          </td>
                        )}
                        <td className="py-2 text-right">
                          ₹{itemTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-between">
              <div className="w-1/2">
                <p>Reverse Charge: No</p>
                <div className="mt-8">
                  <p className="font-semibold">Authorized Signatory</p>
                  <p>({bill.seller.name})</p>
                </div>
              </div>
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {bill.isIntraState ? (
                  <>
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span>₹{bill.taxes.cgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span>₹{bill.taxes.sgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{bill.taxes.igst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total Amount (Including GST):</span>
                  <span>₹{bill.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-end">
              {bill.qrCodeUrl && !qrCodeError ? (
                <div className="text-center">
                  <div className="h-[150px] w-[150px] relative border border-gray-200 rounded-md overflow-hidden">
                    <Image
                      src={bill.qrCodeUrl || "/placeholder.svg"}
                      alt="QR Code for bill verification"
                      fill
                      style={{ objectFit: "contain" }}
                      onError={handleQrCodeError}
                      priority
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Scan to verify</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="h-[150px] w-[150px] flex items-center justify-center border border-gray-200 rounded-md">
                    <p className="text-xs text-muted-foreground">QR Code not available</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Verification unavailable</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

