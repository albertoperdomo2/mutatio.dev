import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { RegisterForm } from "@/components/register-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "mutatio | register",
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/playground")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to start using Mutatio</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
