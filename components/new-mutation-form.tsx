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
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Loader2, Star, Save, ArrowLeft } from "lucide-react"

export function NewMutationForm() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    originalPrompt: "",
    mutatedPrompt: "",
    tags: "",
    starred: false,
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
    router.push("/mutations")
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.name || !formState.originalPrompt || !formState.mutatedPrompt) {
      toast({
        title: "Validation Error",
        description: "Name, original prompt, and mutated prompt are required.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const tags = formState.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
      
      const response = await fetch("/api/saved-mutations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          description: formState.description,
          originalPrompt: formState.originalPrompt,
          prompt: formState.mutatedPrompt,
          tags,
          starred: formState.starred,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create mutation")
      }
      
      const data = await response.json()
      
      toast({
        title: "Mutation Created",
        description: "Your new mutation has been created successfully",
      })
      
      router.push(`/mutations/${data.savedMutation.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create mutation",
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
          <CardHeader>
            <CardTitle>Create New Mutation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                required
                placeholder="Enter a descriptive name"
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
                placeholder="Describe the purpose of this mutation"
                className="min-h-[80px] bg-muted/20"
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="originalPrompt">Original Prompt *</Label>
                <Textarea
                  id="originalPrompt"
                  name="originalPrompt"
                  value={formState.originalPrompt}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the original prompt"
                  className="min-h-[200px] bg-muted/20 font-mono text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mutatedPrompt">Mutated Prompt *</Label>
                <Textarea
                  id="mutatedPrompt"
                  name="mutatedPrompt"
                  value={formState.mutatedPrompt}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter the mutated prompt"
                  className="min-h-[200px] bg-muted/20 font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={handleInputChange}
                placeholder="e.g., creative, scientific, marketing"
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
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Mutation
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}