import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const shoeSchema = z.object({
  type: z.enum(["SINGLE", "PAIR"]),
  brand: z.string().min(1),
  year: z.number().min(2000).max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  size: z.string().min(1),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "WORN"]),
  description: z.string().min(1).max(500),
  price: z.number().min(0.01),
  images: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = shoeSchema.parse(body)

    const shoe = await prisma.shoe.create({
      data: {
        sellerId: session.user.id,
        type: validatedData.type,
        brand: validatedData.brand,
        year: validatedData.year,
        color: validatedData.color,
        size: validatedData.size,
        condition: validatedData.condition,
        description: validatedData.description,
        price: validatedData.price,
        images: validatedData.images,
        status: "AVAILABLE",
      },
    })

    return NextResponse.json(shoe, { status: 201 })
  } catch (error) {
    console.error("Error creating shoe:", error)
    return NextResponse.json(
      { error: "Failed to create shoe listing" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "AVAILABLE"

    const where: any = {
      status,
    }

    if (type === "SINGLE" || type === "PAIR") {
      where.type = type
    }

    const shoes = await prisma.shoe.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching shoes:", error)
    return NextResponse.json(
      { error: "Failed to fetch shoes" },
      { status: 500 }
    )
  }
}
