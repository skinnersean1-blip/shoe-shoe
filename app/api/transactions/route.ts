import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const transactionSchema = z.object({
  shoeId: z.string(),
  offerPrice: z.number().optional(),
  buyerName: z.string().optional(),
  buyerEmail: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // Check if shoe exists and is available
    const shoe = await prisma.shoe.findUnique({
      where: { id: validatedData.shoeId },
    })

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 })
    }

    if (shoe.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Shoe is no longer available" },
        { status: 400 }
      )
    }

    // Prevent seller from buying their own shoe
    if (session?.user?.id === shoe.sellerId) {
      return NextResponse.json(
        { error: "You cannot buy your own shoe" },
        { status: 400 }
      )
    }

    // For guest buyers, name and email are required
    if (!session && (!validatedData.buyerName || !validatedData.buyerEmail)) {
      return NextResponse.json(
        { error: "Guest buyers must provide name and email" },
        { status: 400 }
      )
    }

    const isCounteroffer = validatedData.offerPrice && validatedData.offerPrice !== shoe.price
    const finalPrice = validatedData.offerPrice || shoe.price

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        shoeId: validatedData.shoeId,
        sellerId: shoe.sellerId,
        buyerId: session?.user?.id,
        buyerName: validatedData.buyerName,
        buyerEmail: validatedData.buyerEmail,
        offerPrice: isCounteroffer ? validatedData.offerPrice : undefined,
        finalPrice,
        status: isCounteroffer ? "COUNTEROFFER" : "PENDING",
        serviceFee: 0.99,
      },
    })

    // Update shoe status
    await prisma.shoe.update({
      where: { id: validatedData.shoeId },
      data: { status: "PENDING_SALE" },
    })

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: shoe.sellerId,
        transactionId: transaction.id,
        type: isCounteroffer ? "COUNTEROFFER_RECEIVED" : "SALE_INITIATED",
        title: isCounteroffer ? "Counteroffer Received" : "New Sale Request",
        message: isCounteroffer
          ? `Buyer offered $${validatedData.offerPrice} for your ${shoe.brand} shoe (asking $${shoe.price})`
          : `Buyer accepted your asking price of $${shoe.price} for your ${shoe.brand} shoe`,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
