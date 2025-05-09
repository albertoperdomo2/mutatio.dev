import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RouteParams } from '@/types/api'

export async function GET(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            responses: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    return NextResponse.json({ savedMutation })
  } catch (error) {
    console.error("Failed to fetch saved mutation:", error)
    return NextResponse.json({ error: "Failed to fetch saved mutation" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const { name, description, starred, tags } = await req.json()

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    if (name && name !== savedMutation.name) {
      const existingWithName = await prisma.savedMutation.findFirst({
        where: {
          userId: session.user.id,
          name,
          id: { not: id },
        },
      })

      if (existingWithName) {
        return NextResponse.json({ error: "A mutation with this name already exists" }, { status: 400 })
      }
    }

    const updatedMutation = await prisma.savedMutation.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        starred: starred !== undefined ? starred : undefined,
        tags: tags !== undefined ? JSON.stringify(tags) : undefined,
        updatedAt: new Date(),
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json({ savedMutation: updatedMutation })
  } catch (error) {
    console.error("Failed to update saved mutation:", error)
    return NextResponse.json({ error: "Failed to update saved mutation" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    await prisma.savedMutation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete saved mutation:", error)
    return NextResponse.json({ error: "Failed to delete saved mutation" }, { status: 500 })
  }
}