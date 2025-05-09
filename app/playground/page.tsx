import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Playground } from "@/components/playground"
import { AppLayout } from "@/components/app-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | playground",
}

export default async function PlaygroundPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout user={session.user}>
      <Playground user={session.user} />
    </AppLayout>
  )
}
