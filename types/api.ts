export type ChatMessage = {
    role: string;
    content: string;
};

export type OpenAIRequestBody = {
    model: string;
    messages: Array<ChatMessage>;
    temperature?: number;
    max_tokens?: number;
};

export type AnthropicRequestBody = {
    model: string;
    system?: string;
    messages: Array<ChatMessage>;
    temperature?: number;
    max_tokens?: number;
};
  
export type MistralRequestBody = {
    model: string;
    messages: Array<ChatMessage>;
    temperature?: number;
    max_tokens?: number;
};
  
export type DeepSeekRequestBody = {
    model: string;
    messages: Array<ChatMessage>;
    temperature?: number;
    max_tokens?: number;
};

export interface RouteParams {
    params: {
        id: string
    }
}