import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true, customer: true },
  })
  return NextResponse.json({ reviews })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
