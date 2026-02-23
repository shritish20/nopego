import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.response) return auth.response
  const coupons = await prisma.coupon.findMany({
    include: { influencer: { select: { name: true, handle: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response
  try {
    const body = await req.json()
    if (!body.code || !body.discountType || !body.discountValue) {
      return NextResponse.json({ error: 'code, discountType, and discountValue are required' }, { status: 400 })
    }
    const existing = await prisma.coupon.findUnique({ where: { code: body.code.toUpperCase() } })
    if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        discountType: body.discountType,
        discountValue: parseFloat(body.discountValue),
        minOrderValue: parseFloat(body.minOrderValue || '0'),
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        influencerId: body.influencerId || null,
        isActive: true,
      },
      include: { influencer: { select: { name: true, handle: true } } },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
