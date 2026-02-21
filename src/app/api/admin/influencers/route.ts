import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const influencers = await prisma.influencer.findMany({
    orderBy: { totalRevenue: 'desc' },
    include: { coupons: true },
  })
  return NextResponse.json({ influencers })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const data = await req.json()
  const influencer = await prisma.influencer.create({
    data: {
      name: data.name,
      handle: data.handle,
      platform: data.platform,
      followers: data.followers ? parseInt(data.followers) : null,
      notes: data.notes,
    },
  })
  return NextResponse.json({ influencer }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
