"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash, Plus } from "lucide-react"

// Modified schema to make some fields optional for easier testing
const billSchema = z.object({
  buyer: z.object({
    name: z.string().min(2, "Customer name must be at least 2 characters"),
    gstNumber: z.string().min(2, "Please enter a valid GSTIN"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    stateCode: z.string().min(1, "State code is required"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().min(2, "Product name must be at least 2 characters"),
        hsnCode: z.string().min(1, "HSN/SAC code is required"),
        quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
        rate: z.coerce.number().positive("Rate must be positive"),
        gstPercentage: z.coerce.number().min(0, "GST percentage must be non-negative"),
      }),
    )
    .min(1, "At least one item is required"),
  dueDate: z.string().optional(),
})

type BillFormValues = z.infer<typeof billSchema>

interface Product {
  _id: string
  name: string
  sellingPrice: number
  hsnCode: string
  gstPercentage: number
}

export function CreateBillForm() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isIntraState, setIsIntraState] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      buyer: {
        name: "Test Customer",
        gstNumber: "29AABCT1234A1Z5",
        address: "123 Test Street, Test City",
        state: "Karnataka",
        stateCode: "29",
      },
      items: [
        {
          name: "Test Product",
          hsnCode: "1234",
          quantity: 1,
          rate: 1000,
          gstPercentage: 18,
        },
      ],
      dueDate: "",
    },
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/products")

        if (!res.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
        toast.error("Failed to load products. Using sample data instead.")
        // Set some sample products for testing
        setProducts([
          {
            _id: "sample1",
            name: "Sample Product 1",
            sellingPrice: 1000,
            hsnCode: "1234",
            gstPercentage: 18,
          },
          {
            _id: "sample2",
            name: "Sample Product 2",
            sellingPrice: 2000,
            hsnCode: "5678",
            gstPercentage: 12,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find((p) => p._id === productId)
    if (product) {
      const items = form.getValues("items")
      items[index] = {
        ...items[index],
        productId: product._id,
        name: product.name,
        hsnCode: product.hsnCode,
        rate: product.sellingPrice,
        gstPercentage: product.gstPercentage,
      }
      form.setValue("items", items)
    }
  }

  const calculateSubtotal = () => {
    const items = form.getValues("items")
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }

  const calculateTaxes = () => {
    const items = form.getValues("items")
    const taxes = {
      cgst: 0,
      sgst: 0,
      igst: 0,
    }

    items.forEach((item) => {
      const taxAmount = (item.quantity * item.rate * item.gstPercentage) / 100
      if (isIntraState) {
        taxes.cgst += taxAmount / 2
        taxes.sgst += taxAmount / 2
      } else {
        taxes.igst += taxAmount
      }
    })

    return taxes
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxes = calculateTaxes()
    return subtotal + taxes.cgst + taxes.sgst + taxes.igst
  }

  const handleStateCodeChange = (value: string) => {
    // Check if buyer's state code matches the seller's state code (29 for Karnataka in this example)
    const sellerStateCode = "29" // Assuming seller is in Karnataka
    setIsIntraState(value === sellerStateCode)
  }

  async function onSubmit(data: BillFormValues) {
    setIsSubmitting(true)
    try {
      // Calculate all the financial values
      const subtotal = calculateSubtotal()
      const taxes = calculateTaxes()
      const total = calculateTotal()

      // Prepare the bill data
      const billData = {
        ...data,
        seller: {
          name: "ABC Company",
          address: "Chennai",
          phone: "8524123654",
          gstNumber: "GTHUJ25632512355",
          email: "abccustomercare@gmail.com",
        },
        subtotal,
        taxes,
        totalAmount: total,
        isIntraState,
      }

      console.log("Submitting bill data:", billData)

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create bill")
      }

      toast.success("Bill created successfully")
      router.push(`/bills/${result.id}`)
    } catch (error) {
      console.error("Error creating bill:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create bill")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center p-4">Loading form...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="buyer.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buyer.gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GSTIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="buyer.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter billing address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="buyer.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buyer.stateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter state code (e.g., 29)"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleStateCodeChange(e.target.value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>HSN/SAC Code</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>GST %</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch("items").map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) => handleProductSelect(value, index)}
                          value={form.getValues(`items.${index}.productId`) || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormField
                          control={form.control}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.hsnCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="HSN/SAC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.gstPercentage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      {(
                        (form.getValues(`items.${index}.quantity`) || 0) * (form.getValues(`items.${index}.rate`) || 0)
                      ).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const items = form.getValues("items")
                          if (items.length > 1) {
                            form.setValue(
                              "items",
                              items.filter((_, i) => i !== index),
                            )
                          }
                        }}
                        disabled={form.watch("items").length === 1}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                const items = form.getValues("items")
                form.setValue("items", [
                  ...items,
                  {
                    name: "",
                    hsnCode: "",
                    quantity: 1,
                    rate: 0,
                    gstPercentage: 18,
                  },
                ])
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>

            <div className="mt-6 space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toLocaleString("en-IN")}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{calculateTaxes().cgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{calculateTaxes().sgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>IGST:</span>
                  <span>₹{calculateTaxes().igst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span>₹{calculateTotal().toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/bills")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Bill"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

