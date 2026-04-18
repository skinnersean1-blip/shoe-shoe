import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!user || !ADMIN_ROLES.includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const [totalListings, pendingReview, flaggedListings, totalTrades, activeUsers, openDisputes] = await Promise.all([
      prisma.shoe.count({ where: { status: "AVAILABLE", moderationStatus: "APPROVED" } }),
      prisma.shoe.count({ where: { moderationStatus: "PENDING_REVIEW" } }),
      prisma.shoe.count({ where: { moderationStatus: "FLAGGED" } }),
      prisma.transaction.count(),
      prisma.user.count(),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "PENDING"] as any[] } } }),
    ])

    return NextResponse.json({ totalListings, pendingReview, flaggedListings, totalTrades, activeUsers, openDisputes })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
