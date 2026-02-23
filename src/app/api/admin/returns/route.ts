import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  const returns = await prisma.returnRequest.findMany({
    include: {
      order: { include: { customer: true } },
      customer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ returns })
}
