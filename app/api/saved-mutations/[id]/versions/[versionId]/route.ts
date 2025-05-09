import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteParams {
  params: {
    id: string
    versionId: string
  }
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, versionId } = params

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    const version = await prisma.savedMutationVersion.findUnique({
      where: {
        id: versionId,
        savedMutationId: id,
      },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    return NextResponse.json({ version })
  } catch (error) {
    console.error("Failed to fetch version:", error)
    return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, versionId } = params
    const { notes } = await req.json()

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    const updatedVersion = await prisma.savedMutationVersion.update({
      where: {
        id: versionId,
        savedMutationId: id,
      },
      data: {
        notes,
      },
    })

    return NextResponse.json({ version: updatedVersion })
  } catch (error) {
    console.error("Failed to update version:", error)
    return NextResponse.json({ error: "Failed to update version" }, { status: 500 })
  }
}