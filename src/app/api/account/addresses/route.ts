import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, phone, line1, line2, city, state, pincode, isDefault } = await req.json()
  if (isDefault) await prisma.address.updateMany({ where: { customerId: session.user.id }, data: { isDefault: false } })
  const address = await prisma.address.create({
    data: { customerId: session.user.id, name, phone, line1, line2: line2 || null, city, state, pincode, isDefault: !!isDefault },
  })
  return NextResponse.json({ success: true, data: address })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await prisma.address.deleteMany({ where: { id, customerId: session.user.id } })
  return NextResponse.json({ success: true })
}
