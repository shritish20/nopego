import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86_400_000)

  const [todayOrders, yesterdayOrders, totalCustomers, recentOrders, lowStockVariants] =
    await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, paymentStatus: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, paymentStatus: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      }),
      prisma.variant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
    ])

  // Use $queryRaw to correctly GROUP BY date (not datetime)
  const dailyRevenueRaw = await prisma.$queryRaw<
    { date: string; revenue: number; orders: number }[]
  >`
    SELECT
      DATE("createdAt") AS date,
      COALESCE(SUM(total), 0)::float AS revenue,
      COUNT(*)::int AS orders
    FROM "Order"
    WHERE "createdAt" >= ${thirtyDaysAgo}
      AND "paymentStatus" = 'PAID'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `

  return NextResponse.json({
    today: { revenue: todayOrders._sum.total ?? 0, orders: todayOrders._count },
    yesterday: { revenue: yesterdayOrders._sum.total ?? 0, orders: yesterdayOrders._count },
    totalCustomers,
    recentOrders,
    lowStockVariants,
    dailyRevenue: dailyRevenueRaw,
  })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
