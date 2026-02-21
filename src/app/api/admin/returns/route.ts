import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { order: { include: { customer: true, address: true, items: { include: { product: true } } } } },
  })
  return NextResponse.json({ returns })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
