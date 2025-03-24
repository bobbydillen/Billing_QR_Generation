import { NextResponse } from "next/server"
import { generateQRCode } from "@/lib/qrcode"

export async function GET() {
  try {
    // Generate a test QR code
    const testData = {
      test: "This is a test QR code",
      timestamp: new Date().toISOString(),
    }

    const qrCodeUrl = await generateQRCode(JSON.stringify(testData))

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      message: "Test QR code generated successfully",
    })
  } catch (error) {
    console.error("Failed to generate test QR code:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate test QR code: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}

