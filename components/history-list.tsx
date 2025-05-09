"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Clock, ArrowRight, Star, Trash2, Search, X, StarOff, History } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMutationTypeColor } from "@/lib/utils-diff"

interface Session {
  id: string
  basePrompt: string
  mutations: string
  starred: boolean
  createdAt: string
}

interface HistoryListProps {
  userId: string;
}

export function HistoryList({ userId }: HistoryListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const limit = 10

  const fetchSessions = async (pageNum = 1, tab = activeTab, query = searchQuery) => {
    try {
      setIsLoading(true)

      // build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      })

      // add starred filter if on starred tab
      if (tab === "starred") {
        params.append("starred", "true")
      }

      // add search query if present
      if (query) {
        params.append("search", query)
      }

      const response = await fetch(`/api/sessions?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
        setTotalPages(data.pagination.totalPages)
        setPage(data.pagination.page)
      } else {
        console.error("Failed to fetch sessions:", await response.text())
        toast({
          title: "Error",
          description: "Failed to load session history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load session history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    fetchSessions(1, value)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSessions(1, activeTab, searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery("")
    fetchSessions(1, activeTab, "")
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      fetchSessions(newPage, activeTab, searchQuery)
    }
  }

  const handleStarSession = async (sessionId: string, currentStarred: boolean) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !currentStarred }),
      })

      if (response.ok) {
        // update the session in the local state
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId ? { ...session, starred: !session.starred } : session,
          ),
        )

        toast({
          title: currentStarred ? "Session unstarred" : "Session starred",
          description: currentStarred ? "Session removed from favorites" : "Session added to favorites",
        })
      } else {
        throw new Error("Failed to update session")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId)
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return

    try {
      const response = await fetch(`/api/sessions/${sessionToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // remove the session from the local state
        setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionToDelete))

        toast({
          title: "Session deleted",
          description: "The session has been permanently deleted",
        })
      } else {
        throw new Error("Failed to delete session")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      })
    } finally {
      setSessionToDelete(null)
    }
  }

  const viewSession = (sessionId: string) => {
    router.push(`/history/${sessionId}`)
  }

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-medium tracking-tight">Session History</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-[200px] rounded-lg p-1 bg-muted/50 border">
              <TabsTrigger value="all" className="rounded-md text-xs data-[state=active]:bg-background">
                All Sessions
              </TabsTrigger>
              <TabsTrigger value="starred" className="rounded-md text-xs data-[state=active]:bg-background">
                Starred
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sessions..."
                className="w-full pl-8 sm:w-[250px] rounded-lg h-9 bg-transparent border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
            <Button type="submit" className="ml-2 rounded-lg h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
              Search
            </Button>
          </form>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-background via-background/80 to-muted/30 shadow-md">
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 bg-primary/5 rounded-full">
                <Clock className="h-10 w-10 text-primary/80" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">No Sessions Found</h2>
              <p className="mb-8 max-w-md text-muted-foreground">
                {activeTab === "starred"
                  ? "You haven't starred any sessions yet."
                  : searchQuery
                    ? "No sessions match your search criteria."
                    : "Your prompt mutation sessions will appear here once you create them."}
              </p>
              {activeTab === "starred" || searchQuery ? (
                <Button
                  onClick={() => {
                    setActiveTab("all")
                    setSearchQuery("")
                    fetchSessions(1, "all", "")
                  }}
                  className="rounded-lg"
                >
                  View All Sessions
                </Button>
              ) : (
                <Button onClick={() => router.push("/playground")} className="rounded-lg">
                  Go to Playground
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {sessions.map((session) => {
              // parse the mutations to get the count
              const mutations = JSON.parse(session.mutations || "[]")
              const mutationCount = mutations.length

              return (
                <Card
                  key={session.id}
                  className={`overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${
                    session.starred ? "border-amber-500/50" : ""
                  }`}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-medium truncate max-w-[300px]">
                          {session.basePrompt}
                        </CardTitle>
                        {session.starred && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-200/20 text-xs py-0 h-5">Starred</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-400 text-primary-foreground/80">
                          {mutationCount} mutation{mutationCount !== 1 ? "s" : ""}
                        </div>
                        {mutations[0]?.type && (() => {
                          const colorClasses = getMutationTypeColor(mutations[0].type.toLowerCase());
                          return (
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses}`}>
                              {mutations[0].type}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStarSession(session.id, session.starred)}
                          className="h-8 px-2.5 text-xs rounded-lg"
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
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDeleteSession(session.id)}
                          className="h-8 px-2.5 text-xs text-destructive hover:text-destructive rounded-lg"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewSession(session.id)}
                          className="h-8 px-2.5 text-xs rounded-lg bg-primary/5 hover:bg-primary/10 border-primary/10"
                        >
                          View Details
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="h-8 px-3 rounded-lg text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
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