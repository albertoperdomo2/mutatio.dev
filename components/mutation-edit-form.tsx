"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Loader2, Star, Save, ArrowLeft } from "lucide-react"

interface MutationVersion {
  id: string
  versionNumber: number
  prompt: string
  notes: string
}

interface MutationEditFormProps {
  mutation: {
    id: string
    name: string
    description: string
    originalPrompt: string
    tags: string[]
    starred: boolean
    currentVersion: MutationVersion | null
  }
}

export function MutationEditForm({ mutation }: MutationEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formState, setFormState] = useState({
    name: mutation.name,
    description: mutation.description,
    starred: mutation.starred,
    tags: mutation.tags.join(", "),
    promptText: mutation.currentVersion?.prompt || "",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }))
  }
  
  const handleCancel = () => {
    router.push(`/mutations/${mutation.id}`)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const tags = formState.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
      
      const promptChanged = formState.promptText !== (mutation.currentVersion?.prompt || "")
      
      const mutationResponse = await fetch(`/api/saved-mutations/${mutation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          description: formState.description,
          starred: formState.starred,
          tags
        }),
      })
      
      if (!mutationResponse.ok) {
        const errorData = await mutationResponse.json()
        throw new Error(errorData.error || "Failed to update mutation")
      }
      
      // if the prompt has changed, update it with a new version
      if (promptChanged) {
        const versionResponse = await fetch(`/api/saved-mutations/${mutation.id}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: formState.promptText,
            notes: "Updated prompt text",
          }),
        })
        
        if (!versionResponse.ok) {
          const errorData = await versionResponse.json()
          throw new Error(errorData.error || "Failed to update prompt text")
        }
      }
      
      toast({
        title: "Mutation Updated",
        description: "Your changes have been saved successfully",
      })
      
      router.push(`/mutations/${mutation.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update mutation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Mutation Details</CardTitle>
            <CardDescription>
              Update the name, description, and other information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                required
                className="bg-muted/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                className="min-h-[100px] bg-muted/20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleInputChange}
                className="bg-muted/20"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="starred"
                checked={formState.starred}
                onCheckedChange={(checked) => handleSwitchChange("starred", checked)}
              />
              <Label htmlFor="starred" className="flex items-center gap-2 cursor-pointer">
                Star this mutation
                <Star className={`h-4 w-4 ${formState.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              </Label>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Prompt Text</CardTitle>
            <CardDescription>
              Edit the mutation text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mutation.currentVersion && (
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <span>Version: {mutation.currentVersion.versionNumber}</span>
                  <span className="mx-2">•</span>
                  <span>Editing this will create a new version automatically</span>
                </div>
              )}
              
              <Textarea
                id="promptText"
                name="promptText"
                value={formState.promptText}
                onChange={handleInputChange}
                className="min-h-[300px] bg-muted/20 font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}