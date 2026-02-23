import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: 'code and subtotal are required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) return NextResponse.json({ error: 'Coupon code not found' }, { status: 400 })
    if (!coupon.isActive) return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` },
        { status: 400 }
      )
    }

    let discount = 0
    if (coupon.discountType === 'PERCENT') {
      discount = Math.round((subtotal * coupon.discountValue) / 100)
    } else if (coupon.discountType === 'FLAT') {
      discount = Math.min(coupon.discountValue, subtotal)
    }

    return NextResponse.json({
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Validation failed' }, { status: 500 })
  }
}
