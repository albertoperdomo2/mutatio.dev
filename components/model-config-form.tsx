"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Plus, Trash2, Loader2, Edit, Check, Database, HelpCircle, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { saveApiKey } from "@/lib/local-storage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ModelConfigForm() {
  interface ModelConfig {
    displayName: string
    endpoint?: string
    apiKey?: string
    role: "mutator" | "validator" | "both"
  }
  
  interface ModelConfigs {
    [provider: string]: {
      [modelId: string]: ModelConfig
    }
  }
  
  interface ModelFormState {
    provider: string
    modelId: string
    displayName: string
    endpoint: string
    apiKey: string
    role: "mutator" | "validator" | "both"
  }
  
  interface CurrentModel {
    provider: string
    modelId: string
  }

  const [modelConfigs, setModelConfigs] = useState<ModelConfigs>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingModel, setIsAddingModel] = useState(false)
  const [isEditingModel, setIsEditingModel] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showApiKeyInstructions, setShowApiKeyInstructions] = useState(false)

  // form state for adding/editing a model
  const [formState, setFormState] = useState<ModelFormState>({
    provider: "openai",
    modelId: "",
    displayName: "",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    role: "both",
  })

  // current model being edited (used for API calls in handleSaveModel)
  const [currentModel, setCurrentModel] = useState<CurrentModel | null>(null)

  const { toast } = useToast()

  const providerDisplayNames: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    mistral: "MistralAI",
    deepseek: "DeepSeek",
  };
  
  // fetch model configurations on component mount
  useEffect(() => {
    fetchModelConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchModelConfigs = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching model configurations...")
      const response = await fetch("/api/user/model-config")

      if (response.ok) {
        const data = await response.json()
        console.log("Model configurations fetched successfully")
        setModelConfigs(data.modelConfigs || {})
      } else {
        const errorText = await response.text()
        console.error("Failed to fetch model configurations:", errorText)
        
        toast({
          title: "Error loading configurations",
          description: "Your configurations couldn't be loaded. Default settings will be used.",
          variant: "destructive",
        })
        
        // set empty config to prevent UI errors
        setModelConfigs({})
      }
    } catch (error) {
      console.error("Failed to fetch model configurations:", error)
      
      toast({
        title: "Error loading configurations",
        description: "An unexpected error occurred. Please try refreshing the page.",
        variant: "destructive",
      })
      
      // set empty config to prevent UI errors
      setModelConfigs({})
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddModel = () => {
    setFormState({
      provider: "openai",
      modelId: "",
      displayName: "",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: "",
      role: "both",
    })
    setShowApiKey(false)
    setIsAddingModel(true)
    setCurrentModel(null)
  }

  const handleEditModel = (provider: string, modelId: string) => {
    const model = modelConfigs[provider][modelId]
    setFormState({
      provider,
      modelId,
      displayName: model.displayName,
      endpoint: model.endpoint || "",
      apiKey: "", // DO NOT populate the apiKey, now it is stored in the browser
      role: model.role,
    })
    setShowApiKey(false)
    setIsEditingModel(true)
    setCurrentModel({ provider, modelId })
  }

  const handleDeleteModel = async (provider: string, modelId: string) => {
    try {
      const response = await fetch("/api/user/model-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, modelId }),
      })

      if (response.ok) {
        // update local state
        const updatedConfigs = { ...modelConfigs }
        delete updatedConfigs[provider][modelId]

        // clean up empty provider objects
        if (Object.keys(updatedConfigs[provider]).length === 0) {
          delete updatedConfigs[provider]
        }

        setModelConfigs(updatedConfigs)

        toast({
          title: "Model deleted",
          description: "The model configuration has been deleted successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete model")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete model. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveModel = async () => {
    // validate form
    if (!formState.provider || !formState.modelId || !formState.displayName || !formState.role) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      if (isEditingModel && currentModel) {
        console.log(`Editing model: ${currentModel.provider}/${currentModel.modelId}`);
      }
      
      // save API key to localStorage if provided
      if (formState.apiKey) {
        console.log(`Saving API key for ${formState.provider} model ${formState.modelId} to localStorage`);
        
        // determine the role to use for localStorage
        const role = formState.role === 'both' ? ['mutator', 'validator'] : 
                    [formState.role];
        
        for (const r of role) {
          const success = saveApiKey(formState.provider, r, formState.apiKey);
          if (success) {
            console.log(`Successfully saved ${formState.provider} ${r} key to localStorage`);
          } else {
            console.error(`Failed to save ${formState.provider} ${r} key to localStorage`);
          }
        }
      }
      
      // create a copy of the form state without the API key for server storage
      const modelConfigForServer = {
        ...formState,
        apiKey: formState.apiKey ? "stored-in-browser" : "",
      };
      
      const response = await fetch("/api/user/model-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modelConfigForServer),
      })

      if (response.ok) {
        await fetchModelConfigs()

        // reset form and close dialog
        setFormState({
          provider: "openai",
          modelId: "",
          displayName: "",
          endpoint: "",
          apiKey: "",
          role: "both",
        })

        setIsAddingModel(false)
        setIsEditingModel(false)

        toast({
          title: "Model saved",
          description: "The model configuration has been saved successfully.",
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save model")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "provider") {
      // auto-populate the endpoint based on the provider
      let defaultEndpoint = "";
      switch (value) {
        case "openai":
          defaultEndpoint = "https://api.openai.com/v1/chat/completions";
          break;
        case "anthropic":
          defaultEndpoint = "https://api.anthropic.com/v1/messages";
          break;
        case "mistral":
          defaultEndpoint = "https://api.mistral.ai/v1/chat/completions";
          break;
        case "deepseek":
          defaultEndpoint = "https://api.deepseek.com/v1/chat/completions";
          break;
        default:
          defaultEndpoint = "";
      }
      
      setFormState((prev) => ({ 
        ...prev, 
        [name]: value,
        endpoint: defaultEndpoint
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "mutator":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-200/20">Mutator</Badge>
      case "validator":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-200/20">Validator</Badge>
      case "both":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-200/20">Mutator & Validator</Badge>
      default:
        return null
    }
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
          <p className="text-muted-foreground text-sm mt-4">Loading model configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary/90">Configuration</h2>
        {Object.keys(modelConfigs).length > 0 && (
        <Button onClick={handleAddModel} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-9 px-3 text-sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Model
        </Button>
        )}
      </div>

      {/* Model list */}
      {Object.keys(modelConfigs).length === 0 ? (
        <Card className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-background via-background/80 to-muted/30 shadow-md">
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 p-4 bg-primary/5 rounded-full">
                <Database className="h-10 w-10 text-primary/80" />
              </div>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight">No Models Configured</h2>
              <p className="mb-8 max-w-md text-muted-foreground">You haven't configured any custom models yet.</p>
              <Button onClick={handleAddModel} variant="outline" className="rounded-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Model
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(modelConfigs).map(([provider, models]) => (
            <div key={provider} className="space-y-3">
              <h3 className="text-lg font-medium">{providerDisplayNames[provider] || provider}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(models).map(([modelId, model]) => (
                  <Card key={modelId} className="overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">{model.displayName}</CardTitle>
                        {getRoleBadge(model.role)}
                      </div>
                      <CardDescription className="text-xs font-mono">{modelId}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {model.endpoint && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Endpoint:</span>
                          <p className="text-xs font-mono truncate">{model.endpoint}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">API Key:</span>
                        {model.apiKey ? (
                          <Badge variant="outline" className="text-xs font-normal">
                            Configured
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-500 border-amber-200/20 text-xs font-normal"
                          >
                            Not Set
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditModel(provider, modelId)}
                        className="h-8 px-2.5 text-xs rounded-lg"
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteModel(provider, modelId)}
                        className="h-8 px-2.5 text-xs text-destructive hover:text-destructive rounded-lg"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Model Dialog */}
      <Dialog
        open={isAddingModel || isEditingModel}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingModel(false)
            setIsEditingModel(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{isEditingModel ? "Edit Model" : "Add New Model"}</DialogTitle>
            <DialogDescription>
              {isEditingModel
                ? "Update your custom model configuration."
                : "Configure a custom model for prompt mutation and validation."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-sm font-medium">
                  Provider
                </Label>
                <Select
                  value={formState.provider}
                  onValueChange={(value) => handleSelectChange("provider", value)}
                  disabled={isEditingModel} // can't change provider when editing
                >
                  <SelectTrigger
                    id="provider"
                    className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="mr-1">Need another provider?</span>
                  <a 
                    href="https://twitter.com/p3rd0mo" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    Let me know on X <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select value={formState.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger
                    id="role"
                    className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutator">Mutator</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelId" className="text-sm font-medium">
                Model ID
              </Label>
              <Input
                id="modelId"
                name="modelId"
                value={formState.modelId}
                onChange={handleInputChange}
                placeholder="e.g., gpt-4o, claude-3-opus-20240229"
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                disabled={isEditingModel} // can't change model ID when editing
              />
              <p className="text-xs text-muted-foreground">
                The identifier for the model as specified by the provider.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="displayName"
                name="displayName"
                value={formState.displayName}
                onChange={handleInputChange}
                placeholder="e.g., GPT-4o, Claude 3 Opus"
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground">A friendly name to display in the UI.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint" className="text-sm font-medium">
                API Endpoint (Optional)
              </Label>
              <Input
                id="endpoint"
                name="endpoint"
                value={formState.endpoint}
                onChange={handleInputChange}
                placeholder="e.g., https://api.openai.com/v1"
                className="border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Custom endpoint URL if you&apos;re using a proxy or alternative API endpoint.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Label htmlFor="apiKey" className="text-sm font-medium">
                    API Key
                  </Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1 p-0 text-muted-foreground hover:text-primary"
                    onClick={() => setShowApiKeyInstructions(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="sr-only">How to get API keys</span>
                  </Button>
                </div>
                {isEditingModel && (
                  <span className="text-xs text-muted-foreground">Leave blank to keep existing key</span>
                )}
              </div>
              <div className="flex">
                <Input
                  id="apiKey"
                  name="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={formState.apiKey}
                  onChange={handleInputChange}
                  placeholder={isEditingModel ? "••••••••••••••••••••••" : "Enter API key"}
                  className="flex-1 rounded-r-none border-muted bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-l-none border-l-0 border-muted"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-6 p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setShowApiKeyInstructions(true)}
                >
                  How to get API keys
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingModel(false)
                setIsEditingModel(false)
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModel}
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
                  {isEditingModel ? "Update Model" : "Add Model"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Instructions Dialog */}
      <Dialog
        open={showApiKeyInstructions}
        onOpenChange={(open) => setShowApiKeyInstructions(open)}
      >
        <DialogContent className="sm:max-w-[600px] rounded-xl">
          <DialogHeader>
            <DialogTitle>How to Get API Keys</DialogTitle>
            <DialogDescription>
              Follow these instructions to obtain API keys for different providers.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="openai" className="mt-4">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
              <TabsTrigger value="mistral">Mistral</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4 mt-4">
              <h3 className="text-base font-medium">OpenAI API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">OpenAI API Keys page <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in to your OpenAI account (or create one if needed)</li>
                <li>Click on "Create new secret key"</li>
                <li>Give your key a name and click "Create"</li>
                <li>Copy your API key (you won't be able to see it again)</li>
                <li>Paste the key in the API Key field in this form</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">Note: You may need to add a payment method to your OpenAI account to use the API.</p>
            </TabsContent>
            
            <TabsContent value="anthropic" className="space-y-4 mt-4">
              <h3 className="text-base font-medium">Anthropic API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">Anthropic Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in to your Anthropic account (or create one if needed)</li>
                <li>Click on "Create Key"</li>
                <li>Give your key a name and select desired permissions</li>
                <li>Copy your API key immediately (you won't be able to see it again)</li>
                <li>Paste the key in the API Key field in this form</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">Note: API access may require a subscription plan, depending on which Claude models you wish to use.</p>
            </TabsContent>
            
            <TabsContent value="mistral" className="space-y-4 mt-4">
              <h3 className="text-base font-medium">Mistral API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://console.mistral.ai/api-keys/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">Mistral AI Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in to your Mistral account (or create one if needed)</li>
                <li>Click on "Create API Key"</li>
                <li>Give your key a description</li>
                <li>Copy your API key immediately (you won't be able to see it again)</li>
                <li>Paste the key in the API Key field in this form</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">Note: Some Mistral models may require a paid subscription plan.</p>
            </TabsContent>
            
            <TabsContent value="deepseek" className="space-y-4 mt-4">
              <h3 className="text-base font-medium">DeepSeek API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://platform.deepseek.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">DeepSeek Platform <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in to your DeepSeek account (or create one if needed)</li>
                <li>Navigate to the API Keys section</li>
                <li>Click on "Create new API key"</li>
                <li>Give your key a name and select appropriate permissions</li>
                <li>Copy your API key immediately (you won't be able to see it again)</li>
                <li>Paste the key in the API Key field in this form</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">Note: You may need a subscription to access certain DeepSeek models. Check their pricing page for more details.</p>
            </TabsContent>
            
            <TabsContent value="google" className="space-y-4 mt-4">
              <h3 className="text-base font-medium">Google AI API Keys</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">Google AI Studio <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Sign in with your Google account</li>
                <li>Navigate to the API Keys section</li>
                <li>Click "Create API Key"</li>
                <li>Copy your API key (you won't be able to see the full key again)</li>
                <li>Paste the key in the API Key field in this form</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">Note: You may need to set up a Google Cloud account and enable the Gemini API to use some models.</p>
            </TabsContent>
          </Tabs>

          <p className="text-sm mt-6 text-muted-foreground">
            Your API keys are stored securely in your browser&apos;s local storage and are never sent to our servers.
          </p>

          <DialogFooter className="mt-4">
            <Button onClick={() => setShowApiKeyInstructions(false)} className="rounded-lg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}