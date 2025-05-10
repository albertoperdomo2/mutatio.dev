import { ChatMessage, OpenAIRequestBody } from "@/types/api"

type OpenAICallOptions = {
  prompt: string;
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
};

type OpenAIResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  outputCost: number;
};

const pricing: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.0015, output: 0.006 },

  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
  'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
  'gpt-4-vision-preview': { input: 0.01, output: 0.03 },

  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-0613': { input: 0.03, output: 0.06 },
  'gpt-4-32k': { input: 0.06, output: 0.12 },
  'gpt-4-32k-0613': { input: 0.06, output: 0.12 },

  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-3.5-turbo-1106': { input: 0.0005, output: 0.0015 },
  'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
  'gpt-3.5-turbo-16k': { input: 0.001, output: 0.002 },
  'gpt-3.5-turbo-16k-0613': { input: 0.001, output: 0.002 },
  'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.002 },
};

export async function callOpenAI({
  prompt,
  modelId,
  apiKey,
  systemPrompt,
  endpoint,
  temperature,
  maxTokens
}: OpenAICallOptions): Promise<OpenAIResponse> {
  const messages: ChatMessage[] = [];
  const actualEndpoint = endpoint || "https://api.openai.com/v1/chat/completions"
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push({ role: "user", content: prompt });

  const requestBody: OpenAIRequestBody = {
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
        errorMessage = errorData.error?.message || `OpenAI API error: ${response.status}`;
      } catch (parseError) {
        errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
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
      outputCost: ((pricing[modelId] || pricing['gpt-4-turbo']).input / 1000) * data.usage?.completion_tokens,
    };
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    throw error;
  }
}