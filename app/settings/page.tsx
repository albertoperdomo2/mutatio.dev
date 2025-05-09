import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SettingsForm } from "@/components/settings-form"
import { AppLayout } from "@/components/app-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | settings",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <SettingsForm user={session.user} />
      </div>
    </AppLayout>
  )
}
