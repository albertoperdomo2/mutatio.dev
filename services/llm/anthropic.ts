import { ChatMessage, AnthropicRequestBody } from "@/types/api"

type AnthropicCallOptions = {
  prompt: string;
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
};

type AnthropicResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  outputCost: number;
};

const pricing: Record<string, { input: number; output: number }> = {
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.0033, output: 0.0167 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-3.5-sonnet': { input: 0.0033, output: 0.0167 },
  'claude-3.7-sonnet': { input: 0.004, output: 0.02 },
};

export async function callAnthropic({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: AnthropicCallOptions): Promise<AnthropicResponse> {
  const actualEndpoint = endpoint || "https://api.anthropic.com/v1/messages"

  const messages: ChatMessage[] = [
    { role: "user", content: prompt }
  ];
  
  const requestBody: AnthropicRequestBody = {
    model: modelId,
    messages: messages,
    temperature: temperature,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
    ...(temperature !== undefined ? { temperature: temperature } : {}),
  };
  
  try {
    const response = await fetch(actualEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || `Anthropic API error: ${response.status}`;
      } catch (parseError) {
        errorMessage = `Anthropic API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      text: data.content?.[0]?.text || "",
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        totalTokens: data.usage?.input_tokens || 0 + data.usage?.output_tokens, 
      },
      outputCost: ((pricing[modelId] || pricing['claude-3-sonnet']).input / 1000) * data.usage?.output_tokens, 
    };
  } catch (error) {
    console.error("Anthropic API call failed:", error);
    throw error;
  }
}