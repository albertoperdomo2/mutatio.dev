import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DEFAULT_MUTATION_TYPES } from "@/lib/mutation-types"

// seed default mutation types for a user
export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingTypes = await prisma.mutationType.findMany({
      where: { userId: session.user.id },
    })

    if (existingTypes.length > 0) {
      return NextResponse.json({ mutationTypes: existingTypes })
    }

    const mutationTypes = await Promise.all(
      DEFAULT_MUTATION_TYPES.map((type) =>
        prisma.mutationType.create({
          data: {
            userId: session.user.id,
            name: type.name,
            description: type.description,
            systemPrompt: type.systemPrompt,
            isDefault: true,
          },
        }),
      ),
    )

    return NextResponse.json({ mutationTypes })
  } catch (error) {
    console.error("Failed to seed mutation types:", error)
    return NextResponse.json({ error: "Failed to seed mutation types" }, { status: 500 })
  }
}