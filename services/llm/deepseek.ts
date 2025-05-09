import { ChatMessage, DeepSeekRequestBody } from "@/types/api"

type DeepSeekCallOptions = {
  prompt: string;
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
};

export async function callDeepSeek({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: DeepSeekCallOptions): Promise<string> {
  const messages: ChatMessage[] = [];
  const actualEndpoint = endpoint || "https://api.deepseek.com/v1/chat/completions"

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push({ role: "user", content: prompt });

  const requestBody: DeepSeekRequestBody = {
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
        errorMessage = errorData.error?.message || `DeepSeek API error: ${response.status}`;
      } catch (parseError) {
        errorMessage = `DeepSeek API error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    throw error;
  }
}