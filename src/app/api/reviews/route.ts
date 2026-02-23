import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReviewSchema } from '@/lib/schemas'
import { limiters } from '@/lib/rateLimit'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer') {
    return NextResponse.json(
      { error: 'Please login to submit a review' },
      { status: 401 }
    )
  }

  // Rate limit: 5 reviews per hour per user
  const rl = limiters.review(session.user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'You have submitted too many reviews recently. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const data = ReviewSchema.parse(body)

    const existing = await prisma.review.findFirst({
      where: { productId: data.productId, customerId: session.user.id },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        customerId: session.user.id,
        rating: data.rating,
        title: data.title?.trim() || null,
        body: data.body.trim(),
        isPublished: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted and will appear after approval.',
      review: { id: review.id },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    console.error('Review submit error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
