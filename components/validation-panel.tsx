"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getMutationTypeColor, getScoreColor } from "@/lib/utils-diff"
import { 
  Medal, 
  Trophy, 
  Check, 
  Save, 
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Validation {
  mutationId: string
  evaluation: string
}

interface Mutation {
  id: string
  text: string
  type: string
  strength: number
}

interface ValidationPanelProps {
  validations: Validation[]
  mutations: Mutation[]
  selectedMutations: string[]
  originalPrompt: string
}

export function ValidationPanel({ validations, mutations, selectedMutations, originalPrompt }: ValidationPanelProps) {
  const [isSavingMutation, setIsSavingMutation] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [selectedMutationToSave, setSelectedMutationToSave] = useState<any | null>(null)
  const [mutationSaveDetails, setMutationSaveDetails] = useState({
    name: '',
    description: '',
  })
  
  const { toast } = useToast()

  // map validations to mutations
  const validationMap = validations.reduce<Record<string, string>>((acc, validation) => {
    acc[validation.mutationId] = validation.evaluation
    return acc
  }, {})

  // extract scores from validations
  const extractScore = (evaluation: string | undefined): number | null => {
    if (!evaluation) {
      return null;
    }
    
    try {
      const cleanedEvaluation = evaluation.replace(/```json|```|json/gi, '').trim();
      
      const evaluationObject = JSON.parse(cleanedEvaluation);
      
      if (typeof evaluationObject.overallScore === 'number') {
        return evaluationObject.overallScore;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to parse evaluation JSON:", error);
      return null;
    }
  }

  const sortedMutations = [...selectedMutations]
    .map((id) => {
      const mutation = mutations.find((m) => m.id === id)
      const evaluation = validationMap[id]
      const score = evaluation ? extractScore(evaluation) : 0
      return { ...mutation, evaluation, score }
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  const hasScores = sortedMutations.some(m => m.score)
  const topPerformers = sortedMutations.filter(m => (m.score || 0) >= 8)
  
  const handleSaveMutation = (mutation: any) => {
    setSelectedMutationToSave(mutation)
    setMutationSaveDetails({
      name: `${mutation.type ? (typeof mutation.type === 'string' ? mutation.type.charAt(0).toUpperCase() + mutation.type.slice(1) : String(mutation.type)) : 'Unknown'} Mutation ${new Date().toISOString().split('T')[0]}`,
      description: mutation.evaluation ? `Score: ${mutation.score || 'N/A'}/10\n\n${mutation.evaluation.substring(0, 200)}${mutation.evaluation.length > 200 ? '...' : ''}` : '',
    })
    setShowSaveDialog(true)
  }
  
  const saveSelectedMutation = async () => {
    if (!selectedMutationToSave || !mutationSaveDetails.name) {
      toast({
        title: "Validation error",
        description: "Please provide a name for this mutation",
        variant: "destructive",
      })
      return
    }

    setIsSavingMutation(true)

    try {
      const response = await fetch("/api/saved-mutations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mutationSaveDetails.name,
          description: mutationSaveDetails.description,
          originalPrompt: originalPrompt,
          prompt: selectedMutationToSave.text,
          tags: [selectedMutationToSave.type],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save mutation")
      }

      toast({
        title: "Mutation saved",
        description: "The mutation has been saved to your library.",
      })

      setShowSaveDialog(false)
      setSelectedMutationToSave(null)
      setMutationSaveDetails({ name: '', description: '' })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save mutation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingMutation(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1 space-y-6">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5 border-b">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Original Prompt
                </h3>
              </div>
              <div className="p-4 text-sm font-mono text-muted-foreground overflow-x-auto">
                {originalPrompt}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm">Validation Summary</h3>
                <Badge variant="outline">
                  {validations.length} mutations
                </Badge>
              </div>

              <div className="space-y-4">
                {hasScores && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Average Score
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ 
                            width: `${Math.floor(sortedMutations.reduce((acc, m) => acc + (m.score || 0), 0) / sortedMutations.length * 10)}%` 
                          }}
                        />
                      </div>
                      <div className="text-sm font-medium">
                        {(sortedMutations.reduce((acc, m) => acc + (m.score || 0), 0) / sortedMutations.length).toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                )}

                {topPerformers.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Top Performer{topPerformers.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-2">
                      {topPerformers.slice(0, 2).map((mutation, idx) => (
                        <div key={mutation.id} className="flex items-center gap-3 bg-muted/20 rounded-lg p-2.5">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 flex-shrink-0">
                            {idx === 0 ? (
                              <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <Medal className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <Badge className={`font-medium text-xs rounded-md px-2 ${getMutationTypeColor(mutation.type ? (typeof mutation.type === 'string' ? mutation.type.toLowerCase() : 'default') : 'default')}`}>
                                {mutation.type ? (typeof mutation.type === 'string' ? mutation.type.charAt(0).toUpperCase() + mutation.type.slice(1) : String(mutation.type)) : 'Unknown'}
                              </Badge>
                              <Badge className={`${getScoreColor(mutation.score || 0)}`}>
                                {mutation.score}/10
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Performance by Type
                  </div>
                  <div className="space-y-2">
                    {Object.entries(
                      sortedMutations.reduce<Record<string, { count: number; totalScore: number }>>((acc, mutation) => {
                        const type = mutation.type ? (typeof mutation.type === 'string' ? mutation.type.toLowerCase() : 'unknown') : 'unknown';
                        if (!acc[type]) {
                          acc[type] = { count: 0, totalScore: 0 };
                        }
                        acc[type].count += 1;
                        acc[type].totalScore += mutation.score || 0;
                        return acc;
                      }, {})
                    ).map(([type, { count, totalScore }]) => (
                      <div key={type} className="flex items-center gap-2">
                        <Badge className={`font-medium text-xs rounded-md px-2 ${getMutationTypeColor(type)}`}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Avg: {(totalScore / count).toFixed(1)}/10
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="ranked" className="w-full">
                <div className="border-b">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Results</h3>
                    <TabsList className="h-8 p-0.5 bg-muted/50 border">
                      <TabsTrigger value="ranked" className="text-xs px-3 h-7 rounded data-[state=active]:bg-background">
                        Ranked
                      </TabsTrigger>
                      <TabsTrigger value="detailed" className="text-xs px-3 h-7 rounded data-[state=active]:bg-background">
                        Detailed
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="ranked" className="p-0">
                  <div className="divide-y">
                    {sortedMutations.map((mutation, index) => (
                      <div key={mutation.id} className="p-4 hover:bg-muted/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/30 flex-shrink-0 mt-0.5">
                            {index === 0 && mutation.score && mutation.score >= 8 ? (
                              <Trophy className="h-4 w-4 text-amber-500" />
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <Badge className={`font-medium text-xs rounded-md px-2 ${getMutationTypeColor(mutation.type ? (typeof mutation.type === 'string' ? mutation.type.toLowerCase() : 'default') : 'default')}`}>
                                  {mutation.type ? (typeof mutation.type === 'string' ? mutation.type.charAt(0).toUpperCase() + mutation.type.slice(1) : String(mutation.type)) : 'Unknown'}
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal">
                                  Strength: {mutation.strength}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                {mutation.score && (
                                  <Badge className={`${getScoreColor(mutation.score)}`}>
                                    Score: {mutation.score}/10
                                  </Badge>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2 text-xs rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveMutation(mutation);
                                  }}
                                >
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                            
                            <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground overflow-x-auto">
                              {mutation.text}
                            </div>
                            
                            {mutation.score && mutation.score >= 8 && (
                              <div className="flex items-center gap-1.5 text-xs text-green-600">
                                <Check className="h-3.5 w-3.5" />
                                <span>Recommended</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="p-0">
                  <div className="divide-y">
                    {sortedMutations.map((mutation, index) => (
                      <div key={mutation.id} className="p-4 hover:bg-muted/5 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/30 flex-shrink-0">
                                {index === 0 && mutation.score && mutation.score >= 8 ? (
                                  <Trophy className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`font-medium text-xs rounded-md px-2 ${getMutationTypeColor(mutation.type ? (typeof mutation.type === 'string' ? mutation.type.toLowerCase() : 'default') : 'default')}`}>
                                  {mutation.type ? (typeof mutation.type === 'string' ? mutation.type.charAt(0).toUpperCase() + mutation.type.slice(1) : String(mutation.type)) : 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {mutation.score && (
                                <Badge className={`${getScoreColor(mutation.score)}`}>
                                  Score: {mutation.score}/10
                                </Badge>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-xs rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveMutation(mutation);
                                }}
                              >
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                              Mutated Prompt:
                            </h4>
                            <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground overflow-x-auto">
                              {mutation.text}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                              Evaluation:
                            </h4>
                            <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground whitespace-pre-line overflow-x-auto">
                              {(() => {
                                try {
                                  if (!mutation.evaluation) {
                                    return <div className="text-muted-foreground">No evaluation available</div>;
                                  }
                                  
                                  const cleanedEvaluation = mutation.evaluation.replace(/```json|```|json/gi, '').trim();
                                  const evaluationObj = JSON.parse(cleanedEvaluation);
                                  
                                  return (
                                    <div className="space-y-3">
                                      {Object.entries(evaluationObj).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-primary">{key}:</span>
                                            {typeof value === 'number' && (
                                              <span className="px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                                                {value.toFixed(1)}
                                              </span>
                                            )}
                                          </div>
                                          {typeof value === 'string' && (
                                            <span className="text-muted-foreground whitespace-pre-line pl-4 border-l-2 border-muted">
                                              {value}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } catch (error) {
                                  // show raw evaluation text or an empty state if there's an error
                                  return <div className="text-muted-foreground whitespace-pre-line">
                                    {mutation.evaluation || "No evaluation available"}
                                  </div>;
                                }
                              })()}
                            </div>
                          </div>
                          
                          {mutation.score && mutation.score >= 8 && (
                            <div className="flex items-center gap-1.5 text-xs text-green-600">
                              <Check className="h-3.5 w-3.5" />
                              <span>Recommended for use</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Mutation Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Save Mutation</DialogTitle>
            <DialogDescription>
              Save this mutation to your library for future use.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={mutationSaveDetails.name}
                onChange={(e) => setMutationSaveDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter a name for this mutation"
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={mutationSaveDetails.description}
                onChange={(e) => setMutationSaveDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this mutation (optional)"
                className="min-h-[100px] border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {selectedMutationToSave && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Mutation Preview
                </Label>
                <div className="rounded-md bg-muted/20 p-3 text-sm font-mono text-muted-foreground overflow-x-auto">
                  {selectedMutationToSave.text.substring(0, 200)}
                  {selectedMutationToSave.text.length > 200 && "..."}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSelectedMutation}
              disabled={isSavingMutation || !mutationSaveDetails.name}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
            >
              {isSavingMutation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Mutation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}