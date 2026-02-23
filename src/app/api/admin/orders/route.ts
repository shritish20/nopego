import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function GET() {
const auth = await requireAdmin()
if (auth.response) return auth.response
const orders = await prisma.order.findMany({
include: { customer: true, address: true, items: true },
orderBy: { createdAt: 'desc' },
take: 500,
})
return NextResponse.json({ orders })
}