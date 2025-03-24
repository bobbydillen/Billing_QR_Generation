import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    // Validate the ID format
    let objectId
    try {
      objectId = new ObjectId(params.id)
    } catch (error) {
      return NextResponse.json({ error: "Invalid bill ID format" }, { status: 400 })
    }

    const bill = await db.collection("bills").findOne({ _id: objectId })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Failed to fetch bill:", error)
    return NextResponse.json(
      { error: "Failed to fetch bill: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 },
    )
  }
}

