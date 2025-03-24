"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function CloudinaryStatus() {
  const [status, setStatus] = useState<{
    configured: boolean
    cloudName: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCloudinaryConfig = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/cloudinary-config")
        const data = await res.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to check Cloudinary config:", error)
        toast.error("Failed to check Cloudinary configuration")
      } finally {
        setLoading(false)
      }
    }

    checkCloudinaryConfig()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary Integration</CardTitle>
          <CardDescription>Checking configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloudinary Integration</CardTitle>
        <CardDescription>Status of your Cloudinary integration for QR code storage</CardDescription>
      </CardHeader>
      <CardContent>
        {status?.configured ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Cloudinary is properly configured</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <span>Cloudinary is not configured</span>
          </div>
        )}

        {status?.cloudName && (
          <p className="mt-2 text-sm text-muted-foreground">Using cloud name: {status.cloudName}</p>
        )}

        {!status?.configured && (
          <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">Missing Cloudinary configuration</p>
            <p className="mt-1">
              QR codes will not be stored in Cloudinary. Please add the following environment variables:
            </p>
            <ul className="mt-2 list-inside list-disc">
              <li>CLOUDINARY_CLOUD_NAME</li>
              <li>CLOUDINARY_API_KEY</li>
              <li>CLOUDINARY_API_SECRET</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={() => window.open("https://cloudinary.com/console", "_blank")}>
          Open Cloudinary Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}

