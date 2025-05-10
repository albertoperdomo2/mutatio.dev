"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Zap, 
  Sparkles,
  BarChart, 
  AlertCircle, 
  Info, 
  Check, 
  ChevronDown,
  Command,
} from "lucide-react"
import Link from "next/link"
import { PromptMutationCard } from "@/components/prompt-mutation-card"
import { ValidationPanel } from "@/components/validation-panel"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const DEFAULT_MODELS: Model[] = []
const providerDisplayNames: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  mistral: "MistralAI",
  custom: "Custom",
};

interface Model {
  value: string;
  provider: string;
  [key: string]: any;
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface Mutation {
  id: string;
  text: string;
  type: string;
  strength: number;
  tokens: number;
  cost: number;
}

interface MutationType {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  isDefault?: boolean;
}

interface Model {
  value: string;
  label: string;
  provider: string;
  role: string;
  group?: string;
}

interface Validation {
  mutationId: string;
  evaluation: string;
}

interface PlaygroundProps {
  user: User;
}

export function Playground({ user }: PlaygroundProps) {
  const [prompt, setPrompt] = useState("")
  const [mutationTypeIds, setMutationTypeIds] = useState<string[]>([])
  const [mutationTypes, setMutationTypes] = useState<MutationType[]>([])
  const [mutationStrength, setMutationStrength] = useState(5)
  const [numMutations, setNumMutations] = useState(3)
  const [maxTokens, setMaxTokens] = useState(500)
  const [mutatorModel, setMutatorModel] = useState("")
  const [mutatorProvider, setMutatorProvider] = useState("")
  const [validatorModel, setValidatorModel] = useState("")
  const [validatorProvider, setValidatorProvider] = useState("")
  const [mutations, setMutations] = useState<Mutation[]>([])
  const [selectedMutations, setSelectedMutations] = useState<string[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [activeTab, setActiveTab] = useState("mutate")
  const [hasApiKeys, setHasApiKeys] = useState(false)
  const [isCheckingApiKeys, setIsCheckingApiKeys] = useState(true)
  const [customModels, setCustomModels] = useState<Model[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isLoadingMutationTypes, setIsLoadingMutationTypes] = useState(true)
  const [sessionSaved, setSessionSaved] = useState(false)
  const [isTypesDropdownOpen, setIsTypesDropdownOpen] = useState(false)
  
  const { toast } = useToast()

  // close the mutation types dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#mutation-type') && !target.closest('.mutation-type-dropdown')) {
        setIsTypesDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    // check if user has API keys configured
    const checkApiKeys = async () => {
      try {
        setIsCheckingApiKeys(true)
        
        // import the hasRequiredApiKeys function only on client-side
        if (typeof window !== 'undefined') {
          const { hasRequiredApiKeys } = await import('@/lib/local-storage');
          setHasApiKeys(hasRequiredApiKeys());
        } else {
          // fallback to API endpoint for SSR
          // XXX: This was removed in the API refactor :/
          const response = await fetch("/api/user/check-api-keys")
          if (response.ok) {
            const data = await response.json()
            setHasApiKeys(data.hasKeys)
          }
        }
      } catch (error) {
        console.log("Failed to check API keys:", error)
      } finally {
        setIsCheckingApiKeys(false)
      }
    }

    const fetchCustomModels = async () => {
      try {
        setIsLoadingModels(true)
        const response = await fetch("/api/user/model-config")

        if (response.ok) {
          const data = await response.json()

          const models: Model[] = []

          if (data.modelConfigs) {
            Object.entries(data.modelConfigs).forEach(([provider, providerModels]: [string, any]) => {
              Object.entries(providerModels).forEach(([modelId, modelConfig]: [string, any]) => {
                // only add models that can be used for the appropriate role
                const normalizedProvider = provider.toLowerCase();
                
                if (modelConfig.role === "mutator" || modelConfig.role === "both") {
                  models.push({
                    value: modelId,
                    label: modelConfig.displayName,
                    provider: normalizedProvider,
                    role: "mutator",
                  })
                }

                if (modelConfig.role === "validator" || modelConfig.role === "both") {
                  models.push({
                    value: modelId,
                    label: modelConfig.displayName,
                    provider: normalizedProvider,
                    role: "validator",
                  })
                }
              })
            })
          }

          setCustomModels(models)
        } else {
          console.error("Failed to fetch custom models:", await response.text())
        }
      } catch (error) {
        console.error("Failed to fetch custom models:", error)
      } finally {
        setIsLoadingModels(false)
      }
    }

    const fetchMutationTypes = async () => {
      try {
        setIsLoadingMutationTypes(true)
        const response = await fetch("/api/mutation-types")

        if (response.ok) {
          const data = await response.json()
          
          if (data.mutationTypes && Array.isArray(data.mutationTypes)) {
            setMutationTypes(data.mutationTypes)

            if (data.mutationTypes.length > 0) {
              setMutationTypeIds([data.mutationTypes[0].id])
            } else {
              // if no mutation types exist, seed the defaults silently
              await seedDefaultMutationTypes(false)
            }
          } else {
            console.error("Unexpected response format:", data)
            await seedDefaultMutationTypes(false)
          }
        } else {
          const errorText = await response.text()
          console.error("Failed to fetch mutation types:", errorText)
          
          await seedDefaultMutationTypes(false)
        }
      } catch (error) {
        console.error("Failed to fetch mutation types:", error)
        
        await seedDefaultMutationTypes(false)
      } finally {
        setIsLoadingMutationTypes(false)
      }
    }

    checkApiKeys()
    fetchCustomModels()
    fetchMutationTypes()
  }, [])

  useEffect(() => {
    // check if there is a session to restore from localStorage
    const restoredSession = localStorage.getItem("playground_restore")

    if (restoredSession) {
      try {
        const sessionData = JSON.parse(restoredSession)

        // check if the session is recent (less than 1 hour old)
        if (Date.now() - sessionData.timestamp < 60 * 60 * 1000) {
          setPrompt(sessionData.prompt)
          setMutations(sessionData.mutations.map((m: any, i: number) => ({ ...m, id: i.toString() })))

          if (sessionData.settings) {
            if (sessionData.settings.mutationTypeId) {
              setMutationTypeIds(Array.isArray(sessionData.settings.mutationTypeId) 
                ? sessionData.settings.mutationTypeId 
                : [sessionData.settings.mutationTypeId])
            }
            if (sessionData.settings.mutationStrength) {
              setMutationStrength(sessionData.settings.mutationStrength)
            }
            if (sessionData.settings.numMutations) {
              setNumMutations(sessionData.settings.numMutations)
            }
            if (sessionData.settings.maxTokens) {
              setMaxTokens(sessionData.settings.maxTokens)
            }
            if (sessionData.settings.modelId) {
              setMutatorModel(sessionData.settings.modelId)
            }
            if (sessionData.settings.provider) {
              setMutatorProvider(sessionData.settings.provider)
            }
            if (sessionData.settings.validatorModelId) {
              setValidatorModel(sessionData.settings.validatorModelId)
            }
            if (sessionData.settings.validatorProvider) {
              setValidatorProvider(sessionData.settings.validatorProvider)
            }

            if (sessionData.settings.validations) {
              setValidations(sessionData.settings.validations)
            }

            if (sessionData.settings.selectedMutations) {
              setSelectedMutations(sessionData.settings.selectedMutations)
            }
          }

          toast({
            title: "Session restored",
            description: "Session data has been restored from history",
          })
        }

        localStorage.removeItem("playground_restore")
      } catch (error) {
        console.error("Failed to restore session:", error)
      }
    }
  }, [toast])

  const seedDefaultMutationTypes = async (showToast = true) => {
    try {
      const response = await fetch("/api/mutation-types/seed", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.mutationTypes && Array.isArray(data.mutationTypes)) {
          setMutationTypes(data.mutationTypes)

          if (data.mutationTypes.length > 0) {
            setMutationTypeIds([data.mutationTypes[0].id])
            
            if (showToast) {
              toast({
                title: "Default mutation types loaded",
                description: "Default mutation types have been added to your account.",
              })
            }
          }
        } else {
          console.error("Unexpected response format when seeding mutation types:", data)
          if (showToast) {
            toast({
              title: "Error",
              description: "Failed to load mutation types. Please try refreshing the page.",
              variant: "destructive",
            })
          }
        }
      } else {
        const errorJson = await response.json();
        
        if (errorJson.mutationTypes && Array.isArray(errorJson.mutationTypes)) {
          // this is not an error - types already exist
          setMutationTypes(errorJson.mutationTypes);
          
          if (errorJson.mutationTypes.length > 0) {
            setMutationTypeIds([errorJson.mutationTypes[0].id]);
          }
        } else {
          console.error("Failed to seed default mutation types:", errorJson)
          if (showToast) {
            toast({
              title: "Error",
              description: "Failed to create default mutation types. Please try refreshing the page.",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to seed default mutation types:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try refreshing the page.",
          variant: "destructive",
        })
      }
    }
  }

  // get all available mutator models
  const getMutatorModels = () => {
    const customMutatorModels = customModels
      .filter((model) => model.role === "mutator" || model.role === "both")
      .map((model) => ({
        ...model,
        // ensure provider is always lowercase for consistency
        provider: model.provider.toLowerCase(),
        group: `Custom ${providerDisplayNames[model.provider.toLowerCase()] || model.provider}`,
      }))

    return [...customMutatorModels]
  }

  // get all available validator models
  const getValidatorModels = () => {
    const customValidatorModels = customModels
      .filter((model) => model.role === "validator" || model.role === "both")
      .map((model) => ({
        ...model,
        // ensure provider is always lowercase for consistency
        provider: model.provider.toLowerCase(),
        group: `Custom ${providerDisplayNames[model.provider.toLowerCase()] || model.provider}`,
      }))

    return [...customValidatorModels]
  }

  const handleMutatorModelChange = (value: string) => {
    const selectedModel = [...DEFAULT_MODELS, ...customModels].find((model) => model.value === value)
    if (selectedModel) {
      setMutatorModel(value)
      setMutatorProvider(selectedModel.provider.toLowerCase())
      console.log('Set mutator provider to:', selectedModel.provider.toLowerCase())
    }
  }

  const handleValidatorModelChange = (value: string) => {
    const selectedModel = [...DEFAULT_MODELS, ...customModels].find((model) => model.value === value)
    if (selectedModel) {
      setValidatorModel(value)
      setValidatorProvider(selectedModel.provider.toLowerCase())
      console.log('Set validator provider to:', selectedModel.provider.toLowerCase())
    }
  }

  const handleMutate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to mutate",
        variant: "destructive",
      })
      return
    }

    if (!mutationTypeIds.length) {
      toast({
        title: "Error",
        description: "Please select at least one mutation type",
        variant: "destructive",
      })
      return
    }
    
    if (!mutatorModel || !mutatorProvider) {
      toast({
        title: "Error",
        description: "Please select a model to generate mutations",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setMutations([])
    setSelectedMutations([])
    setValidations([])

    try {
      // get API key from localStorage based on the selected model's provider
      let apiKey = null;
      let endpoint = null;
      
      const selectedModel = customModels.find(model => model.value === mutatorModel);
      
      if (selectedModel && typeof window !== 'undefined') {
        // import the utility function for API key access
        const { getApiKey } = await import('@/lib/local-storage');
        const normalizedProvider = selectedModel.provider.toLowerCase();
        apiKey = getApiKey(normalizedProvider, 'mutator');
        
        console.log(`Using model: ${selectedModel.label}, provider: ${normalizedProvider}`);
        console.log(`API key retrieved: ${Boolean(apiKey)}`);
        
        const modelEndpoint = endpoint || null;
        
        if (modelEndpoint) {
          endpoint = modelEndpoint;
        } else if (normalizedProvider === "openai") {
          endpoint = "https://api.openai.com/v1/chat/completions";
        } else if (normalizedProvider === "anthropic") {
          endpoint = "https://api.anthropic.com/v1/messages";
        } else if (normalizedProvider === "mistral") {
          endpoint = "https://api.mistral.ai/v1/chat/completions";
        } else if (normalizedProvider === "deepseek") {
          endpoint = "https://api.deepseek.com/v1/chat/completions";
        }
      }
      
      if (!mutatorModel) {
        toast({
          title: "Missing Model",
          description: "Please select a model to use for mutations.",
          variant: "destructive",
        });
        throw new Error("No model selected for mutations.");
      }
      
      if (!apiKey) {
        toast({
          title: "Missing API Key",
          description: `No API key found for provider: ${mutatorProvider}, role: mutator. Please configure API keys in the Settings page.`,
          variant: "destructive",
        });
        throw new Error(`No API key found for provider: ${mutatorProvider}, role: mutator.`);
      }

      const response = await fetch("/api/prompt/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mutationTypeIds,
          mutationStrength,
          numMutations,
          maxTokens,
          modelId: mutatorModel,
          provider: mutatorProvider,
          apiKey: apiKey,
          endpoint: endpoint
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to mutate prompt")
      }

      const data = await response.json()
      
      const allMutations = data.mutations.flat().map((m: any, i: number) => ({ 
        ...m, 
        id: i.toString() 
      }))
      
      setMutations(allMutations)

      toast({
        title: "Mutations generated",
        description: `Successfully created ${allMutations.length} mutations across ${mutationTypeIds.length} type${mutationTypeIds.length > 1 ? 's' : ''}.`,
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

  const handleValidate = async () => {
    if (selectedMutations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one mutation to validate",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    setValidations([])

    try {
      // get API key from localStorage based on the selected model's provider
      let apiKey = null;
      let endpoint = null;
      
      const selectedModel = validatorModels.find(model => model.value === validatorModel);
      
      if (selectedModel && typeof window !== 'undefined') {
        // import the utility function for API key access
        const { getApiKey } = await import('@/lib/local-storage');
        const normalizedProvider = selectedModel.provider.toLowerCase();
        apiKey = getApiKey(normalizedProvider, 'validator');
        
        console.log(`Using validator model: ${selectedModel.label}, provider: ${normalizedProvider}`);
        console.log(`Validator API key retrieved: ${Boolean(apiKey)}`);
        
        const modelEndpoint = endpoint || null;
        
        if (modelEndpoint) {
          endpoint = modelEndpoint;
        } else if (normalizedProvider === "openai") {
          endpoint = "https://api.openai.com/v1/chat/completions";
        } else if (normalizedProvider === "anthropic") {
          endpoint = "https://api.anthropic.com/v1/messages";
        } else if (normalizedProvider === "mistral") {
          endpoint = "https://api.mistral.ai/v1/chat/completions";
        } else if (normalizedProvider === "deepseek") {
          endpoint = "https://api.deepseek.com/v1/chat/completions";
        }
      }

      if (!apiKey) {
        toast({
          title: "Missing API Key",
          description: `No API key found for provider: ${validatorProvider}, role: validator. Please configure API keys in the Settings page.`,
          variant: "destructive",
        });
        throw new Error(`No API key found for provider: ${validatorProvider}, role: validator.`);
      }
      
      const response = await fetch("/api/prompt/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPrompt: prompt,
          mutatedPrompts: selectedMutations.map((id) => mutations.find((m) => m.id === id)),
          modelId: validatorModel,
          provider: selectedModel ? selectedModel.provider : validatorProvider,
          apiKey: apiKey,
          endpoint: endpoint
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to validate prompts")
      }

      const data = await response.json()
      setValidations(data.validations)
      setActiveTab("validate")

      toast({
        title: "Validation complete",
        description: `Successfully validated ${data.validations.length} mutations.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const toggleMutationSelection = (id: string) => {
    setSelectedMutations((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const saveSession = async () => {
    if (!prompt.trim() || mutations.length === 0) {
      toast({
        title: "Cannot save session",
        description: "You need a prompt and at least one mutation to save a session.",
        variant: "destructive",
      })
      return
    }

    try {
      const sessionData = {
        basePrompt: prompt,
        mutations: mutations,
        settings: {
          mutationTypeIds,
          mutationStrength,
          numMutations,
          maxTokens,
          modelId: mutatorModel,
          provider: mutatorProvider,
          validatorModelId: validatorModel,
          validatorProvider: validatorProvider,
          selectedMutations,
          validations,
        },
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save session")
      }

      setSessionSaved(true)
      setTimeout(() => setSessionSaved(false), 3000)

      toast({
        title: "Session saved",
        description: "Your session has been saved to history.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save session",
        variant: "destructive",
      })
    }
  }

  if (isCheckingApiKeys || isLoadingModels || isLoadingMutationTypes) {
    return (
      <div className="flex h-full items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary/70" />
            </div>
            <div className="h-2 w-32 bg-primary/10 rounded-full"></div>
          </div>
          <p className="text-muted-foreground text-sm mt-4">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!hasApiKeys && customModels.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <Card className="rounded-xl border-none shadow-md bg-gradient-to-br from-background via-background/80 to-muted/30">
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 bg-primary/5 rounded-full">
                <AlertCircle className="h-10 w-10 text-primary/80" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">API Configuration Required</h2>
              <p className="mb-8 max-w-md text-muted-foreground">
                To use Prompt Lab, you need to configure your AI models first.
              </p>
              <Link href="/settings">
                <Button className="rounded-lg">
                  Configure Settings
                  <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mutationTypes.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <Card className="rounded-xl border-none shadow-md bg-gradient-to-br from-background via-background/80 to-muted/30">
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 bg-primary/5 rounded-full">
                <AlertCircle className="h-10 w-10 text-primary/80" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">No Mutation Types Available</h2>
              <p className="mb-8 max-w-md text-muted-foreground">
                You need to configure at least one mutation type to use Prompt Lab.
              </p>
              <Link href="/settings?tab=mutation-types">
                <Button className="rounded-lg">
                  Configure Mutation Types
                  <ChevronDown className="ml-2 h-4 w-4 rotate-[-90deg]" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // group models by provider for the select component
  const mutatorModels = getMutatorModels()
  const validatorModels = getValidatorModels()

  const groupedMutatorModels = mutatorModels.reduce<Record<string, Model[]>>((acc, model) => {
    if (!acc[model.group || '']) {
      acc[model.group || ''] = []
    }
    acc[model.group || ''].push(model)
    return acc
  }, {})

  const groupedValidatorModels = validatorModels.reduce<Record<string, Model[]>>((acc, model) => {
    if (!acc[model.group || '']) {
      acc[model.group || ''] = []
    }
    acc[model.group || ''].push(model)
    return acc
  }, {})

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
            <h1 className="text-lg sm:text-xl font-medium tracking-tight">Prompt Lab</h1>
            <Badge variant="outline" className="ml-1 sm:ml-2 text-[10px] sm:text-xs py-0">
              Experimental
            </Badge>
          </div>
          
          <TabsList className="grid w-full max-w-full sm:max-w-[240px] grid-cols-2 rounded-lg p-0.5 sm:p-1 bg-muted/50 border">
            <TabsTrigger value="mutate" className="rounded-md text-xs data-[state=active]:bg-background">
              Mutate
            </TabsTrigger>
            <TabsTrigger value="validate" disabled={mutations.length === 0} className="rounded-md text-xs data-[state=active]:bg-background">
              Validate
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="mutate" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {/* Left column: Input and configuration */}
            <div className="md:col-span-1 lg:col-span-1 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Base prompt input card */}
              <Card className="rounded-xl border shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between bg-muted/30 px-3 sm:px-4 py-2 sm:py-2.5 border-b">
                    <Label htmlFor="prompt" className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Base Prompt
                    </Label>
                    {!prompt.trim() && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] sm:text-xs font-normal px-1.5 sm:px-2 py-0 h-4 sm:h-5">
                          <Command className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1" />P
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your base prompt..."
                    className="min-h-[120px] sm:min-h-[150px] md:min-h-[180px] resize-none rounded-none border-0 bg-transparent p-3 sm:p-4 focus-visible:ring-0"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Configuration panel */}
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-medium text-xs sm:text-sm">Configuration</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground">
                            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Configure your mutation settings
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-4">
                    {/* Mutator model */}
                    <div>
                      <Label htmlFor="mutator-model" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Model
                      </Label>
                      <Select value={mutatorModel} onValueChange={handleMutatorModelChange}>
                        <SelectTrigger
                          id="mutator-model"
                          className="w-full bg-transparent rounded-lg border h-9 text-sm"
                        >
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(groupedMutatorModels).map(([group, models]) => (
                            <div key={group}>
                              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group}</div>
                              {models.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mutation type */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="mutation-type" className="text-xs font-medium text-muted-foreground">
                          Mutation Type
                        </Label>
                        <Link href="/settings?tab=mutation-types" className="text-[10px] text-primary hover:underline">
                          Manage types
                        </Link>
                      </div>
                      <div className="relative">
                        <Button
                          id="mutation-type"
                          variant="outline"
                          role="combobox"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsTypesDropdownOpen(!isTypesDropdownOpen);
                          }}
                          className="w-full justify-between bg-transparent rounded-lg border h-9 text-sm"
                        >
                          {mutationTypeIds.length > 0
                            ? `${mutationTypeIds.length} type${mutationTypeIds.length > 1 ? 's' : ''} selected`
                            : "Select mutation types"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                        {isTypesDropdownOpen && (
                          <div className="mutation-type-dropdown absolute w-full z-50 top-full mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover p-1 shadow-md">
                          {mutationTypes.map((type) => (
                            <div
                              key={type.id}
                              className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                mutationTypeIds.includes(type.id) ? "bg-accent/50" : ""
                              }`}
                              onClick={() => {
                                setMutationTypeIds((prev) =>
                                  prev.includes(type.id)
                                    ? prev.filter((id) => id !== type.id)
                                    : [...prev, type.id]
                                );
                              }}
                            >
                              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                {mutationTypeIds.includes(type.id) && (
                                  <Check className="h-4 w-4" />
                                )}
                              </span>
                              {type.name}
                            </div>
                          ))}
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Mutation strength */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="mutation-strength" className="text-xs font-medium text-muted-foreground">
                          Mutation Strength: {mutationStrength}
                        </Label>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {mutationStrength <= 3 ? "Subtle" : mutationStrength <= 7 ? "Moderate" : "Significant"}
                          </Badge>
                        </div>
                      </div>
                      <Slider
                        id="mutation-strength"
                        min={1}
                        max={10}
                        step={1}
                        value={[mutationStrength]}
                        onValueChange={(value) => setMutationStrength(value[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>Subtle</span>
                        <span>Moderate</span>
                        <span>Significant</span>
                      </div>
                    </div>

                    {/* Number of mutations */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="num-mutations" className="text-xs font-medium text-muted-foreground">
                          Number of Mutations: {numMutations}
                        </Label>
                      </div>
                      <Slider
                        id="num-mutations"
                        min={1}
                        max={10}
                        step={1}
                        value={[numMutations]}
                        onValueChange={(value) => setNumMutations(value[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                    
                    {/* Max tokens */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="max-tokens" className="text-xs font-medium text-muted-foreground">
                          Max Tokens: {maxTokens}
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Maximum tokens the AI model can generate in its response
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Slider
                        id="max-tokens"
                        min={100}
                        max={2000}
                        step={100}
                        value={[maxTokens]}
                        onValueChange={(value) => setMaxTokens(value[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>100</span>
                        <span>1000</span>
                        <span>2000</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 rounded-lg text-primary-foreground mt-1 sm:mt-2 py-2 h-auto sm:h-10"
                    onClick={handleMutate}
                    disabled={isLoading || !prompt.trim() || mutationTypeIds.length === 0 || !mutatorModel}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" />
                        <span className="text-xs sm:text-sm">Generating...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm">Generate Mutations</span>
                        <Zap className="ml-1.5 sm:ml-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Mutations list */}
            <div className="md:col-span-1 lg:col-span-2">
              {mutations.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h2 className="font-medium text-xs sm:text-sm">Mutations</h2>
                      <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                        {selectedMutations.length}/{mutations.length} selected
                      </Badge>
                    </div>

                    {selectedMutations.length > 0 && (
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <Select value={validatorModel} onValueChange={handleValidatorModelChange}>
                          <SelectTrigger className="w-full sm:w-[180px] h-7 sm:h-8 text-[10px] sm:text-xs rounded-lg">
                            <SelectValue placeholder="Select validator" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(groupedValidatorModels).map(([group, models]) => (
                              <div key={group}>
                                <div className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground">{group}</div>
                                {models.map((model) => (
                                  <SelectItem key={model.value} value={model.value} className="text-[10px] sm:text-xs">
                                    {model.label}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleValidate}
                          disabled={isValidating || !validatorModel}
                          size="sm"
                          className="rounded-lg bg-primary hover:bg-primary/90 h-7 sm:h-8 text-[10px] sm:text-xs flex-1 sm:flex-initial"
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className="mr-1 sm:mr-1.5 h-3 sm:h-3.5 w-3 sm:w-3.5 animate-spin" />
                              <span className="whitespace-nowrap">Validating...</span>
                            </>
                          ) : (
                            <>
                              <span>Validate</span>
                              <BarChart className="ml-1 sm:ml-1.5 h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {mutations.map((mutation) => (
                      <PromptMutationCard
                        key={mutation.id}
                        mutation={mutation}
                        isSelected={selectedMutations.includes(mutation.id)}
                        onToggleSelect={() => toggleMutationSelection(mutation.id)}
                        originalPrompt={prompt}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md py-8 sm:py-12 md:py-16 px-4">
                    <div className="mx-auto bg-muted/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">Create Your First Mutations</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">
                      Enter a base prompt, configure the settings, and generate your first set of prompt mutations.
                    </p>
                    
                    <div className="flex flex-col items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-start gap-2 sm:gap-4 bg-muted/30 rounded-lg p-2 sm:p-3 w-full max-w-xs">
                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs font-medium text-primary">1</span>
                        </div>
                        <p className="text-left">Enter a prompt in the input field</p>
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-4 bg-muted/30 rounded-lg p-2 sm:p-3 w-full max-w-xs">
                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs font-medium text-primary">2</span>
                        </div>
                        <p className="text-left">Configure the mutation settings</p>
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-4 bg-muted/30 rounded-lg p-2 sm:p-3 w-full max-w-xs">
                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/10 mt-0.5 flex-shrink-0">
                          <span className="text-[10px] sm:text-xs font-medium text-primary">3</span>
                        </div>
                        <p className="text-left">Click "Generate Mutations" to create variations</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="validate" className="animate-fade-in">
          {validations.length > 0 ? (
            <ValidationPanel
              validations={validations}
              mutations={mutations}
              selectedMutations={selectedMutations}
              originalPrompt={prompt}
            />
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="mx-auto bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <BarChart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Validations Yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Select one or more mutations from the Mutate tab and click "Validate" to see validation results.
                </p>
                <Button onClick={() => setActiveTab("mutate")} variant="outline" className="rounded-lg">
                  Go to Mutations Tab
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  )
}