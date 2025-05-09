import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { callLLM } from "@/services/llm"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { provider, modelId, endpoint, apiKey } = await req.json()

    if (!provider || !modelId || !apiKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const normalizedProvider = provider.toLowerCase();
    if (["openai", "anthropic", "mistral", "deepseek"].includes(normalizedProvider)) {
      try {
        await callLLM({
          provider: provider,
          prompt: "Hello, this is a test.",
          systemPrompt: "You are a helpful assistant. Respond with 'Test successful' to confirm the connection works.",
          modelId: modelId,
          apiKey: apiKey,
          endpoint: endpoint,
          maxTokens: 50,
        });
        
        return NextResponse.json({
          success: true,
          message: "Model configuration is valid.",
        })
      } catch (err) {
        const error = err as Error;
        console.error("Model check error:", error);
        
        let errorMessage = "Failed to connect to the model";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
        })
      }
    } else {
      return NextResponse.json({error: `Unsupported provider: ${normalizedProvider}` }, { status: 400 });
    }
  } catch (err) {
    const error = err as Error;
    console.error("Model check error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check model configuration",
      },
      { status: 500 },
    )
  }
}