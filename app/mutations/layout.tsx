import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"
import { SavedMutationsSidebar } from "@/components/saved-mutations-sidebar"

export default async function MutationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <AppLayout user={session.user}>
      <div className="flex flex-1 overflow-hidden h-full">
        <div className="hidden md:block w-[280px] flex-shrink-0 border-r h-full">
          <SavedMutationsSidebar />
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </AppLayout>
  )
}