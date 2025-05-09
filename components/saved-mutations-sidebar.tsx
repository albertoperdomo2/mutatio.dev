"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  PenSquare, 
  Star, 
  Clock, 
  Search, 
  Plus, 
  Loader2,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface SavedMutation {
  id: string
  name: string
  description: string
  starred: boolean
  tags: string | string[]
  createdAt: string
  updatedAt: string
  versions: {
    id: string
    versionNumber: number
    prompt: string
    createdAt: string
  }[]
}

export function SavedMutationsSidebar() {
  const [savedMutations, setSavedMutations] = useState<SavedMutation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedMutations()
  }, [])

  const fetchSavedMutations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/saved-mutations")

      if (response.ok) {
        const data = await response.json()
        setSavedMutations(data.savedMutations || [])
      } else {
        console.error("Failed to fetch saved mutations:", await response.text())
        toast({
          title: "Error",
          description: "Failed to load saved mutations. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch saved mutations:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading mutations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStarMutation = async (id: string, starred: boolean) => {
    try {
      const response = await fetch(`/api/saved-mutations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !starred }),
      })

      if (response.ok) {
        setSavedMutations(prev => 
          prev.map(mutation => 
            mutation.id === id ? { ...mutation, starred: !starred } : mutation
          )
        )
      } else {
        console.error("Failed to update mutation:", await response.text())
        toast({
          title: "Error",
          description: "Failed to star/unstar the mutation. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update mutation:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMutationClick = (id: string) => {
    router.push(`/mutations/${id}`)
  }

  const filteredMutations = savedMutations.filter(mutation => {
    // parse tags if they're in string format
    let tags: string[] = [];
    
    try {
      if (mutation.tags) {
        if (typeof mutation.tags === 'string') {
          // try to parse as JSON
          const parsedTags = JSON.parse(mutation.tags);
          tags = Array.isArray(parsedTags) ? parsedTags : [];
        } else if (Array.isArray(mutation.tags)) {
          tags = mutation.tags;
        }
      }
    } catch (error) {
      console.error("Error parsing tags:", error);
      tags = [];
    }
    
    return (
      mutation.name.toLowerCase().includes(search.toLowerCase()) ||
      (mutation.description && mutation.description.toLowerCase().includes(search.toLowerCase())) ||
      (tags.length > 0 && tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())))
    );
  })

  return (
    <div className="h-screen flex flex-col border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium">Saved Mutations</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-md"
            onClick={() => router.push("/playground")}
            title="Go to Playground to create mutations"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mutations..."
            className="w-full pl-8 h-8 text-xs bg-muted/50 border border-muted focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Loading mutations...</span>
          </div>
        ) : filteredMutations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <PenSquare className="h-6 w-6 text-muted-foreground/50" />
            </div>
            
            {search ? (
              <>
                <h3 className="text-sm font-medium mb-1">No matching mutations</h3>
                <p className="text-xs">Try adjusting your search query.</p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-medium mb-1">No saved mutations yet</h3>
                <p className="text-xs mb-3">Save mutations from the validation panel for future use.</p>
                <Button 
                  variant="outline" 
                  className="rounded-lg text-xs h-8"
                  onClick={() => router.push("/mutations/new")}
                >
                  <PenSquare className="h-3.5 w-3.5 mr-1.5" />
                  Create Manually
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMutations.map((mutation) => (
              <div
                key={mutation.id}
                className={`p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                  selectedMutation === mutation.id ? "bg-muted/50" : ""
                }`}
                onClick={() => handleMutationClick(mutation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-sm font-medium truncate">{mutation.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(mutation.updatedAt).toLocaleDateString()}
                      </span>
                      {mutation.versions.length > 1 && (
                        <Badge variant="outline" className="text-[10px] px-1 h-4 bg-muted/30">
                          {mutation.versions.length} versions
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md ml-1 -mt-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStarMutation(mutation.id, mutation.starred)
                    }}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        mutation.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>
                {(() => {
                  try {
                    let tags: string[] = [];
                    if (mutation.tags) {
                      if (typeof mutation.tags === 'string') {
                        const parsedTags = JSON.parse(mutation.tags);
                        tags = Array.isArray(parsedTags) ? parsedTags : [];
                      } else if (Array.isArray(mutation.tags)) {
                        tags = mutation.tags;
                      }
                    }
                    
                    // only render if we have tags
                    if (tags.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags
                            .filter(Boolean)
                            .map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] px-1 h-4 bg-muted/30"
                              >
                                {tag}
                              </Badge>
                            ))
                          }
                        </div>
                      );
                    }
                  } catch (error) {
                    console.error("Error rendering tags:", error);
                  }
                  
                  // return null if no tags or error
                  return null;
                })()}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}