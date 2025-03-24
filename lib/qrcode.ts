import QRCode from "qrcode"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dqfwczish",
  api_key: process.env.CLOUDINARY_API_KEY || "786759682511233",
  api_secret: process.env.CLOUDINARY_API_SECRET || "8jDu4wQlK02OAGXoj_GS3n8i7xU",
  secure: true,
})

// Function to upload to Cloudinary
async function uploadToCloudinary(qrCodeDataUrl: string): Promise<string> {
  try {
    // Remove the data:image/png;base64, part
    const base64Data = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, "")

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:image/png;base64,${base64Data}`,
        {
          folder: "gst-billing-qrcodes",
          resource_type: "image",
          format: "png",
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
    })

    return result.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload QR code to Cloudinary")
  }
}

export async function generateQRCode(token: string): Promise<string> {
  try {
    // Generate QR code as data URL with higher quality settings
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })

    // Upload to Cloudinary and get URL
    const cloudinaryUrl = await uploadToCloudinary(qrCodeDataUrl)

    return cloudinaryUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    // Return a placeholder QR code URL in case of error
    return "/placeholder.svg?height=200&width=200"
  }
}

