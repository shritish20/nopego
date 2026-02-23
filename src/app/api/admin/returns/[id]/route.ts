import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { scheduleReturnPickup } from '@/lib/shiprocket'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const { status, adminNote } = await req.json()

    const returnReq = await prisma.returnRequest.update({
      where: { id: params.id },
      data: { status, ...(adminNote !== undefined && { adminNote }) },
      include: {
        order: {
          include: {
            customer: true,
            address: true,
          },
        },
      },
    })

    // Schedule Shiprocket return pickup when approved
    if (status === 'APPROVED' && returnReq.order.address) {
      scheduleReturnPickup({
        orderId: returnReq.order.orderNumber,
        customerName: returnReq.order.customer.name,
        customerPhone: returnReq.order.address.phone,
        address: returnReq.order.address.line1,
        city: returnReq.order.address.city,
        state: returnReq.order.address.state,
        pincode: returnReq.order.address.pincode,
      }).catch(err => console.error('[Return Pickup] Shiprocket error:', err))
    }

    return NextResponse.json(returnReq)
  } catch (err: any) {
    console.error('[Admin Return Update] Error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}
