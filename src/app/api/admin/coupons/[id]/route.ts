import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { isActive } = await req.json()
  const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { isActive } })
  return NextResponse.json({ coupon })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  await prisma.coupon.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
