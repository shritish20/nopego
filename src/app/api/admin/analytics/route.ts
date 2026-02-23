import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// Safely run a query — returns fallback if it throws
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const yesterdayStart = startOfDay(daysAgo(1))
    const yesterdayEnd = endOfDay(daysAgo(1))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = daysAgo(30)

    // Run ALL queries independently so one failure never breaks the dashboard
    const [
      todayOrders,
      yesterdayOrders,
      thisMonthOrders,
      allTimeOrderCount,
      allTimeRevenueAgg,
      allTimeCustomers,
      recentOrdersRaw,
      lowStockVariants,
      topProductsRaw,
      dailyStatsRaw,
      channelStatsRaw,
      newCustomersThisMonth,
      todayPageViews,
      totalPageViews30d,
      totalCartsCreated,
      totalCheckoutStarted,
      totalOrdersPaid30d,
      abandonedCarts,
      revenueByProductRaw,
      topCustomersRaw,
      repeatCustomers,
    ] = await Promise.all([
      safe(() => prisma.order.findMany({ where: { createdAt: { gte: todayStart, lte: todayEnd }, paymentStatus: 'PAID' }, select: { total: true } }), []),
      safe(() => prisma.order.findMany({ where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, paymentStatus: 'PAID' }, select: { total: true } }), []),
      safe(() => prisma.order.findMany({ where: { createdAt: { gte: monthStart }, paymentStatus: 'PAID' }, select: { total: true } }), []),
      safe(() => prisma.order.count({ where: { paymentStatus: 'PAID' } }), 0),
      safe(() => prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }), { _sum: { total: 0 } }),
      safe(() => prisma.customer.count(), 0),
      safe(() => prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true } }, items: true } }), []),
      safe(() => prisma.variant.findMany({ where: { stock: { lte: 5 } }, include: { product: { select: { name: true } } }, orderBy: { stock: 'asc' }, take: 20 }), []),
      safe(() => prisma.orderItem.groupBy({ by: ['productId'], where: { order: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' } }, _sum: { quantity: true, total: true }, orderBy: { _sum: { total: 'desc' } }, take: 5 }), []),
      safe(() => prisma.dailyStat.findMany({ where: { date: { gte: thirtyDaysAgo } }, orderBy: { date: 'asc' } }), []),
      safe(() => prisma.order.groupBy({ by: ['utmSource'], where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } }, _count: { id: true }, _sum: { total: true } }), []),
      safe(() => prisma.customer.count({ where: { createdAt: { gte: monthStart } } }), 0),
      safe(() => prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }), 0),
      safe(() => prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }), 0),
      safe(() => prisma.cart.count({ where: { createdAt: { gte: thirtyDaysAgo }, items: { some: {} } } }), 0),
      safe(() => prisma.cart.count({ where: { createdAt: { gte: thirtyDaysAgo }, customerId: { not: null } } }), 0),
      safe(() => prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } } }), 0),
      safe(() => prisma.cart.count({ where: { updatedAt: { gte: thirtyDaysAgo }, items: { some: {} }, abandonedAt: { not: null } } }), 0),
      safe(() => prisma.orderItem.groupBy({ by: ['productId'], where: { order: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } } }, _sum: { total: true } }), []),
      safe(() => prisma.customer.findMany({ where: { totalSpent: { gt: 0 } }, orderBy: { totalSpent: 'desc' }, take: 10, select: { id: true, name: true, email: true, totalOrders: true, totalSpent: true, lastOrderAt: true } }), []),
      safe(() => prisma.customer.count({ where: { totalOrders: { gte: 2 } } }), 0),
    ])

    // Enrich top products with names
    const productIds = topProductsRaw.map((p: any) => p.productId)
    const productDetails = productIds.length
      ? await safe(() => prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }), [])
      : []

    const topProducts = topProductsRaw.map((p: any) => ({
      name: productDetails.find((d: any) => d.id === p.productId)?.name || 'Unknown',
      unitsSold: p._sum?.quantity || 0,
      revenue: p._sum?.total || 0,
    }))

    // Revenue by category
    const allProdIds = revenueByProductRaw.map((r: any) => r.productId)
    const prodCatMap = allProdIds.length
      ? await safe(() => prisma.product.findMany({ where: { id: { in: allProdIds } }, select: { id: true, category: { select: { name: true } } } }), [])
      : []

    const catRevMap: Record<string, number> = {}
    revenueByProductRaw.forEach((r: any) => {
      const cat = (prodCatMap as any[]).find((p: any) => p.id === r.productId)?.category?.name || 'Other'
      catRevMap[cat] = (catRevMap[cat] || 0) + (r._sum?.total || 0)
    })
    const revenueByCategoryData = Object.entries(catRevMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // Revenue chart — prefer DailyStat, fall back to raw orders grouped by day
    let revenueChart: { date: string; revenue: number; orders: number }[] = []
    if (dailyStatsRaw.length > 0) {
      revenueChart = dailyStatsRaw.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: d.revenue,
        orders: d.orders,
      }))
    } else {
      const rawOrders = await safe(() =>
        prisma.order.findMany({
          where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' },
          select: { total: true, createdAt: true },
        }), []
      )
      const byDay: Record<string, { revenue: number; orders: number }> = {}
      rawOrders.forEach((o: any) => {
        const key = startOfDay(o.createdAt).toISOString()
        if (!byDay[key]) byDay[key] = { revenue: 0, orders: 0 }
        byDay[key].revenue += o.total
        byDay[key].orders += 1
      })
      revenueChart = Object.entries(byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, stats]) => ({
          date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          ...stats,
        }))
    }

    // Computed values
    const todayRevenue = (todayOrders as any[]).reduce((s: number, o: any) => s + o.total, 0)
    const yesterdayRevenue = (yesterdayOrders as any[]).reduce((s: number, o: any) => s + o.total, 0)
    const allTimeRevenue = (allTimeRevenueAgg as any)._sum?.total || 0

    // Funnel
    const fv = totalPageViews30d || 0
    const fc = totalCartsCreated || 0
    const fco = totalCheckoutStarted || 0
    const fp = totalOrdersPaid30d || 0

    const funnelSteps = [
      { step: 'Visited Store', count: fv, pct: 100, dropOff: 0, color: '#1A0800' },
      { step: 'Added to Cart', count: fc, pct: fv > 0 ? Math.round((fc / fv) * 100) : 0, dropOff: Math.max(0, fv - fc), color: '#FF5A00' },
      { step: 'Started Checkout', count: fco, pct: fc > 0 ? Math.round((fco / fc) * 100) : 0, dropOff: Math.max(0, fc - fco), color: '#FF7A30' },
      { step: 'Completed Purchase', count: fp, pct: fco > 0 ? Math.round((fp / fco) * 100) : 0, dropOff: Math.max(0, fco - fp), color: '#22C55E' },
    ]

    return NextResponse.json({
      success: true,
      data: {
        today: {
          revenue: todayRevenue,
          orders: (todayOrders as any[]).length,
          visitors: todayPageViews,
          conversionRate: todayPageViews > 0
            ? parseFloat((((todayOrders as any[]).length / todayPageViews) * 100).toFixed(1))
            : 0,
        },
        yesterday: {
          revenue: yesterdayRevenue,
          orders: (yesterdayOrders as any[]).length,
        },
        thisMonth: {
          revenue: (thisMonthOrders as any[]).reduce((s: number, o: any) => s + o.total, 0),
          orders: (thisMonthOrders as any[]).length,
          newCustomers: newCustomersThisMonth,
        },
        allTime: {
          revenue: allTimeRevenue,
          orders: allTimeOrderCount,
          customers: allTimeCustomers,
          avgOrderValue: allTimeOrderCount > 0 ? Math.round(allTimeRevenue / allTimeOrderCount) : 0,
        },
        revenueChart,
        topProducts,
        lowStock: (lowStockVariants as any[]).map((v: any) => ({
          productName: v.product?.name || 'Unknown',
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock: v.stock,
          threshold: v.lowStockAt,
        })),
        channelStats: (channelStatsRaw as any[])
          .filter((c: any) => c.utmSource)
          .map((c: any) => ({
            channel: c.utmSource,
            orders: c._count?.id || 0,
            revenue: c._sum?.total || 0,
          })),
        recentOrders: (recentOrdersRaw as any[]).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer?.name || 'Guest',
          items: o.items?.length || 0,
          total: o.total,
          paymentMethod: o.paymentMethod,
          status: o.status,
          createdAt: o.createdAt,
        })),
        funnel: {
          steps: funnelSteps,
          overallConversion: fv > 0 ? parseFloat(((fp / fv) * 100).toFixed(2)) : 0,
          period: '30 days',
        },
        abandonedCarts: {
          count: abandonedCarts,
          estimatedRevenueLost: abandonedCarts * 1200,
        },
        revenueByCategoryData,
        topCustomers: (topCustomersRaw as any[]).map((c: any) => ({
          ...c,
          avgOrderValue: c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0,
          segment: c.totalOrders >= 5 ? 'VIP' : c.totalOrders >= 2 ? 'Loyal' : 'New',
        })),
        customerInsights: {
          total: allTimeCustomers,
          repeat: repeatCustomers,
          repeatRate: allTimeCustomers > 0
            ? parseFloat(((repeatCustomers / allTimeCustomers) * 100).toFixed(1))
            : 0,
          newThisMonth: newCustomersThisMonth,
        },
      },
    })
  } catch (err: any) {
    console.error('[Analytics] Fatal error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
