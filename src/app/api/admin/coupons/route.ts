import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { influencer: true },
  })
  return NextResponse.json({ coupons })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const data = await req.json()
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: parseFloat(data.discountValue),
      minOrderValue: parseFloat(data.minOrderValue ?? 0),
      maxUses: data.maxUses ? parseInt(data.maxUses) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      influencerId: data.influencerId || null,
    },
  })
  return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
