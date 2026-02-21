import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const customers = await prisma.customer.findMany({
    orderBy: { totalSpent: 'desc' },
    include: { _count: { select: { orders: true } } },
  })
  return NextResponse.json({ customers })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
