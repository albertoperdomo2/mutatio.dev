import { ChatMessage, MistralRequestBody } from "@/types/api"

type MistralCallOptions = {
  prompt: string;
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
};

type MistralResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  outputCost: number;
};

const pricing: Record<string, { input: number; output: number }> = {
  'mistral-large': { input: 0.008, output: 0.024 },
  'mistral-medium': { input: 0.0027, output: 0.0081 },
  'mistral-small': { input: 0.0006, output: 0.0018 },
};

export async function callMistral({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: MistralCallOptions): Promise<MistralResponse> {
  const messages: ChatMessage[] = [];
  const actualEndpoint = endpoint || "https://api.mistral.ai/v1/chat/completions"

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push({ role: "user", content: prompt });

  const requestBody: MistralRequestBody = {
    model: modelId,
    messages: messages,
    ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
    ...(temperature !== undefined ? { temperature: temperature } : {}),
  };
  
  try {
    const response = await fetch(actualEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || `Mistral API error: ${response.status}`;
      } catch (parseError) {
        errorMessage = `Mistral API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || "",
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      outputCost: ((pricing[modelId] || pricing['mistral-medium']).input / 1000) * data.usage?.completion_tokens, 
    };
  } catch (error) {
    console.error("Mistral API call failed:", error);
    throw error;
  }
}