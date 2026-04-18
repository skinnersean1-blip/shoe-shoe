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

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, creditBalance: true, trustScore: true, role: true, createdAt: true,
        _count: { select: { shoesListed: true, sales: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!me || !["ADMIN", "SUPER_ADMIN"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { userId, creditAdjustment, trustScore, role } = await request.json()
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (typeof creditAdjustment === "number") data.creditBalance = { increment: creditAdjustment }
    if (typeof trustScore === "number") data.trustScore = Math.min(5, Math.max(0, trustScore))
    if (role) data.role = role

    if (typeof creditAdjustment === "number") {
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { creditBalance: { increment: creditAdjustment } } }),
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditAdjustment,
            reason: `Admin adjustment by ${session.user.email ?? session.user.id}`,
          },
        }),
      ])
    } else {
      await prisma.user.update({ where: { id: userId }, data })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Admin user patch error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
