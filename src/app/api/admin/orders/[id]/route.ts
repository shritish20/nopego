import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { sendShippingUpdateWA } from '@/lib/whatsapp'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const { status, trackingNumber, courierName, note } = await req.json()

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(courierName && { courierName }),
      },
      include: { customer: true },
    })

    await prisma.orderStatusHistory.create({
      data: { orderId: params.id, status, note: note || null },
    })

    // Send WhatsApp shipping notification
    if (
      status === 'SHIPPED' &&
      order.customer.phone &&
      order.customer.whatsappOptIn &&
      trackingNumber
    ) {
      sendShippingUpdateWA(order.customer.phone, {
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        courierName: courierName || 'Courier',
        trackingNumber,
      }).catch(console.error)
    }

    return NextResponse.json(order)
  } catch (err: any) {
    console.error('[Admin Order Update] Error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
