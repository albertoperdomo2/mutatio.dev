import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { callLLM } from "@/services/llm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { originalPrompt, mutatedPrompts, modelId, provider, apiKey } = await req.json()

    // TODO refactor this checks
    if (!originalPrompt) {
      return NextResponse.json({ error: "Original prompt is required" }, { status: 400 })
    }
    
    if (!mutatedPrompts || !Array.isArray(mutatedPrompts) || mutatedPrompts.length === 0) {
      return NextResponse.json({ error: "Mutated prompts are required" }, { status: 400 })
    }
    
    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }
    
    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    const normalizedProvider = provider.toLowerCase();
    if (!["openai", "anthropic", "mistral", "deepseek"].includes(normalizedProvider)) {
      return NextResponse.json({ error: `Unsupported provider: ${normalizedProvider}` }, { status: 400 });
    }
    
    console.log(`Validation request with provider: ${normalizedProvider}, modelId: ${modelId}`);
    console.log(`API key present: ${Boolean(apiKey)}`);
    console.log(`Validating ${mutatedPrompts.length} mutations`);

    const validations = []
    for (const mutatedPrompt of mutatedPrompts) {
      try {
        const systemPrompt = `You are a prompt evaluation expert with high standards. Your task is to analyze the mutated prompt compared to the original prompt and provide your evaluation in JSON format only. 

CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object itself with NO surrounding code blocks, quotes, or backticks
2. Do not use markdown formatting around the JSON
3. Do not include the word "json" or any other text before or after the JSON
4. Start your response with the opening curly brace { and end with the closing curly brace }

IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or markdown before or after. The JSON should include the following fields:

- semanticPreservation: score from 1-10, up to one decimal
- semanticExplanation: brief explanation of semantic preservation
- clarity: score from 1-10, up to one decimal
- clarityExplanation: brief explanation of clarity and specificity
- improvementPotential: score from 1-10, up to one decimal
- improvementExplanation: brief explanation of potential for improved LLM responses
- risks: score from 1-10, up to one decimal
- risksExplanation: brief explanation of potential issues or hallucination risks
- overallScore: weighted average of all scores computed as (semanticPreservation + clarity + (10 − improvementPotential) + (10 − risks)) / 4

So the response structure is:
{
  "semanticPreservation": <number>,
  "semanticExplanation": "<explanation>",
  "clarity": <number>,
  "clarityExplanation": "<explanation>", 
  "improvementPotential": <number>,
  "improvementExplanation": "<explanation>",
  "risks": <number>,
  "risksExplanation": "<explanation>",
  "overallScore": <number>
}`;
        
        const userPrompt = `Original prompt: "${originalPrompt}"
Mutated prompt: "${mutatedPrompt.text}"
                  
Provide your evaluation:`;

        console.log(`Making validation API request to ${normalizedProvider} model: ${modelId}`);

        const evaluation = await callLLM({
          provider: provider,
          modelId: modelId,
          prompt: userPrompt,
          systemPrompt: systemPrompt,
          apiKey: apiKey,
        });

        validations.push({
          mutationId: mutatedPrompt.id,
          evaluation,
        });
      } catch (validationError) {
        console.error("Error validating prompt:", validationError instanceof Error ? validationError.message : validationError);
        throw validationError; // throw the error again to properly fail the call
      }
    }

    if (validations.length === 0 && mutatedPrompts.length > 0) {
      console.error("No validations could be generated from the API calls");
      throw new Error("Failed to generate any validations. Please check your API key and model configuration.");
    }

    return NextResponse.json({ validations });
  } catch (error) {
    console.error("Validation error:", error instanceof Error ? error.message : "Unknown error");
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to validate prompts",
        details: "There was an error processing your validation request. Please check your API keys and model configuration."
      },
      { status: 500 },
    );
  }
}