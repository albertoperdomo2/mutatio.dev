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
    const mutationTypes = await prisma.mutationType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ mutationTypes })
  } catch (error) {
    console.error("Failed to fetch mutation types:", error)
    return NextResponse.json({ error: "Failed to fetch mutation types" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, description, systemPrompt } = await req.json()

    if (!name || !systemPrompt) {
      return NextResponse.json({ error: "Name and system prompt are required" }, { status: 400 })
    }

    const existingType = await prisma.mutationType.findFirst({
      where: {
        userId: session.user.id,
        name,
      },
    })

    if (existingType) {
      return NextResponse.json({ error: "A mutation type with this name already exists" }, { status: 400 })
    }

    const mutationType = await prisma.mutationType.create({
      data: {
        userId: session.user.id,
        name,
        description,
        systemPrompt,
        isDefault: false,
      },
    })

    return NextResponse.json({ mutationType })
  } catch (error) {
    console.error("Failed to create mutation type:", error)
    return NextResponse.json({ error: "Failed to create mutation type" }, { status: 500 })
  }
}