import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemPromptForMutation } from "@/lib/mutation-types";
import { callLLM } from "@/services/llm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, mutationTypeIds, mutationStrength, numMutations, maxTokens = 500, modelId, provider, apiKey, endpoint: clientEndpoint } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    if (!mutationTypeIds || !Array.isArray(mutationTypeIds) || mutationTypeIds.length === 0) {
      return NextResponse.json({ error: "At least one mutation type ID is required" }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }
    
    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
    }
    
    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }
    
    if (process.env.DEBUG) {
      console.log(`Mutation request details:
      - provider: ${provider}
      - model: ${modelId}
      - endpoint: ${clientEndpoint}
      - API key present: ${Boolean(apiKey)}
      - mutation type IDs: ${mutationTypeIds.join(', ')}
      - mutation strength: ${mutationStrength}
      - number of mutations: ${numMutations}
      - max tokens: ${maxTokens}
    `);
    }
    
    const mutationTypes = await prisma.mutationType.findMany({
      where: { 
        id: { in: mutationTypeIds },
        userId: session.user.id
      },
    });

    if (mutationTypes.length !== mutationTypeIds.length) {
      const foundIds = mutationTypes.map(type => type.id);
      const missingIds = mutationTypeIds.filter(id => !foundIds.includes(id));
      return NextResponse.json({ 
        error: `Some mutation types were not found: ${missingIds.join(', ')}` 
      }, { status: 404 });
    }

    const normalizedProvider = provider.toLowerCase();
    if (!["openai", "anthropic", "mistral", "deepseek"].includes(normalizedProvider)) {
      return NextResponse.json({ error: `Unsupported provider: ${normalizedProvider}` }, { status: 400 });
    }

    const allMutationPromises = mutationTypes.map(async (mutationType) => {
      const baseSystemPrompt = getSystemPromptForMutation(mutationType.systemPrompt, mutationStrength);
      const systemPrompt = baseSystemPrompt + "It is very important that you only reply with the mutated prompt. No comments before or after, no introduction, not greetings, just the mutated prompt.";

      const typePromises = Array.from({ length: numMutations }, async () => {
        try {
          console.log(`Making API request to ${normalizedProvider} model: ${modelId} for mutation type: ${mutationType.name}`);
          const response = await callLLM({
            provider: provider,
            endpoint: clientEndpoint,
            prompt: prompt,
            systemPrompt: systemPrompt,
            modelId: modelId,
            apiKey: apiKey,
            maxTokens: maxTokens,
          });
          
          return {
            text: response.text || `[Empty response from ${normalizedProvider}]`,
            type: mutationType.name,
            strength: mutationStrength,
            tokens: response.usage?.outputTokens,
            cost: response.outputCost,
          };
        } catch (mutationError) {
          console.error(`Error generating mutation (${normalizedProvider}) for type ${mutationType.name}:`, mutationError);
          throw mutationError;  // throw the error again to properly fail the call
        }
      });

      return Promise.all(typePromises);
    });

    const mutationsByType = await Promise.all(allMutationPromises);
    
    const mutations = mutationsByType.flat().filter(Boolean) as { text: string; type: string; strength: number }[];

    if (mutations.length === 0 && numMutations > 0) {
      console.error("No mutations could be generated from the API calls");
      throw new Error("Failed to generate any mutations. Please check your API keys and model configuration.");
    }

    const sessionData = await prisma.promptSession.create({
      data: {
        userId: session.user.id,
        basePrompt: prompt,
        mutations: JSON.stringify(mutations),
        settings: JSON.stringify({
          mutationTypeIds,
          mutationStrength,
          numMutations,
          maxTokens,
          modelId,
          provider,
        }),
      },
    });

    return NextResponse.json({ mutations, sessionId: sessionData.id });
  } catch (error) {
    console.error("Mutation error:", error instanceof Error ? error.message : "Unknown error");
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to mutate prompt",
        details: "There was an error processing your mutation request. Please check your API keys and model configuration."
      },
      { status: 500 },
    );
  }
}