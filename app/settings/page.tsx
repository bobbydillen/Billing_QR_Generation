import { SettingsForm } from "@/components/settings-form"
import { CloudinaryStatus } from "@/components/cloudinary-status"
import { QRCodeTest } from "@/components/qr-code-test"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <SettingsForm />
        </div>

        <div>
          <CloudinaryStatus />
        </div>

        <div>
          <QRCodeTest />
        </div>
      </div>
    </div>
  )
}

