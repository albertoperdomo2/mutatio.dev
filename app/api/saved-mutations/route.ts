import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const savedMutations = await prisma.savedMutation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json({ savedMutations })
  } catch (error) {
    console.error("Failed to fetch saved mutations:", error)
    return NextResponse.json({ error: "Failed to fetch saved mutations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, originalPrompt, prompt, tags } = await req.json()

    if (!name || !originalPrompt || !prompt) {
      return NextResponse.json({ error: "Name, original prompt, and prompt are required" }, { status: 400 })
    }

    const existingMutation = await prisma.savedMutation.findFirst({
      where: {
        userId: session.user.id,
        name,
      },
    })

    if (existingMutation) {
      return NextResponse.json({ error: "A mutation with this name already exists" }, { status: 400 })
    }

    const savedMutation = await prisma.savedMutation.create({
      data: {
        userId: session.user.id,
        name,
        description,
        originalPrompt,
        tags: tags ? JSON.stringify(tags) : null,
        versions: {
          create: {
            versionNumber: 1,
            prompt,
          },
        },
      },
      include: {
        versions: true,
      },
    })

    return NextResponse.json({ savedMutation })
  } catch (error) {
    console.error("Failed to create saved mutation:", error)
    return NextResponse.json({ error: "Failed to create saved mutation" }, { status: 500 })
  }
}