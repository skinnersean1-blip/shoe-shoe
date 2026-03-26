import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Credit values per condition
const CREDIT_VALUES: Record<string, number> = {
  NEW:      450,
  LIKE_NEW: 300,
  GOOD:     150,
  FAIR:     100,
  WORN:     50,
}

const shoeSchema = z.object({
  type:        z.enum(["SINGLE", "PAIR"]),
  listingType: z.enum(["sell", "trade", "donate"]).optional().default("sell"),
  brand:       z.string().min(1),
  year:        z.number().min(2000).max(new Date().getFullYear() + 1),
  color:       z.string().min(1).optional().default(""),
  size:        z.string().min(1),
  ageGroup:    z.enum(["BABY", "TODDLER", "YOUTH"]).optional(),
  condition:   z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "WORN"]),
  description: z.string().max(500).optional().default(""),
  price:       z.number().min(0).optional().default(0),
  images:      z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = shoeSchema.parse(body)

    const listingTypeMap: Record<string, "SELL" | "TRADE" | "DONATE"> = {
      sell: "SELL", trade: "TRADE", donate: "DONATE",
    }

    const creditValue = CREDIT_VALUES[validatedData.condition] ?? 0

    const shoe = await prisma.shoe.create({
      data: {
        sellerId:        session.user.id,
        type:            validatedData.type,
        listingType:     listingTypeMap[validatedData.listingType],
        brand:           validatedData.brand,
        year:            validatedData.year,
        color:           validatedData.color,
        size:            validatedData.size,
        ageGroup:        validatedData.ageGroup ?? null,
        condition:       validatedData.condition,
        description:     validatedData.description,
        price:           validatedData.price,
        images:          validatedData.images,
        creditValue,
        status:          "AVAILABLE",
        moderationStatus: "PENDING_REVIEW",
      },
    })

    return NextResponse.json(shoe, { status: 201 })
  } catch (error) {
    console.error("Error creating shoe:", error)
    return NextResponse.json({ error: "Failed to create shoe listing" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type        = searchParams.get("type")
    const status      = searchParams.get("status") || "AVAILABLE"
    const ageGroup    = searchParams.get("ageGroup")
    const condition   = searchParams.get("condition")
    const listingType = searchParams.get("listingType")
    const limit       = searchParams.get("limit")
    const modStatus   = searchParams.get("moderationStatus")

    const where: Record<string, unknown> = { status }

    if (type === "SINGLE" || type === "PAIR") where.type = type
    if (ageGroup)    where.ageGroup    = ageGroup
    if (condition)   where.condition   = condition
    if (listingType) where.listingType = listingType.toUpperCase()

    // Only show APPROVED listings in public feed (unless admin requests otherwise)
    if (!modStatus) {
      where.moderationStatus = "APPROVED"
    } else {
      where.moderationStatus = modStatus
    }

    const shoes = await prisma.shoe.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: parseInt(limit) } : {}),
    })

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching shoes:", error)
    return NextResponse.json({ error: "Failed to fetch shoes" }, { status: 500 })
  }
}
