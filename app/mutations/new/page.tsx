import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { NewMutationForm } from "@/components/new-mutation-form"

export default async function NewMutationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manually Create Mutation</h1>
          <p className="text-muted-foreground mt-1">
            Create a new mutation from scratch or paste an existing prompt.
          </p>
        </div>
        
        <NewMutationForm />
      </div>
    </div>
  )
}