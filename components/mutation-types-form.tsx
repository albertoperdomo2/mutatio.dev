"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Loader2, Edit, Check, RefreshCw, Database } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MutationTypesForm() {
  interface MutationType {
    id: string
    name: string
    description?: string
    systemPrompt: string
    isDefault?: boolean
  }
  
  interface MutationTypeFormState {
    id: string
    name: string
    description: string
    systemPrompt: string
  }

  const [mutationTypes, setMutationTypes] = useState<MutationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingType, setIsAddingType] = useState(false)
  const [isEditingType, setIsEditingType] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // form state for adding/editing a mutation type
  const [formState, setFormState] = useState<MutationTypeFormState>({
    id: "",
    name: "",
    description: "",
    systemPrompt: "",
  })

  const { toast } = useToast()

  // fetch mutation types on component mount
  useEffect(() => {
    fetchMutationTypes()
  }, [])

  const fetchMutationTypes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mutation-types")

      if (response.ok) {
        const data = await response.json()
        setMutationTypes(data.mutationTypes || [])
      } else {
        console.error("Failed to fetch mutation types:", await response.text())
      }
    } catch (error) {
      console.error("Failed to fetch mutation types:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddType = () => {
    setFormState({
      id: "",
      name: "",
      description: "",
      systemPrompt: "",
    })
    setIsAddingType(true)
    setIsEditingType(false)
  }

  const handleEditType = (type: MutationType) => {
    setFormState({
      id: type.id,
      name: type.name,
      description: type.description || "",
      systemPrompt: type.systemPrompt,
    })
    setIsAddingType(false)
    setIsEditingType(true)
  }

  const handleDeleteType = async (id: string) => {
    try {
      const response = await fetch(`/api/mutation-types/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // update local state
        setMutationTypes((prev) => prev.filter((type) => type.id !== id))

        toast({
          title: "Mutation type deleted",
          description: "The mutation type has been deleted successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete mutation type")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete mutation type. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveType = async () => {
    if (!formState.name || !formState.systemPrompt) {
      toast({
        title: "Validation error",
        description: "Name and system prompt are required.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      let response
      if (isEditingType) {
        response = await fetch(`/api/mutation-types/${formState.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formState.name,
            description: formState.description,
            systemPrompt: formState.systemPrompt,
          }),
        })
      } else {
        response = await fetch("/api/mutation-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formState.name,
            description: formState.description,
            systemPrompt: formState.systemPrompt,
          }),
        })
      }

      if (response.ok) {
        await fetchMutationTypes()

        // reset form and close dialog
        setFormState({
          id: "",
          name: "",
          description: "",
          systemPrompt: "",
        })

        setIsAddingType(false)
        setIsEditingType(false)

        toast({
          title: "Mutation type saved",
          description: "The mutation type has been saved successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save mutation type")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save mutation type. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeedDefaults = async () => {
    try {
      setIsSeeding(true)
      const response = await fetch("/api/mutation-types/seed", {
        method: "POST",
      })

      if (response.ok) {
        await fetchMutationTypes()

        toast({
          title: "Default mutation types added",
          description: "The default mutation types have been added to your account.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to add default mutation types")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add default mutation types. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary/70" />
            </div>
            <div className="h-2 w-32 bg-primary/10 rounded-full"></div>
          </div>
          <p className="text-muted-foreground text-sm mt-4">Loading mutation types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary/90">Configuration</h2>
        <div className="flex gap-2">
          {mutationTypes.length > 0 && (
          <Button onClick={handleAddType} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 px-3 text-sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Type
          </Button>
          )}
        </div>
      </div>

      {mutationTypes.length === 0 ? (
        <Card className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-background via-background/80 to-muted/30 shadow-md">
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 bg-primary/5 rounded-full">
                <Database className="h-10 w-10 text-primary/80" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">No Mutation Types</h2>
              <p className="mb-8 max-w-md text-muted-foreground">You haven't configured any mutation types yet.</p>
              <div className="flex gap-2">
                <Button onClick={handleSeedDefaults} disabled={isSeeding} variant="outline" className="rounded-lg">
                  {isSeeding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding defaults...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Add Default Types
                    </>
                  )}
                </Button>
                <Button onClick={handleAddType} className="rounded-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Custom Type
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mutationTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{type.name}</CardTitle>
                  {type.isDefault && <Badge className="bg-blue-500/10 text-blue-500 border-blue-200/20">Default</Badge>}
                </div>
                {type.description && <CardDescription>{type.description}</CardDescription>}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">System Prompt Template:</Label>
                  <div className="rounded-md bg-muted/50 p-2 text-xs font-mono">{type.systemPrompt}</div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-0">
                <Button variant="ghost" size="sm" onClick={() => handleEditType(type)} className="h-8 px-2.5 text-xs rounded-lg">
                  <Edit className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteType(type.id)}
                  className="h-8 px-2.5 text-xs text-destructive hover:text-destructive rounded-lg"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Mutation Type Dialog */}
      <Dialog
        open={isAddingType || isEditingType}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingType(false)
            setIsEditingType(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{isEditingType ? "Edit Mutation Type" : "Add New Mutation Type"}</DialogTitle>
            <DialogDescription>
              {isEditingType
                ? "Update your custom mutation type."
                : "Configure a custom mutation type for prompt mutations."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="e.g., Paraphrase, Simplify, etc."
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Input
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                placeholder="Brief description of what this mutation type does"
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt" className="text-sm font-medium">
                System Prompt Template
              </Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formState.systemPrompt}
                onChange={handleInputChange}
                placeholder="System prompt template with {{strength}} placeholder"
                className="min-h-32 resize-y border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Use &#123;&#123;strength&#125;&#125; as a placeholder for the mutation strength (will be replaced with
                "subtle", "moderate", or "significant").
              </p>
            </div>

            <Alert className="bg-amber-500/10 text-amber-600 border-amber-200/20">
              <AlertTitle>Template Format</AlertTitle>
              <AlertDescription>
                Example: "You are a prompt engineer specializing in paraphrasing. Create a
                &#123;&#123;strength&#125;&#125; paraphrase of the user's prompt that preserves the original meaning but
                uses different wording."
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingType(false)
                setIsEditingType(false)
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveType}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {isEditingType ? "Update Type" : "Add Type"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}