"use client"
import { generateDiff } from "@/lib/utils-diff"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Diff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface DiffViewProps {
  originalText: string
  mutatedText: string
  isOpen: boolean
  onClose: () => void
}

export function DiffView({ originalText, mutatedText, isOpen, onClose }: DiffViewProps) {
  const diff = generateDiff(originalText, mutatedText)
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedMutated, setCopiedMutated] = useState(false)
  const { toast } = useToast()

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalText)
    setCopiedOriginal(true)
    setTimeout(() => setCopiedOriginal(false), 2000)
    toast({
      title: "Copied original prompt",
      description: "The original prompt has been copied to clipboard",
    })
  }

  const handleCopyMutated = () => {
    navigator.clipboard.writeText(mutatedText)
    setCopiedMutated(true)
    setTimeout(() => setCopiedMutated(false), 2000)
    toast({
      title: "Copied mutated prompt",
      description: "The mutated prompt has been copied to clipboard",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-xl">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center text-base font-medium">
            <Diff className="h-4 w-4 mr-2 text-primary" />
            Prompt Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">Original Prompt</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopyOriginal} 
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                {copiedOriginal ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
              {originalText}
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">Mutated Prompt</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopyMutated} 
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              >
                {copiedMutated ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto">
              {mutatedText}
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3 border-t">
          <h3 className="text-xs font-medium text-muted-foreground">Diff View</h3>
          <div className="rounded-md bg-muted/20 p-3 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
            {diff.map((part, index) => (
              <span
                key={index}
                className={
                  part.added
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : part.removed
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 line-through opacity-70"
                      : "text-muted-foreground"
                }
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}