import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { sendOrderShipped } from '@/lib/whatsapp'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { status, trackingNumber, courierName, note } = await req.json()

  const order = await prisma.order.update({
    where: { id: params.id },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(courierName && { courierName }),
      statusHistory: { create: { status, note } },
    },
    include: { customer: true },
  })

  if (status === 'SHIPPED' && order.customer.phone && order.customer.whatsappOptIn && trackingNumber) {
    sendOrderShipped(order.customer.phone, {
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      courierName: courierName ?? 'Courier',
      trackingNumber,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track?orderNumber=${order.orderNumber}&phone=${order.customer.phone}`,
    }).catch(console.error)
  }

  return NextResponse.json({ order })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
