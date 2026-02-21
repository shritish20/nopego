import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(featured === 'true' && { isFeatured: true }),
    },
    include: {
      category: true,
      variants: true,
      reviews: { select: { rating: true, isPublished: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ products })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
