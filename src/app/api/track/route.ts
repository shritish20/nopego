import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('order')
  const phone = searchParams.get('phone')

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
            variant: { select: { size: true, color: true } },
          },
        },
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify phone if provided (for guest orders)
    if (phone && order.address?.phone && !order.address.phone.endsWith(phone.slice(-4))) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        createdAt: order.createdAt,
        address: order.address
          ? `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`
          : null,
        items: order.items.map(i => ({
          name: i.product.name,
          image: i.product.images[0] || null,
          size: i.variant.size,
          color: i.variant.color,
          quantity: i.quantity,
          price: i.price,
        })),
        statusHistory: order.statusHistory.map(h => ({
          status: h.status,
          note: h.note,
          createdAt: h.createdAt,
        })),
      },
    })
  } catch (err) {
    console.error('Track order error:', err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
