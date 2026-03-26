import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/admin/shoes — fetch listings pending moderation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const moderationStatus = searchParams.get("moderationStatus") || "PENDING_REVIEW"

    const shoes = await prisma.shoe.findMany({
      where: { moderationStatus: moderationStatus as any },
      include: {
        seller: { select: { id: true, name: true, username: true, email: true, trustScore: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(shoes)
  } catch (error) {
    console.error("Error fetching moderation queue:", error)
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 })
  }
}

// PATCH /api/admin/shoes — approve or flag a listing
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { shoeId, action } = await request.json()

    const moderationStatusMap: Record<string, string> = {
      approve: "APPROVED",
      flag:    "FLAGGED",
      reject:  "REJECTED",
    }

    const newStatus = moderationStatusMap[action]
    if (!newStatus) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const shoe = await prisma.shoe.update({
      where: { id: shoeId },
      data: {
        moderationStatus: newStatus as any,
        moderatedBy: session.user.id,
        moderatedAt: new Date(),
        // Auto-approve makes listing available; flag/reject removes from browsing
        status: action === "approve" ? "AVAILABLE" : undefined,
      },
    })

    // Notify seller of moderation decision
    const notifType = action === "approve" ? "MODERATION_APPROVED" : "MODERATION_FLAGGED"
    await prisma.notification.create({
      data: {
        userId: shoe.sellerId,
        type: notifType as any,
        title: action === "approve" ? "Your listing is live!" : "Your listing needs attention",
        message: action === "approve"
          ? `Your drop "${shoe.brand}" has been approved and is now live.`
          : `Your drop "${shoe.brand}" has been flagged for review. Check your listing.`,
      },
    })

    return NextResponse.json(shoe)
  } catch (error) {
    console.error("Error updating moderation status:", error)
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 })
  }
}
