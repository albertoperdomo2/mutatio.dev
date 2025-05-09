import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { TryMutationPanel } from "@/components/try-mutation-panel"
import { prisma } from "@/lib/prisma"

interface MutationPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MutationPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions)
  const id = await params.id
  
  if (!session) {
    return {
      title: "Mutation - Not Found",
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
        title: "Mutation - Not Found",
      }
    }

    return {
      title: `Mutation - ${mutation.name}`,
    }
  } catch (_error) {
    return {
      title: "Mutation - Error",
    }
  }
}

export default async function MutationPage({ params }: MutationPageProps) {
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
          include: {
            responses: {
              orderBy: { createdAt: "desc" },
            }
          }
        }
      }
    })

    if (!mutation) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Mutation Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The mutation you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <a href="/mutations" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Back to Mutations
            </a>
          </div>
        </div>
      )
    }

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{mutation.name}</h1>
              {mutation.description && (
                <p className="text-muted-foreground mt-1">{mutation.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a href={`/mutations/${mutation.id}/edit`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Edit
              </a>
            </div>
          </div>
          
          <div className="grid gap-6">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b">
                <h2 className="font-medium">Original Prompt</h2>
              </div>
              <div className="p-4">
                <div className="bg-muted/20 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {mutation.originalPrompt}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
                <h2 className="font-medium">Current Version</h2>
                <span className="text-xs text-muted-foreground">
                  Version {mutation.versions[0]?.versionNumber || "N/A"}
                </span>
              </div>
              <div className="p-4">
                <div className="bg-muted/20 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {mutation.versions[0]?.prompt || "No version available"}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b">
                <h2 className="font-medium">Version History</h2>
              </div>
              <div className="p-4">
                <div className="divide-y">
                  {mutation.versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5">
                          v{version.versionNumber}
                        </div>
                        <span className="text-sm">{version.notes || "No notes"}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                        <a href={`/mutations/${mutation.id}/versions/${version.id}`} className="text-xs text-primary hover:underline">
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <TryMutationPanel 
              mutationId={mutation.id} 
              prompt={mutation.versions[0]?.prompt || ""}
              versionId={mutation.versions[0]?.id}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading mutation:", error)
    
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading this mutation. Please try again later.
          </p>
          <a href="/mutations" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Back to Mutations
          </a>
        </div>
      </div>
    )
  }
}