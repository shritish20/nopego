'use client'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DailyRevenue = { date: string; revenue: number; orders: number }
type RecentOrder = {
  orderNumber: string
  total: number
  status: string
  createdAt: string
  customer: { name: string }
}
type LowStockVariant = {
  id: string; sku: string; stock: number; size: string; color: string
  product: { name: string }
}
type Analytics = {
  today: { revenue: number; orders: number }
  yesterday: { revenue: number; orders: number }
  totalCustomers: number
  recentOrders: RecentOrder[]
  lowStockVariants: LowStockVariant[]
  dailyRevenue: DailyRevenue[]
}

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-green-900/30 text-green-400',
  SHIPPED: 'bg-blue-900/30 text-blue-400',
  CONFIRMED: 'bg-indigo-900/30 text-indigo-400',
  PROCESSING: 'bg-orange-900/30 text-orange-400',
  PENDING: 'bg-yellow-900/30 text-yellow-400',
  CANCELLED: 'bg-red-900/30 text-red-400',
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!data) return null

  const revenueChange =
    data.yesterday.revenue > 0
      ? (((data.today.revenue - data.yesterday.revenue) / data.yesterday.revenue) * 100).toFixed(1)
      : '0'
  const revenuePositive = data.today.revenue >= data.yesterday.revenue

  const chartData = data.dailyRevenue.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    revenue: d.revenue,
    orders: d.orders,
  }))

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white mb-1">Dashboard</h1>
        <p className="text-brand-muted">{formatDate(new Date())}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: formatPrice(data.today.revenue),
            sub: `${revenuePositive ? '↑' : '↓'} ${Math.abs(Number(revenueChange))}% vs yesterday`,
            icon: TrendingUp,
            positive: revenuePositive,
          },
          {
            label: "Today's Orders",
            value: data.today.orders,
            sub: `${data.yesterday.orders} yesterday`,
            icon: ShoppingCart,
            positive: true,
          },
          {
            label: 'Total Customers',
            value: data.totalCustomers,
            sub: 'All time',
            icon: Users,
            positive: true,
          },
          {
            label: 'Low Stock SKUs',
            value: data.lowStockVariants.length,
            sub: data.lowStockVariants.length > 0 ? 'Need restocking' : 'All healthy ✅',
            icon: AlertTriangle,
            positive: data.lowStockVariants.length === 0,
          },
        ].map(({ label, value, sub, icon: Icon, positive }) => (
          <div key={label} className="admin-stat-card">
            <div className="flex justify-between items-start">
              <p className="text-brand-muted text-sm">{label}</p>
              <Icon className="w-5 h-5 text-brand-orange" />
            </div>
            <p className="text-white text-2xl font-bold">{value}</p>
            <p className={`text-xs ${positive ? 'text-brand-muted' : 'text-red-400'}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-6">30-Day Revenue</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-brand-muted">
            No orders in the last 30 days
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5C00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fill: '#606060', fontSize: 11 }} />
              <YAxis
                tick={{ fill: '#606060', fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => formatPrice(v as number)}
                contentStyle={{ background: '#161616', border: '1px solid #222', borderRadius: 8, color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#FF5C00"
                fill="url(#revenueGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Recent Orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex items-center justify-between py-2 border-b border-brand-border last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-brand-muted text-xs">
                      {order.customer.name} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">{formatPrice(order.total)}</p>
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] ?? 'bg-brand-card text-brand-muted'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Low Stock Alerts</h2>
          {data.lowStockVariants.length === 0 ? (
            <p className="text-brand-muted text-sm text-center py-8">All stock levels healthy ✅</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockVariants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between py-2 border-b border-brand-border last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{v.product.name}</p>
                    <p className="text-brand-muted text-xs">
                      {v.color} · {v.size} · <span className="font-mono">{v.sku}</span>
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${v.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}
                  >
                    {v.stock === 0 ? 'OUT' : `${v.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
