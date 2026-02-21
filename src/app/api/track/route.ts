import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('orderNumber')
  const phone = searchParams.get('phone')

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Order number and phone required' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      customer: { phone },
    },
    include: {
      items: { include: { product: true, variant: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      address: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
