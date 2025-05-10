import { callOpenAI } from './openai';
import { callAnthropic } from './anthropic';
import { callMistral } from './mistral';
import { callDeepSeek } from './deepseek';

type CallOptions = {
  provider: string;
  prompt: string;
  modelId: string;
  apiKey: string;
  systemPrompt?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
};

type CallResponse = {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  outputCost: number;
};

export async function callLLM(options: CallOptions): Promise<CallResponse> {
  const { provider, ...rest } = options;
  console.log(`Making request through callLLM for provider: ${provider}`)
  
  const providerLower = provider.toLowerCase();
  
  switch (providerLower) {
    case 'openai':
      return await callOpenAI(rest);
      
    case 'anthropic':
      return await callAnthropic(rest);
      
    case 'mistral':
      return await callMistral(rest);
      
    case 'deepseek':
      return await callDeepSeek(rest);
      
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}