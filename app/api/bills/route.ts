import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { generateQRCode } from "@/lib/qrcode"
import { signJWT } from "@/lib/jwt"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const bills = await db.collection("bills").find({}).toArray()

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Failed to fetch bills:", error)
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { db, govDb } = await connectToDatabase()
    const bill = await request.json()

    // Generate a unique invoice number
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")

    // Get the count of existing bills
    const count = (await db.collection("bills").countDocuments()) + 1
    const invoiceNumber = `INV-${year}-${month}-${String(count).padStart(3, "0")}`

    // Add invoice number and creation date to the bill
    const billWithDetails = {
      ...bill,
      invoiceNumber,
      createdAt: new Date(),
    }

    // Generate JWT token with bill details
    const token = await signJWT({
      invoiceNumber,
      sellerGST: bill.seller.gstNumber,
      totalAmount: bill.totalAmount,
      timestamp: new Date().toISOString(), // Add timestamp for uniqueness
    })

    let qrCodeUrl
    try {
      // Generate QR code and upload to Cloudinary
      qrCodeUrl = await generateQRCode(token)
      console.log("QR Code URL generated:", qrCodeUrl)
    } catch (qrError) {
      console.error("QR code generation failed:", qrError)
      // Use a placeholder if QR generation fails
      qrCodeUrl = "/placeholder.svg?height=200&width=200"
    }

    // Add QR code URL to bill
    billWithDetails.qrCodeUrl = qrCodeUrl

    // Store in local database
    const result = await db.collection("bills").insertOne(billWithDetails)

    try {
      // Store in government database (simulated)
      await govDb.collection("governmentBills").insertOne({
        ...billWithDetails,
        localDbId: result.insertedId,
      })
    } catch (govDbError) {
      console.error("Failed to store in government database:", govDbError)
      // Continue even if government DB storage fails
    }

    return NextResponse.json({
      message: "Bill created successfully",
      id: result.insertedId,
      invoiceNumber,
      qrCodeUrl, // Return the QR code URL for debugging
    })
  } catch (error) {
    console.error("Failed to create bill:", error)
    return NextResponse.json(
      { error: "Failed to create bill: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 },
    )
  }
}

