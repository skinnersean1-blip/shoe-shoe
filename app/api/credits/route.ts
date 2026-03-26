import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/credits — fetch current user's credit balance + transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [user, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { creditBalance: true },
      }),
      prisma.creditTransaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ])

    return NextResponse.json({
      balance: user?.creditBalance ?? 0,
      transactions,
    })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}

// POST /api/credits — award credits to current user (used internally by other routes)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, reason, shoeId } = await request.json()

    if (!amount || !reason) {
      return NextResponse.json({ error: "amount and reason are required" }, { status: 400 })
    }

    const [creditTx, user] = await prisma.$transaction([
      prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          amount,
          reason,
          shoeId: shoeId ?? null,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { creditBalance: { increment: amount } },
        select: { creditBalance: true },
      }),
    ])

    return NextResponse.json({ creditTx, newBalance: user.creditBalance }, { status: 201 })
  } catch (error) {
    console.error("Error creating credit transaction:", error)
    return NextResponse.json({ error: "Failed to process credits" }, { status: 500 })
  }
}
