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

type DeepSeekResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  outputCost: number;
};

const pricing: Record<string, { input: number; output: number }> = {
  'deepseek-coder': { input: 0.0005, output: 0.0015 },
  'deepseek-chat': { input: 0.0005, output: 0.0015 },
};

export async function callDeepSeek({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: DeepSeekCallOptions): Promise<DeepSeekResponse> {
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
    return {
      text: data.choices[0]?.message?.content || "",
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      outputCost: ((pricing[modelId] || pricing['deepseek-chat']).input / 1000) * data.usage?.completion_tokens, 
    };
  } catch (error) {
    console.error("DeepSeek API call failed:", error);
    throw error;
  }
}