import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()
    if (!code) return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })

    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true },
    })

    if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order ₹${coupon.minOrderValue} required for this coupon` },
        { status: 400 },
      )
    }

    const discount =
      coupon.discountType === 'PERCENTAGE'
        ? Math.round((subtotal * coupon.discountValue) / 100)
        : coupon.discountValue

    return NextResponse.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    })
  } catch (error) {
    console.error('Coupon validate error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
