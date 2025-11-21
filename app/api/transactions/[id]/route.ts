import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  action: z.enum(["accept", "reject", "ship", "confirm_delivery"]),
  trackingNumber: z.string().optional(),
  shippingMethod: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        shoe: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = updateSchema.parse(body)
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { shoe: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    let updatedTransaction

    switch (validatedData.action) {
      case "accept":
        // Seller accepts counteroffer or buyer accepts seller's terms
        if (session?.user?.id !== transaction.sellerId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            status: "ACCEPTED",
          },
        })

        await prisma.notification.create({
          data: {
            userId: transaction.buyerId || "",
            transactionId: transaction.id,
            type: "OFFER_ACCEPTED",
            title: "Offer Accepted!",
            message: `The seller accepted your offer for ${transaction.shoe.brand}`,
          },
        })
        break

      case "reject":
        // Seller rejects counteroffer
        if (session?.user?.id !== transaction.sellerId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            status: "CANCELLED",
          },
        })

        await prisma.shoe.update({
          where: { id: transaction.shoeId },
          data: { status: "AVAILABLE" },
        })
        break

      case "ship":
        // Seller confirms shipment
        if (session?.user?.id !== transaction.sellerId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            status: "SHIPPED",
            trackingNumber: validatedData.trackingNumber,
            shippingMethod: validatedData.shippingMethod,
            shippedAt: new Date(),
          },
        })

        await prisma.notification.create({
          data: {
            userId: transaction.buyerId || "",
            transactionId: transaction.id,
            type: "SHIPMENT_CONFIRMED",
            title: "Order Shipped!",
            message: `Your ${transaction.shoe.brand} has been shipped${
              validatedData.trackingNumber
                ? ` - Tracking: ${validatedData.trackingNumber}`
                : ""
            }`,
          },
        })
        break

      case "confirm_delivery":
        // Buyer confirms delivery
        const buyerId = session?.user?.id
        if (
          buyerId !== transaction.buyerId &&
          session?.user?.email !== transaction.buyerEmail
        ) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        })

        await prisma.notification.create({
          data: {
            userId: transaction.sellerId,
            transactionId: transaction.id,
            type: "DELIVERY_CONFIRMED",
            title: "Delivery Confirmed",
            message: `Buyer confirmed delivery of ${transaction.shoe.brand}`,
          },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    )
  }
}
