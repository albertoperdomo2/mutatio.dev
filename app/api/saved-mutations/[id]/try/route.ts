import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RouteParams } from '@/types/api'
import { callLLM } from "@/services/llm/index"

export async function POST(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const { prompt, versionId, modelId, provider, apiKey, endpoint } = await req.json()

    if (!prompt || !modelId || !provider) {
      return NextResponse.json({ error: "Prompt, model ID, and provider are required" }, { status: 400 })
    }

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    if (versionId) {
      const version = await prisma.savedMutationVersion.findFirst({
        where: {
          id: versionId,
          savedMutationId: id,
        },
      })

      if (!version) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 })
      }
    }

    let text: string = '';
    const metadata: Record<string, unknown> = {}
    const startTime = Date.now()

    try {
      const providerLower = provider.toLowerCase();
      console.log(`Processing provider: ${providerLower}, modelId: ${modelId}`)
      const response = await callLLM({
        provider: providerLower,
        prompt: prompt, 
        modelId: modelId,
        apiKey: apiKey, 
        endpoint: endpoint,
        temperature: 0.7,
        maxTokens: 1024,
      });

      metadata.latency = Date.now() - startTime
      metadata.timestamp = new Date().toISOString()
      metadata.success = true
      text = response.text

    } catch (error) {
      const apiError = error as Error;
      console.error(`Error calling ${provider} API:`, apiError);
      
      const errorMessage = apiError instanceof Error 
        ? apiError.message 
        : 'Unknown API error';
      
      metadata.error = errorMessage;
      metadata.latency = Date.now() - startTime;
      metadata.timestamp = new Date().toISOString();
      metadata.success = false;
      text = `Error: ${errorMessage}`;
    }

    const mutationResponse = await prisma.mutationResponse.create({
      data: {
        savedMutationId: id,
        savedMutationVersionId: versionId || null,
        prompt,
        modelId,
        provider,
        response: text,
        metadata: JSON.stringify(metadata),
      },
    })

    return NextResponse.json({ 
      text,
      metadata,
      id: mutationResponse.id 
    })
  } catch (error) {
    console.error("Failed to try saved mutation:", error)
    return NextResponse.json({ error: "Failed to try saved mutation" }, { status: 500 })
  }
}