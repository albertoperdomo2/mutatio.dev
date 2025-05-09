import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { MutationEditForm } from "@/components/mutation-edit-form"
import { prisma } from "@/lib/prisma"

interface MutationEditPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MutationEditPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions)
  const id = await params.id
  
  if (!session) {
    return {
      title: "Edit Mutation - Not Found",
    }
  }

  try {
    const mutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!mutation) {
      return {
        title: "Edit Mutation - Not Found",
      }
    }

    return {
      title: `Edit Mutation - ${mutation.name}`,
    }
  } catch (_error) {
    return {
      title: "Edit Mutation - Error",
    }
  }
}

export default async function MutationEditPage({ params }: MutationEditPageProps) {
  const session = await getServerSession(authOptions)
  const id = await params.id

  if (!session) {
    redirect("/login")
  }

  try {
    const mutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        }
      }
    })

    if (!mutation) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Mutation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The mutation you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
            </p>
            <a href="/mutations" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Back to Mutations
            </a>
          </div>
        </div>
      )
    }

    let tags: string[] = [];
    try {
      if (mutation.tags) {
        if (typeof mutation.tags === 'string') {
          const parsedTags = JSON.parse(mutation.tags);
          tags = Array.isArray(parsedTags) ? parsedTags : [];
        } else if (Array.isArray(mutation.tags)) {
          tags = mutation.tags;
        }
      }
    } catch (error) {
      console.error("Error parsing tags:", error);
    }

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Mutation</h1>
            <p className="text-muted-foreground mt-1">
              Update your mutation details or create a new version.
            </p>
          </div>
          
          <MutationEditForm 
            mutation={{
              id: mutation.id,
              name: mutation.name,
              description: mutation.description || '',
              originalPrompt: mutation.originalPrompt,
              tags,
              starred: mutation.starred,
              currentVersion: mutation.versions[0] ? {
                id: mutation.versions[0].id,
                versionNumber: mutation.versions[0].versionNumber,
                prompt: mutation.versions[0].prompt,
                notes: mutation.versions[0].notes || '',
              } : null
            }}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading mutation for editing:", error)
    
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading this mutation for editing. Please try again later.
          </p>
          <a href="/mutations" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Back to Mutations
          </a>
        </div>
      </div>
    )
  }
}