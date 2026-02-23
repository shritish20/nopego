import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  const influencers = await prisma.influencer.findMany({
    include: {
      coupons: { select: { code: true, usedCount: true } },
    },
    orderBy: { totalRevenue: 'desc' },
  })

  const withROI = influencers.map(inf => ({
    ...inf,
    roi: inf.amountPaid > 0 ? (inf.totalRevenue / inf.amountPaid).toFixed(2) : 'N/A',
    roas: inf.amountPaid > 0 ? `${(inf.totalRevenue / inf.amountPaid).toFixed(1)}x` : 'Gifted',
  }))

  return NextResponse.json(withROI)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const data = await req.json()
    const influencer = await prisma.influencer.create({ data })
    return NextResponse.json(influencer, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create influencer' }, { status: 500 })
  }
}
