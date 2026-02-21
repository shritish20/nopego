import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReviewRequest } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  try {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)

  const deliveredOrders = await prisma.order.findMany({
    where: {
      status: 'DELIVERED',
      updatedAt: { gte: eightDaysAgo, lte: sevenDaysAgo },
      customer: { whatsappOptIn: true, phone: { not: null } },
    },
    include: { customer: true, items: { include: { product: true } } },
  })

  let sent = 0
  for (const order of deliveredOrders) {
    if (!order.customer.phone) continue
    const productSlug = order.items[0]?.product?.slug ?? ''
    await sendReviewRequest(order.customer.phone, {
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/product/${productSlug}#reviews`,
    })
    sent++
  }

  return NextResponse.json({ sent })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
