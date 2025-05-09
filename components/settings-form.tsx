"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Settings as SettingsIcon, Database, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModelConfigForm } from "@/components/model-config-form"
import { MutationTypesForm } from "@/components/mutation-types-form"

interface SettingsFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const init = () => {
      try {
        setIsLoading(true);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [toast])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <SettingsIcon className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-medium tracking-tight">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="models" className="animate-fade-in">
        <div className="overflow-x-auto -mx-3 px-3 pb-1">
          <TabsList className="mb-4 sm:mb-6 grid w-full grid-cols-2 rounded-lg p-0.5 sm:p-1 bg-muted/50 border min-w-[240px] max-w-full sm:max-w-[240px]">
            <TabsTrigger value="models" className="rounded-md text-[10px] sm:text-xs py-1.5 sm:py-2 data-[state=active]:bg-background">
              Models
            </TabsTrigger>
            <TabsTrigger value="mutation-types" className="rounded-md text-[10px] sm:text-xs py-1.5 sm:py-2 data-[state=active]:bg-background whitespace-nowrap">
              Mutation Types
            </TabsTrigger>
          </TabsList>
        </div>


        {/* Models Tab */}
        <TabsContent value="models" className="animate-slide-up space-y-4 sm:space-y-6">
          <Alert className="bg-blue-500/10 border-blue-200/30 text-blue-500 py-3 sm:py-4">
            <Info className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <AlertTitle className="text-sm sm:text-base">API Keys Stored Locally</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              API keys are stored securely in your browser's local storage when you add or edit a model.
              This improves security but means your keys will not be available on other devices or browsers.
            </AlertDescription>
          </Alert>
          
          <Card className="overflow-hidden rounded-xl border shadow-sm">
            <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Database className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
                <CardTitle className="text-base sm:text-lg">Custom Models</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Configure custom models for prompt mutation and validation.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <ModelConfigForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mutation Types Tab */}
        <TabsContent value="mutation-types" className="animate-slide-up">
          <Card className="overflow-hidden rounded-xl border shadow-sm">
            <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Database className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
                <CardTitle className="text-base sm:text-lg">Mutation Types</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Manage your custom mutation types for prompt engineering.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <MutationTypesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}