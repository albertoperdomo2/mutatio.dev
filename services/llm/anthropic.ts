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

export async function callAnthropic({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: AnthropicCallOptions): Promise<string> {
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
    return data.content?.[0]?.text || ""
  } catch (error) {
    console.error("Anthropic API call failed:", error);
    throw error;
  }
}