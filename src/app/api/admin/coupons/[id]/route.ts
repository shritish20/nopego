import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function PATCH(req: NextRequest, { params }: { params: { id:
string } }) {
const auth = await requireAdmin()
if (auth.response) return auth.response
const data = await req.json()
const coupon = await prisma.coupon.update({
where: { id: params.id },
data: { isActive: data.isActive },
})
return NextResponse.json(coupon)
}
export async function DELETE(req: NextRequest, { params }: { params: { id:
string } }) {
const auth = await requireAdmin()
if (auth.response) return auth.response
await prisma.coupon.delete({ where: { id: params.id } })
return NextResponse.json({ success: true })
}