// Called daily — sends review requests 7 days after delivery
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReviewRequestWA } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
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
      customer: {
        whatsappOptIn: true,
        phone: { not: null },
      },
    },
    include: { customer: true },
  })

  let sent = 0

  for (const order of deliveredOrders) {
    if (!order.customer.phone) continue

    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track?order=${order.orderNumber}`

    await sendReviewRequestWA(order.customer.phone, {
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      reviewUrl,
    }).catch(console.error)

    sent++
  }

  return NextResponse.json({ success: true, reviewRequestsSent: sent })
}
