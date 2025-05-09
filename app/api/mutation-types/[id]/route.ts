import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params;

    const existingType = await prisma.mutationType.findUnique({
      where: { id },
    })

    if (!existingType) {
      return NextResponse.json({ error: "Mutation type not found" }, { status: 404 })
    }

    if (existingType.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, description, systemPrompt } = await req.json()

    if (!name || !systemPrompt) {
      return NextResponse.json({ error: "Name and system prompt are required" }, { status: 400 })
    }

    if (name !== existingType.name) {
      const nameConflict = await prisma.mutationType.findFirst({
        where: {
          userId: session.user.id,
          name,
          id: { not: id },
        },
      })

      if (nameConflict) {
        return NextResponse.json({ error: "A mutation type with this name already exists" }, { status: 400 })
      }
    }

    const mutationType = await prisma.mutationType.update({
      where: { id },
      data: {
        name,
        description,
        systemPrompt,
      },
    })

    return NextResponse.json({ mutationType })
  } catch (error) {
    console.error("Failed to update mutation type:", error)
    return NextResponse.json({ error: "Failed to update mutation type" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params;
    const mutationType = await prisma.mutationType.findUnique({
      where: { id },
    })

    if (!mutationType) {
      return NextResponse.json({ error: "Mutation type not found" }, { status: 404 })
    }

    if (mutationType.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ mutationType })
  } catch (error) {
    console.error("Failed to fetch mutation type:", error)
    return NextResponse.json({ error: "Failed to fetch mutation type" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params;
    const existingType = await prisma.mutationType.findUnique({
      where: { id },
    })

    if (!existingType) {
      return NextResponse.json({ error: "Mutation type not found" }, { status: 404 })
    }

    if (existingType.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (existingType.isDefault) {
      const typeCount = await prisma.mutationType.count({
        where: { userId: session.user.id },
      })

      if (typeCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last default mutation type" }, { status: 400 })
      }
    }

    await prisma.mutationType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete mutation type:", error)
    return NextResponse.json({ error: "Failed to delete mutation type" }, { status: 500 })
  }
}