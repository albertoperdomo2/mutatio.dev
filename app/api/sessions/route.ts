import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const starred = url.searchParams.get("starred") === "true"
    const search = url.searchParams.get("search") || ""

    // calculate pagination
    const skip = (page - 1) * limit

    // build the where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (url.searchParams.has("starred")) {
      where.starred = starred
    }

    if (search) {
      where.basePrompt = {
        contains: search,
        mode: "insensitive",
      }
    }

    // get sessions with pagination
    const sessions = await prisma.promptSession.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    })

    // get total count for pagination
    const totalCount = await prisma.promptSession.count({ where })

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { basePrompt, mutations, settings } = await req.json()

    if (!basePrompt || !mutations || !settings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const promptSession = await prisma.promptSession.create({
      data: {
        userId: session.user.id,
        basePrompt,
        mutations: JSON.stringify(mutations),
        settings: JSON.stringify(settings),
      },
    })

    return NextResponse.json({ session: promptSession })
  } catch (error) {
    console.error("Failed to create session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}