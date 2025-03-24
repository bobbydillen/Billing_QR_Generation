import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyJWT } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    const { db, govDb } = await connectToDatabase()

    // Verify JWT token
    const decoded = await verifyJWT(token)

    if (!decoded) {
      return NextResponse.json({ verified: false, message: "Invalid QR code" }, { status: 400 })
    }

    const { invoiceNumber } = decoded

    // Check if bill exists in local database
    const localBill = await db.collection("bills").findOne({ invoiceNumber })

    // Check if bill exists in government database
    const govBill = await govDb.collection("governmentBills").findOne({ invoiceNumber })

    if (!localBill || !govBill) {
      return NextResponse.json({
        verified: false,
        message: "Bill not found in one or both databases",
      })
    }

    // Compare bill details to ensure they match
    const isMatch =
      localBill.totalAmount === govBill.totalAmount && localBill.seller.gstNumber === govBill.seller.gstNumber

    return NextResponse.json({
      verified: isMatch,
      message: isMatch ? "Bill verified successfully" : "Bill details do not match",
    })
  } catch (error) {
    console.error("Failed to verify bill:", error)
    return NextResponse.json({ error: "Failed to verify bill" }, { status: 500 })
  }
}

