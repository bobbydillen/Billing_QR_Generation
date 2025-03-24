import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const bill = await db.collection("bills").findOne({ _id: new ObjectId(params.id) })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    // In a real implementation, you would generate a PDF here
    // For this demo, we'll return a simple text response
    // Note: puppeteer is not available in the next-lite runtime

    return new NextResponse(`Bill ${bill.invoiceNumber} would be downloaded as PDF`, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Failed to download bill:", error)
    return NextResponse.json({ error: "Failed to download bill" }, { status: 500 })
  }
}

