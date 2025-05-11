"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, StarOff, Trash2, Copy, Sparkles, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptMutationCard } from "@/components/prompt-mutation-card"
import { ValidationPanel } from "@/components/validation-panel"
import { getMutationTypeColor } from "@/lib/utils-diff"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SessionDetailProps {
  sessionId: string;
}

export function SessionDetail({ sessionId }: SessionDetailProps) {
  interface Mutation {
    id?: number | string;
    mutatedPrompt: string;
    provider?: string;
    model?: string;
    mutationType?: string;
    tokens: number;
    cost: number;
    [key: string]: any;
  }
  
  interface Session {
    id: string;
    starred: boolean;
    basePrompt: string;
    mutations: Mutation[] | string;
    settings?: string;
    [key: string]: any;
  }
  
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("mutations")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/sessions/${sessionId}`)

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      } else {
        console.error("Failed to fetch session:", await response.text())
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive",
        })
        router.push("/history")
      }
    } catch (error) {
      console.error("Failed to fetch session:", error)
      toast({
        title: "Error",
        description: "Failed to load session details",
        variant: "destructive",
      })
      router.push("/history")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarSession = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !session.starred }),
      })

      if (response.ok) {
        setSession((prev) => {
          if (!prev) return prev;
          return { ...prev, starred: !prev.starred };
        })
        toast({
          title: session?.starred ? "Session unstarred" : "Session starred",
          description: session?.starred ? "Session removed from favorites" : "Session added to favorites",
        })
      } else {
        throw new Error("Failed to update session")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Session deleted",
          description: "The session has been permanently deleted",
        })
        router.push("/history")
      } else {
        throw new Error("Failed to delete session")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const copyToPlayground = () => {
    // store session data in localStorage to be used in the playground
    if (session) {
      try {
        const settings = session.settings ? JSON.parse(session.settings) : {}
        const mutations = typeof session.mutations === 'string' ? JSON.parse(session.mutations) : session.mutations

        localStorage.setItem(
          "playground_restore",
          JSON.stringify({
            prompt: session.basePrompt,
            mutations,
            settings,
            timestamp: Date.now(),
          }),
        )

        toast({
          title: "Session copied",
          description: "Session data copied to playground",
        })

        router.push("/playground")
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy session to playground",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary/70" />
            </div>
            <div className="h-2 w-32 bg-primary/10 rounded-full"></div>
          </div>
          <p className="text-muted-foreground text-sm mt-4">Loading session details...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Card className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-background via-background/80 to-muted/30 shadow-md">
        <CardContent className="p-10">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 p-4 bg-primary/5 rounded-full">
              <FileText className="h-10 w-10 text-primary/80" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">Session Not Found</h2>
            <p className="mb-8 max-w-md text-muted-foreground">
              The session you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push("/history")} className="rounded-lg">
              Back to History
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const mutations = typeof session.mutations === 'string' 
    ? JSON.parse(session.mutations || "[]") 
    : (session.mutations || [])
    
  const settings = session.settings 
    ? JSON.parse(session.settings) 
    : {}

  const hasValidations = settings.validations && settings.validations.length > 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-medium tracking-tight">Session Details</h1>
          {session.starred && (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-200/20 text-xs">Starred</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/history")}
            className="h-8 px-3 rounded-lg text-xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to History
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToPlayground}
            className="h-8 px-3 rounded-lg text-xs"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy to Playground
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStarSession}
            className="h-8 px-3 rounded-lg text-xs"
          >
            {session.starred ? (
              <>
                <StarOff className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Unstar
              </>
            ) : (
              <>
                <Star className="mr-1.5 h-3.5 w-3.5" />
                Star
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-8 px-3 rounded-lg text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl border shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">{session.basePrompt}</CardTitle>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary-foreground/80">
                {mutations.length} mutation{mutations.length !== 1 ? "s" : ""}
              </div>
              {settings.mutationTypeId && mutations[0]?.type && (() => {
                const type = mutations[0].type;
                const colorClasses = getMutationTypeColor(typeof type === 'string' ? type.toLowerCase() : 'default');
                return (
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses}`}>
                    Type: {type}
                  </div>
                );
              })()}
              <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/60">
                Strength: {settings.mutationStrength || "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <TabsList className="mb-6 grid w-full grid-cols-2 rounded-lg p-1 bg-muted/50 border max-w-[300px]">
          <TabsTrigger value="mutations" className="rounded-md text-xs data-[state=active]:bg-background">
            Mutations
          </TabsTrigger>
          <TabsTrigger 
            value="validations" 
            disabled={!hasValidations}
            className="rounded-md text-xs data-[state=active]:bg-background"
          >
            Validations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mutations" className="space-y-6 animate-slide-up">
          <Card className="overflow-hidden rounded-xl border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-lg font-medium">Original Prompt</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="rounded-lg bg-muted/30 p-4 text-sm">{session.basePrompt}</div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold">Mutated Prompts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mutations.map((mutation: Mutation, index: number) => (
              <PromptMutationCard
                key={index}
                mutation={{
                  id: String(index),
                  text: mutation.mutatedPrompt,
                  type: mutation.mutationType || 'mutated',
                  strength: 5,
                  tokens: mutation.tokens,
                  cost: mutation.cost
                }}
                isSelected={false}
                onToggleSelect={() => {}}
                originalPrompt={session.basePrompt}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validations" className="animate-slide-up">
          {hasValidations ? (
            <ValidationPanel
              validations={settings.validations}
              mutations={mutations}
              selectedMutations={settings.selectedMutations || []}
              originalPrompt={session.basePrompt}
            />
          ) : (
            <Card className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-background via-background/80 to-muted/30 shadow-md">
              <CardContent className="p-10">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-6 p-4 bg-primary/5 rounded-full">
                    <FileText className="h-10 w-10 text-primary/80" />
                  </div>
                  <h2 className="mb-3 text-2xl font-semibold tracking-tight">No Validations Available</h2>
                  <p className="mb-6 max-w-md text-muted-foreground">This session doesn't have any validation data.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the session and remove it from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground rounded-lg">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}