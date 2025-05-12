"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { DollarSign, Copy, Check, Diff, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getMutationTypeColor } from "@/lib/utils-diff"
import { DiffView } from "@/components/diff-view"
import MarkdownRenderer from "@/components/markdown-renderer"

interface Mutation {
  id: string
  text: string
  type: string
  strength: number
  tokens: number
  cost: number
}

interface PromptMutationCardProps {
  mutation: Mutation
  isSelected: boolean
  onToggleSelect: () => void
  originalPrompt: string
}

export function PromptMutationCard({ mutation, isSelected, onToggleSelect, originalPrompt }: PromptMutationCardProps) {
  const [copied, setCopied] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(mutation.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Copied to clipboard",
      description: "The mutated prompt has been copied to your clipboard.",
    })
  }

  const handleShowDiff = () => {
    setShowDiff(true)
  }

  // get dynamic color classes for this mutation type
  const colorClasses = getMutationTypeColor(mutation.type.toLowerCase())

  return (
    <Card
      className={`rounded-lg border ${isSelected ? "border-primary/50 bg-primary/[0.03]" : "border-border bg-transparent"} transition-all duration-200 hover:shadow-sm`}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-shrink-0 pt-0.5 sm:pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              id={`mutation-${mutation.id}`}
              className="h-4 w-4 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
          </div>
          
          <div className="flex-1 space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge className={`font-medium text-[10px] sm:text-xs rounded-md px-1.5 sm:px-2 py-0.5 ${colorClasses}`}>
                  {mutation.type.charAt(0).toUpperCase() + mutation.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-normal bg-background py-0.5">
                  Strength: {mutation.strength}
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs font-normal bg-background py-0.5">
                  Token count: {mutation.tokens}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleShowDiff} 
                  className="h-8 w-8 sm:h-7 sm:w-7 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <Diff className="h-3.5 w-3.5" />
                  <span className="sr-only">Compare</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopy} 
                  className="h-8 w-8 sm:h-7 sm:w-7 rounded-md text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>
            
            <div className="rounded-md bg-muted/30 p-2 sm:p-3 text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed overflow-x-auto">
              <MarkdownRenderer content={mutation.text} />
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowDiff}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground h-8 sm:h-7 gap-1 px-2.5 sm:px-2 py-1.5"
              >
                Compare with original
                <ArrowUpRight className="h-3 w-3" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Estimated cost for the mutation: ${mutation.cost}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
      
      <DiffView
        originalText={originalPrompt}
        mutatedText={mutation.text}
        isOpen={showDiff}
        onClose={() => setShowDiff(false)}
      />
    </Card>
  )
}