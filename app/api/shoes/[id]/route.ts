import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shoe = await prisma.shoe.findUnique({
      where: {
        id: params.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 })
    }

    return NextResponse.json(shoe)
  } catch (error) {
    console.error("Error fetching shoe:", error)
    return NextResponse.json(
      { error: "Failed to fetch shoe" },
      { status: 500 }
    )
  }
}
