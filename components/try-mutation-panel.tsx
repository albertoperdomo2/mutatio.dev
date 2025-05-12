"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles, PlayCircle, Clock, Check, X } from "lucide-react"
import MarkdownRenderer from "./markdown-renderer"

interface TryMutationPanelProps {
  mutationId: string
  prompt: string
  versionId?: string
}

interface ApiResponse {
  id: string
  response: string
  metadata: {
    latency: number
    success: boolean
    timestamp: string
    error?: string
  }
}

interface ModelConfig {
  value: string
  label: string
  provider: string
  role: string
  group?: string
}

export function TryMutationPanel({ mutationId, prompt, versionId }: TryMutationPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [responseHistory, setResponseHistory] = useState<ApiResponse[]>([])
  const [customModels, setCustomModels] = useState<ModelConfig[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const { toast } = useToast()

  // fetch custom model configurations on component mount
  useEffect(() => {
    fetchCustomModels()
    fetchResponseHistory()
  }, [mutationId])

  const fetchCustomModels = async () => {
    try {
      setIsLoadingModels(true)
      const response = await fetch("/api/user/model-config")

      if (response.ok) {
        const data = await response.json()
        
        const models: ModelConfig[] = []

        if (data.modelConfigs) {
          Object.entries(data.modelConfigs).forEach(([provider, providerModels]: [string, any]) => {
            Object.entries(providerModels).forEach(([modelId, modelConfig]: [string, any]) => {
              models.push({
                value: modelId,
                label: modelConfig.displayName,
                provider: provider.toLowerCase(),
                role: modelConfig.role,
              })
            })
          })
        }

        setCustomModels(models)
        
        if (models.length > 0) {
          setSelectedModel(models[0].value)
          setSelectedProvider(models[0].provider)
        }
      } else {
        console.error("Failed to fetch custom models:", await response.text())
      }
    } catch (error) {
      console.error("Failed to fetch custom models:", error)
    } finally {
      setIsLoadingModels(false)
    }
  }

  const fetchResponseHistory = async () => {
    try {
      const response = await fetch(`/api/saved-mutations/${mutationId}`)
      
      if (response.ok) {
        const data = await response.json()
        const responses = data.savedMutation.responses || []
        
        const formattedResponses = responses.map((resp: any) => ({
          id: resp.id,
          response: resp.response,
          metadata: JSON.parse(resp.metadata)
        }))
        
        setResponseHistory(formattedResponses)
      }
    } catch (error) {
      console.error("Failed to fetch response history:", error)
    }
  }

  const handleModelChange = (value: string) => {
    const selectedModel = customModels.find((model) => model.value === value)
    if (selectedModel) {
      setSelectedModel(value)
      setSelectedProvider(selectedModel.provider)
    }
  }

  const handleTryMutation = async () => {
    if (!selectedModel || !selectedProvider) {
      toast({
        title: "Error",
        description: "Please select a model",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResponse(null)

    try {
      // get API key from localStorage based on the selected model's provider
      let apiKey = null
      const endpoint = null
      
      const model = customModels.find(m => m.value === selectedModel)
      
      if (model && typeof window !== 'undefined') {
        const { getApiKey } = await import('@/lib/local-storage')
        apiKey = getApiKey(model.provider, 'both')
        
        if (!apiKey) {
          throw new Error(`No API key found for provider: ${model.provider}`)
        }
      }

      console.log(`Trying mutation with provider: ${selectedProvider}, model: ${selectedModel}`)
      
      const response = await fetch(`/api/saved-mutations/${mutationId}/try`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          versionId,
          modelId: selectedModel,
          provider: selectedProvider,
          apiKey,
          endpoint
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to try mutation")
      }

      const data = await response.json()
      setResponse(data)
      
      setResponseHistory(prev => [data, ...prev])

      toast({
        title: "Success",
        description: "Successfully ran the mutation",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderLabel = (provider: string) => {
    const providerMap: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      google: "Google",
      mistral: "MistralAI",
      deepseek: "DeepSeek",
    }
    return providerMap[provider.toLowerCase()] || provider
  }

  return (
    <Card className="rounded-xl border shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Try Mutation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="try" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="try">Try</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="try" className="space-y-4">
            <div className="bg-muted/20 p-3 rounded-md text-sm font-mono mb-4">
              <MarkdownRenderer content={prompt} />
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Select Model</label>
                <Select value={selectedModel} onValueChange={handleModelChange} disabled={isLoadingModels || isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {customModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label} ({getProviderLabel(model.provider)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading || !selectedModel || !selectedProvider}
                onClick={handleTryMutation}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Try with Selected Model
                  </>
                )}
              </Button>
            </div>
            
            {response && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Response</h3>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {response.metadata.latency ? `${(response.metadata.latency / 1000).toFixed(2)}s` : 'N/A'}
                    </Badge>
                    <Badge variant={response.metadata.success ? "default" : "destructive"} className="text-xs">
                      {response.metadata.success ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      {response.metadata.success ? "Success" : "Error"}
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted/20 p-3 rounded-md text-sm whitespace-pre-line">
                  <MarkdownRenderer content={response.response} />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {responseHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                <p>WIP - No response history yet</p>
                <p className="text-sm mt-1">Try the mutation with a model to see responses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {responseHistory.map((resp) => (
                  <div key={resp.id} className="bg-muted/20 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(resp.metadata.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {resp.metadata.latency ? `${(resp.metadata.latency / 1000).toFixed(2)}s` : 'N/A'}
                        </Badge>
                        <Badge variant={resp.metadata.success ? "default" : "destructive"} className="text-xs">
                          {resp.metadata.success ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          {resp.metadata.success ? "Success" : "Error"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {resp.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}