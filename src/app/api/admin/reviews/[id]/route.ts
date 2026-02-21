import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { isPublished } = await req.json()
  const review = await prisma.review.update({ where: { id: params.id }, data: { isPublished } })
  return NextResponse.json({ review })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
