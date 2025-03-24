"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Image from "next/image"

export function QRCodeTest() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTestQRCode = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/test-qr")
      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to generate test QR code")
      }

      setQrCodeUrl(data.qrCodeUrl)
      toast.success("Test QR code generated successfully")
    } catch (error) {
      console.error("Error generating test QR code:", error)
      setError(error instanceof Error ? error.message : "Failed to generate test QR code")
      toast.error(error instanceof Error ? error.message : "Failed to generate test QR code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Test</CardTitle>
        <CardDescription>Test QR code generation and Cloudinary integration</CardDescription>
      </CardHeader>
      <CardContent>
        {qrCodeUrl ? (
          <div className="flex flex-col items-center">
            <div className="h-[200px] w-[200px] relative border border-gray-200 rounded-md overflow-hidden">
              <Image
                src={qrCodeUrl || "/placeholder.svg"}
                alt="Test QR Code"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <p className="mt-2 text-sm text-center text-muted-foreground">
              Test QR code generated and stored in Cloudinary
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-md">
            <p className="text-sm text-muted-foreground">
              {error || "Click the button below to generate a test QR code"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={generateTestQRCode} disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate Test QR Code"}
        </Button>
      </CardFooter>
    </Card>
  )
}

