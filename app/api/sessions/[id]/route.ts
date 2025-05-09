import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const promptSession = await prisma.promptSession.findUnique({
      where: { id: params.id },
    })

    if (!promptSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (promptSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ session: promptSession })
  } catch (error) {
    console.error("Failed to fetch session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingSession = await prisma.promptSession.findUnique({
      where: { id: params.id },
    })

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { starred } = await req.json()

    const updatedSession = await prisma.promptSession.update({
      where: { id: params.id },
      data: {
        starred: starred !== undefined ? starred : existingSession.starred,
      },
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error("Failed to update session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingSession = await prisma.promptSession.findUnique({
      where: { id: params.id },
    })

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.promptSession.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete session:", error)
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
