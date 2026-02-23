import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAbandonedCartWA, sendAbandonedCartDiscountWA } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const carts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: oneHourAgo },
      customer: {
        phone: { not: null },
        whatsappOptIn: true,
      },
      items: { some: {} },
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    take: 50,
  })

  let firstReminders = 0
  let discountReminders = 0

  for (const cart of carts) {
    if (!cart.customer?.phone || cart.items.length === 0) continue

    if (!cart.recoveryWASentAt) {
      // First reminder — gentle nudge
      await sendAbandonedCartWA(
        cart.customer.phone,
        cart.customer.name
      ).catch(console.error)

      await prisma.cart.update({
        where: { id: cart.id },
        data: { recoveryWASentAt: new Date() },
      })
      firstReminders++
    } else if (cart.recoveryWASentAt <= oneDayAgo && !cart.recoveryEmailSentAt) {
      // Second reminder (24h later) — discount code
      const code = `BACK${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      await prisma.coupon.create({
        data: {
          code,
          discountType: 'PERCENT',
          discountValue: 5,
          maxUses: 1,
          expiresAt: new Date(Date.now() + 86_400_000), // 24 hours
        },
      })

      await sendAbandonedCartDiscountWA(cart.customer.phone, {
        customerName: cart.customer.name,
        couponCode: code,
        discount: '5%',
      }).catch(console.error)

      await prisma.cart.update({
        where: { id: cart.id },
        data: { recoveryEmailSentAt: new Date() },
      })
      discountReminders++
    }
  }

  return NextResponse.json({ success: true, firstReminders, discountReminders })
}
