import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"]

const CONFIG_KEYS = ["creditMultiplier", "shippingFee", "commissionPct", "maintenanceMode", "maxListingsPerUser", "minListingPrice"]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!me || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const rows = await prisma.systemConfig.findMany({ where: { key: { in: CONFIG_KEYS } } })
    const config: Record<string, unknown> = {}
    for (const row of rows) {
      try { config[row.key] = JSON.parse(row.value) } catch { config[row.key] = row.value }
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error("Admin config GET error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!me || !ADMIN_ROLES.includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const ops = CONFIG_KEYS.filter(k => k in body).map(key =>
      prisma.systemConfig.upsert({
        where: { key },
        create: { key, value: JSON.stringify(body[key]) },
        update: { value: JSON.stringify(body[key]) },
      })
    )
    await prisma.$transaction(ops)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Admin config PUT error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
