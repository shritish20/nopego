import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: { orderBy: { isDefault: 'desc' } },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { select: { name: true, images: true, slug: true } },
              variant: { select: { size: true, color: true } },
            },
          },
        },
      },
    },
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    success: true,
    data: {
      id: customer.id, name: customer.name, email: customer.email,
      phone: customer.phone, whatsappOptIn: customer.whatsappOptIn,
      totalOrders: customer.totalOrders, totalSpent: customer.totalSpent,
      addresses: customer.addresses,
      orders: customer.orders.map(o => ({
        id: o.id, orderNumber: o.orderNumber, status: o.status,
        paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
        total: o.total, createdAt: o.createdAt,
        trackingNumber: (o as any).trackingNumber, courierName: (o as any).courierName,
        items: o.items.map(i => ({
          id: i.id, productName: i.product.name, productImage: i.product.images[0] || '',
          productSlug: i.product.slug, size: i.variant.size, color: i.variant.color,
          quantity: i.quantity, price: i.price, total: i.total,
        })),
      })),
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, phone, whatsappOptIn } = await req.json()
  const updated = await prisma.customer.update({
    where: { id: session.user.id },
    data: { ...(name && { name }), ...(phone !== undefined && { phone }), ...(whatsappOptIn !== undefined && { whatsappOptIn }) },
    select: { id: true, name: true, email: true, phone: true, whatsappOptIn: true },
  })
  return NextResponse.json({ success: true, data: updated })
}
