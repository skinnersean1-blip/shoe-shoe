import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const ratingSchema = z.object({
  transactionId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = ratingSchema.parse(body)

    const transaction = await prisma.transaction.findUnique({
      where: { id: validatedData.transactionId },
      include: { shoe: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Check if user is the buyer
    const isBuyer =
      session?.user?.id === transaction.buyerId ||
      session?.user?.email === transaction.buyerEmail

    if (!isBuyer) {
      return NextResponse.json(
        { error: "Only buyers can rate transactions" },
        { status: 403 }
      )
    }

    // Check if transaction is delivered
    if (transaction.status !== "DELIVERED" && transaction.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Transaction must be delivered before rating" },
        { status: 400 }
      )
    }

    // Check if already rated
    const existingRating = await prisma.rating.findUnique({
      where: {
        transactionId_raterId: {
          transactionId: validatedData.transactionId,
          raterId: session!.user!.id,
        },
      },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: "You have already rated this transaction" },
        { status: 400 }
      )
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        transactionId: validatedData.transactionId,
        raterId: session!.user!.id,
        ratedUserId: transaction.sellerId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
    })

    // Update transaction status to COMPLETED
    await prisma.transaction.update({
      where: { id: validatedData.transactionId },
      data: { status: "COMPLETED" },
    })

    // Update shoe status to SOLD
    await prisma.shoe.update({
      where: { id: transaction.shoeId },
      data: { status: "SOLD" },
    })

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: transaction.sellerId,
        transactionId: transaction.id,
        type: "RATING_RECEIVED",
        title: "New Rating Received",
        message: `You received a ${validatedData.rating}-star rating for ${transaction.shoe.brand}`,
      },
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error("Error creating rating:", error)
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    )
  }
}
