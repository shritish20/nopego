import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { scheduleReturnPickup } from '@/lib/shiprocket'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { status, adminNotes, refundAmount } = await req.json()

  const returnReq = await prisma.returnRequest.update({
    where: { id: params.id },
    data: { status, adminNotes, refundAmount },
    include: { order: { include: { customer: true, address: true } } },
  })

  if (status === 'APPROVED') {
    scheduleReturnPickup({
      orderId: returnReq.order.orderNumber,
      customerName: returnReq.order.customer.name,
      customerPhone: returnReq.order.customer.phone ?? '',
      address: returnReq.order.address.line1,
      city: returnReq.order.address.city,
      state: returnReq.order.address.state,
      pincode: returnReq.order.address.pincode,
    }).catch(console.error)

    await prisma.order.update({
      where: { id: returnReq.order.id },
      data: {
        status: 'RETURN_APPROVED',
        statusHistory: { create: { status: 'RETURN_APPROVED', note: 'Return approved, pickup scheduled' } },
      },
    })
  }

  return NextResponse.json({ returnRequest: returnReq })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
