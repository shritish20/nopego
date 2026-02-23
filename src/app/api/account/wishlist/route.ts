import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const wishlist = await (prisma as any).wishlistItem.findMany({
      where: { customerId: session.user.id },
      include: { product: { include: { category: { select: { name: true } }, variants: { where: { stock: { gt: 0 } }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: wishlist })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || (session.user as any).role !== 'customer')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  try {
    const existing = await (prisma as any).wishlistItem.findUnique({
      where: { customerId_productId: { customerId: session.user.id, productId } },
    })
    if (existing) {
      await (prisma as any).wishlistItem.delete({ where: { id: existing.id } })
      return NextResponse.json({ success: true, action: 'removed' })
    }
    await (prisma as any).wishlistItem.create({ data: { customerId: session.user.id, productId } })
    return NextResponse.json({ success: true, action: 'added' })
  } catch {
    return NextResponse.json({ success: true, action: 'unavailable' })
  }
}
