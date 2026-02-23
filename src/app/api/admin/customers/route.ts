import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function GET() {
const auth = await requireAdmin()
if (auth.response) return auth.response
const customers = await prisma.customer.findMany({
orderBy: { totalSpent: 'desc' },
take: 500,
})
return NextResponse.json({ customers })
}