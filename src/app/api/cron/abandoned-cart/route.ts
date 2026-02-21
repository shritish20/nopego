import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAbandonedCartReminder, sendAbandonedCartDiscount } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  try {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // First reminder: 1 hour after abandonment
  const firstReminderCarts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: oneHourAgo },
      items: { some: {} },
      recoveryWASentAt: null,
      customer: { whatsappOptIn: true, phone: { not: null } },
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  })

  for (const cart of firstReminderCarts) {
    if (!cart.customer?.phone) continue
    const items = cart.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')
    await sendAbandonedCartReminder(cart.customer.phone, {
      customerName: cart.customer.name,
      cartUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      items,
    })
    await prisma.cart.update({ where: { id: cart.id }, data: { recoveryWASentAt: now } })
  }

  // Second reminder with discount: 24 hours after abandonment
  const secondReminderCarts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: twentyFourHoursAgo },
      items: { some: {} },
      recoveryWASentAt: { not: null },
      customer: { whatsappOptIn: true, phone: { not: null } },
    },
    include: { customer: true, items: { include: { product: true } } },
  })

  for (const cart of secondReminderCarts) {
    if (!cart.customer?.phone) continue
    const code = `COMEBACK${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    await prisma.coupon.create({
      data: {
        code,
        discountType: 'PERCENTAGE',
        discountValue: 5,
        maxUses: 1,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    })
    await sendAbandonedCartDiscount(cart.customer.phone, {
      customerName: cart.customer.name,
      cartUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      couponCode: code,
      discount: '5%',
    })
    await prisma.cart.update({ where: { id: cart.id }, data: { abandonedAt: now } })
  }

  return NextResponse.json({ firstReminders: firstReminderCarts.length, secondReminders: secondReminderCarts.length })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
