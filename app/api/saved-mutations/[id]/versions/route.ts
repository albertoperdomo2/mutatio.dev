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
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    const versions = await prisma.savedMutationVersion.findMany({
      where: {
        savedMutationId: id,
      },
      orderBy: { versionNumber: "desc" },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error("Failed to fetch versions:", error)
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const { prompt, notes } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const savedMutation = await prisma.savedMutation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    })

    if (!savedMutation) {
      return NextResponse.json({ error: "Saved mutation not found" }, { status: 404 })
    }

    // calculate next version number
    const latestVersion = savedMutation.versions[0]
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1

    const newVersion = await prisma.savedMutationVersion.create({
      data: {
        savedMutationId: id,
        versionNumber: newVersionNumber,
        prompt,
        notes,
      },
    })

    await prisma.savedMutation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ version: newVersion })
  } catch (error) {
    console.error("Failed to create version:", error)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}