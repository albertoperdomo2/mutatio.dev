import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user?.email) {
    console.error("User email not found in session", session)
    return NextResponse.json({ error: "User session invalid" }, { status: 400 })
  }

  try {
    console.log(`Fetching model configs for user email: ${session.user.email}`)
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, modelConfigs: true },
    })

    if (!user) {
      console.error(`User not found for email: ${session.user.email}`)
      // return empty configs instead of error to prevent UI errors
      return NextResponse.json({ modelConfigs: {} })
    }

    console.log(`Found user with ID: ${user.id}, email: ${user.email}`)

    const modelConfigs = user.modelConfigs ? JSON.parse(user.modelConfigs) : {}
    console.log(`Parsed modelConfigs: ${Object.keys(modelConfigs).length} providers found`)

    const safeConfigs: Record<string, Record<string, any>> = {}

    for (const provider in modelConfigs) {
      safeConfigs[provider] = {}

      for (const modelId in modelConfigs[provider]) {
        const config = modelConfigs[provider][modelId]

        safeConfigs[provider][modelId] = {
          ...config,
          apiKey: config.apiKey ? true : false,
        }
      }
    }

    return NextResponse.json({ modelConfigs: safeConfigs })
  } catch (error) {
    console.error("Failed to retrieve model configurations:", error)
    // return empty configs instead of error to prevent UI errors
    return NextResponse.json({ modelConfigs: {} })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  if (!session.user?.email) {
    console.error("User email not found in session", session)
    return NextResponse.json({ error: "User session invalid" }, { status: 400 })
  }

  try {
    const { provider, modelId, displayName, endpoint, apiKey, role } = await req.json()

    if (!provider || !modelId || !displayName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (role !== "mutator" && role !== "validator" && role !== "both") {
      return NextResponse.json({ error: "Invalid role. Must be 'mutator', 'validator', or 'both'" }, { status: 400 })
    }

    console.log(`Saving model config for user email: ${session.user.email}, provider: ${provider}, model: ${modelId}`)
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, modelConfigs: true },
    })

    if (!user) {
      console.error(`User not found for email: ${session.user.email}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`Found user with ID: ${user.id}, email: ${user.email}`)

    const modelConfigs = user.modelConfigs ? JSON.parse(user.modelConfigs) : {}

    if (!modelConfigs[provider]) {
      modelConfigs[provider] = {}
    }

    const hasKey = apiKey === "stored-in-browser";

    modelConfigs[provider][modelId] = {
      displayName,
      endpoint: endpoint || null,
      apiKey: hasKey,
      role,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Updating user model configs for ID: ${user.id}`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { modelConfigs: JSON.stringify(modelConfigs) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save model configuration:", error)
    return NextResponse.json({ error: "Failed to save model configuration" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  if (!session.user?.email) {
    console.error("User email not found in session", session)
    return NextResponse.json({ error: "User session invalid" }, { status: 400 })
  }

  try {
    const { provider, modelId } = await req.json()

    if (!provider || !modelId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Deleting model config for user email: ${session.user.email}, provider: ${provider}, model: ${modelId}`)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, modelConfigs: true },
    })

    if (!user) {
      console.error(`User not found for email: ${session.user.email}`)
      return NextResponse.json({ success: true }) // return success even if user not found to prevent UI errors
    }

    console.log(`Found user with ID: ${user.id}, email: ${user.email}`)

    const modelConfigs = user.modelConfigs ? JSON.parse(user.modelConfigs) : {}

    if (!modelConfigs[provider] || !modelConfigs[provider][modelId]) {
      console.log(`Model configuration not found for provider: ${provider}, model: ${modelId}`)
      return NextResponse.json({ success: true }) // return success even if config not found to prevent UI errors
    }

    delete modelConfigs[provider][modelId]

    if (Object.keys(modelConfigs[provider]).length === 0) {
      delete modelConfigs[provider]
    }

    console.log(`Updating user model configs for ID: ${user.id}`)

    await prisma.user.update({
      where: { id: user.id },
      data: { modelConfigs: JSON.stringify(modelConfigs) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete model configuration:", error)
    return NextResponse.json({ error: "Failed to delete model configuration" }, { status: 500 })
  }
}