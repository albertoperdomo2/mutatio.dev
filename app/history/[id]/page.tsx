import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"
import { SessionDetail } from "@/components/session-detail"

interface SessionDetailPageProps {
  params: {
    id: string
  }
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const session = await getServerSession(authOptions)
  const id = await params.id

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <SessionDetail sessionId={id} />
      </div>
    </AppLayout>
  )
}