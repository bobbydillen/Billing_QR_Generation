import { NextResponse } from "next/server"

export async function GET() {
  // This endpoint is for checking if Cloudinary is configured
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET

  return NextResponse.json({
    configured: !!isConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  })
}

