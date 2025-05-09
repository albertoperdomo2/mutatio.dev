import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | login",
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/playground")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to access Mutatio
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
