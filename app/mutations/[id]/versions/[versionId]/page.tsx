import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { TryMutationPanel } from "@/components/try-mutation-panel"
import { prisma } from "@/lib/prisma"

interface VersionPageProps {
  params: {
    id: string
    versionId: string
  }
}

export async function generateMetadata({ params }: VersionPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions)
  const id = await params.id
  const versionId = await params.versionId
  
  if (!session) {
    return {
      title: "Version - Not Found",
    }
  }

  try {
    const version = await prisma.savedMutationVersion.findFirst({
      where: {
        id: versionId,
        savedMutationId: id,
        savedMutation: {
          userId: session.user.id,
        },
      },
      include: {
        savedMutation: true,
      },
    })

    if (!version) {
      return {
        title: "Version - Not Found",
      }
    }

    return {
      title: `Version ${version.versionNumber} - ${version.savedMutation.name}`,
    }
  } catch (_error) {
    return {
      title: "Version - Error",
    }
  }
}

export default async function VersionPage({ params }: VersionPageProps) {
  const session = await getServerSession(authOptions)
  const id = await params.id
  const versionId = await params.versionId

  if (!session) {
    redirect("/login")
  }

  try {
    const version = await prisma.savedMutationVersion.findFirst({
      where: {
        id: versionId,
        savedMutationId: id,
        savedMutation: {
          userId: session.user.id,
        },
      },
      include: {
        savedMutation: true,
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!version) {
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Version Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The version you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Link href={`/mutations/${id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Back to Mutation
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/mutations/${id}`} className="text-muted-foreground hover:text-foreground">
                  {version.savedMutation.name}
                </Link>
                <span className="text-muted-foreground">/</span>
                <h1 className="text-xl font-semibold">Version {version.versionNumber}</h1>
              </div>
              
              {version.notes && (
                <p className="text-muted-foreground mt-1">{version.notes}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Created on {new Date(version.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/mutations/${id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Back to Mutation
              </Link>
            </div>
          </div>
            
          <div className="grid gap-6">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 border-b">
                <h2 className="font-medium">Prompt</h2>
              </div>
              <div className="p-4">
                <div className="bg-muted/20 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {version.prompt}
                </div>
              </div>
            </div>

            <TryMutationPanel 
              mutationId={id} 
              prompt={version.prompt}
              versionId={version.id}
            />

            {version.responses.length > 0 && (
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b">
                  <h2 className="font-medium">Previous Responses</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {version.responses.map((response) => {
                      const metadata = response.metadata ? JSON.parse(response.metadata) : {};
                      return (
                        <div key={response.id} className="bg-muted/20 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{response.modelId}</span>
                              <span className="text-xs text-muted-foreground">({response.provider})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(response.createdAt).toLocaleString()}
                              </span>
                              {metadata.latency && (
                                <span className="text-xs text-muted-foreground">
                                  {(metadata.latency / 1000).toFixed(2)}s
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-line">
                            {response.response}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (_error) {
    console.error("Error loading version:", _error)
    
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading this version. Please try again later.
          </p>
          <Link href={`/mutations/${id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Back to Mutation
          </Link>
        </div>
      </div>
    )
  }
}