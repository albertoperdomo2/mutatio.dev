import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"
import { HistoryList } from "@/components/history-list"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | sessions history",
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <HistoryList userId={session.user.id} />
      </div>
    </AppLayout>
  )
}