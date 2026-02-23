import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function GET() {
const auth = await requireAdmin()
if (auth.response) return auth.response
const reviews = await prisma.review.findMany({
include: { customer: { select: { name: true } }, product: { select: {
name: true } } },
orderBy: { createdAt: 'desc' },
})
return NextResponse.json({ reviews })
}