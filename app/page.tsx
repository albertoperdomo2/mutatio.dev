import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingPage } from "@/components/landing-page"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/playground")
  }

  return <LandingPage />
}
