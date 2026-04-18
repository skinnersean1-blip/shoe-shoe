import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!me || !ADMIN_ROLES.includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const disputes = await prisma.dispute.findMany({
      include: {
        transaction: {
          include: {
            shoe: { select: { brand: true, size: true, images: true } },
            seller: { select: { name: true, email: true } },
            buyer: { select: { name: true, email: true } },
          },
        },
        reporter: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(disputes)
  } catch (error) {
    console.error("Admin disputes error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!me || !ADMIN_ROLES.includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { disputeId, outcome, resolution } = await request.json()
    if (!disputeId || !outcome) return NextResponse.json({ error: "disputeId and outcome required" }, { status: 400 })

    const statusMap: Record<string, string> = { refund: "RESOLVED", complete: "RESOLVED", close: "CLOSED" }
    const newStatus = statusMap[outcome]
    if (!newStatus) return NextResponse.json({ error: "Invalid outcome" }, { status: 400 })

    await prisma.dispute.update({
      where: { id: disputeId },
      data: { status: newStatus as any, resolution: resolution || outcome },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Admin dispute patch error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
