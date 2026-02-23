'use client'
import { useEffect, useState } from 'react'
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, Eye,
  AlertTriangle, Package, ShoppingCart, ArrowDown, Target,
  BarChart3, UserCheck, Repeat2, Crown
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { formatPrice, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Analytics {
  today: { revenue: number; orders: number; visitors: number; conversionRate: number }
  yesterday: { revenue: number; orders: number }
  thisMonth: { revenue: number; orders: number; newCustomers: number }
  allTime: { revenue: number; orders: number; customers: number; avgOrderValue: number }
  revenueChart: { date: string; revenue: number; orders: number }[]
  topProducts: { name: string; unitsSold: number; revenue: number }[]
  lowStock: { productName: string; size: string; color: string; sku: string; stock: number; threshold: number }[]
  channelStats: { channel: string; orders: number; revenue: number }[]
  recentOrders: any[]
  funnel: { steps: { step: string; count: number; pct: number; dropOff: number; color: string }[]; overallConversion: number; period: string }
  abandonedCarts: { count: number; estimatedRevenueLost: number }
  revenueByCategoryData: { category: string; revenue: number }[]
  topCustomers: { id: string; name: string; email: string; totalOrders: number; totalSpent: number; avgOrderValue: number; segment: string }[]
  customerInsights: { total: number; repeat: number; repeatRate: number; newThisMonth: number }
}

function StatCard({ label, value, change, positive, icon: Icon }: any) {
  return (
    <div className="card-brand p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-brand-gray-text uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={cn('text-xs mt-1 flex items-center gap-1', positive ? 'text-green-400' : 'text-red-400')}>
              {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded bg-[#FF5A00]/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-[#FF5A00]" />
        </div>
      </div>
    </div>
  )
}

const SEG_COLORS: Record<string, string> = {
  VIP: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Loyal: 'text-[#FF7A30] bg-[#FF5A00]/10 border-[#FF5A00]/30',
  New: 'text-green-400 bg-green-400/10 border-green-400/30',
}

type Section = 'overview' | 'funnel' | 'customers' | 'revenue'

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('overview')

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>
  if (!data) return <div className="text-red-400 p-6">Failed to load analytics</div>

  const revenueChange = data.yesterday.revenue > 0
    ? ((data.today.revenue - data.yesterday.revenue) / data.yesterday.revenue * 100).toFixed(1) : '0'
  const isRevenueUp = Number(revenueChange) >= 0

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Sales Funnel', icon: Target },
    { id: 'customers', label: 'Customer LTV', icon: UserCheck },
    { id: 'revenue', label: 'Revenue Breakdown', icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wide">DASHBOARD</h1>
          <p className="text-brand-gray-text text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-brand-gray-text uppercase tracking-wider">Overall Conversion</p>
          <p className="text-3xl font-bold text-[#FF5A00]">{data.funnel.overallConversion}%</p>
          <p className="text-xs text-brand-gray-muted">last {data.funnel.period}</p>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">Low Stock Alert</p>
            <p className="text-yellow-400/70 text-xs mt-1">{data.lowStock.length} SKUs running low: {data.lowStock.slice(0, 3).map(s => `${s.productName} (${s.size})`).join(', ')}{data.lowStock.length > 3 && ` and ${data.lowStock.length - 3} more`}</p>
          </div>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 bg-brand-card border border-brand-border rounded p-1">
        {navTabs.map(t => (
          <button key={t.id} onClick={() => setSection(t.id as Section)}
            className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-all flex-1 justify-center', section === t.id ? 'bg-[#FF5A00] text-white' : 'text-brand-gray-text hover:text-white')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {section === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Today's Revenue" value={formatPrice(data.today.revenue)} change={`${isRevenueUp ? '+' : ''}${revenueChange}% vs yesterday`} positive={isRevenueUp} icon={DollarSign} />
            <StatCard label="Today's Orders" value={String(data.today.orders)} change={`${data.yesterday.orders} yesterday`} positive={data.today.orders >= data.yesterday.orders} icon={ShoppingBag} />
            <StatCard label="Visitors Today" value={formatNumber(data.today.visitors)} change={`${data.today.conversionRate}% conversion`} positive={data.today.conversionRate >= 2} icon={Eye} />
            <StatCard label="This Month" value={formatPrice(data.thisMonth.revenue)} change={`${data.thisMonth.orders} orders`} positive={true} icon={TrendingUp} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: 'Total Revenue', value: formatPrice(data.allTime.revenue) }, { label: 'Total Orders', value: formatNumber(data.allTime.orders) }, { label: 'Total Customers', value: formatNumber(data.allTime.customers) }, { label: 'Avg Order Value', value: formatPrice(data.allTime.avgOrderValue) }].map(s => (
              <div key={s.label} className="card-brand p-4"><p className="text-xs text-brand-gray-text uppercase tracking-wider mb-1">{s.label}</p><p className="text-xl font-bold text-white">{s.value}</p></div>
            ))}
          </div>
          <div className="card-brand p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Revenue — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.revenueChart}>
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '12px' }} formatter={(v: any) => [formatPrice(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#FF5A00" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF5A00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card-brand p-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Products (30d)</h2>
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-gray-muted w-5">#{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <div className="mt-1 h-1 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF5A00] rounded-full" style={{ width: `${data.topProducts[0]?.revenue > 0 ? (p.revenue/data.topProducts[0].revenue)*100 : 0}%` }} />
                      </div>
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold text-white">{formatPrice(p.revenue)}</p><p className="text-xs text-brand-gray-text">{p.unitsSold} sold</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-brand p-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Recent Orders</h2>
              <div className="space-y-2">
                {data.recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                    <div><p className="text-sm text-white font-medium">{o.orderNumber}</p><p className="text-xs text-brand-gray-text">{o.customer}</p></div>
                    <div className="text-right"><p className="text-sm font-semibold text-white">{formatPrice(o.total)}</p><span className={`text-xs status-${o.status.toLowerCase()}`}>{o.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FUNNEL */}
      {section === 'funnel' && (
        <div className="space-y-6">
          <div className="card-brand p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Sales Funnel</h2>
              <p className="text-xs text-brand-gray-text mt-1">Last {data.funnel.period} · Overall: <span className="text-[#FF5A00] font-medium">{data.funnel.overallConversion}%</span></p>
            </div>
            <div className="space-y-4">
              {data.funnel.steps.map((step, i) => {
                const max = data.funnel.steps[0]?.count || 1
                const w = max > 0 ? (step.count / max) * 100 : 0
                return (
                  <div key={step.step}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white font-medium">{step.step}</span>
                      <div className="flex items-center gap-4">
                        {step.dropOff > 0 && <span className="text-xs text-red-400">-{formatNumber(step.dropOff)} dropped</span>}
                        <span className="text-sm font-bold text-white w-20 text-right">{formatNumber(step.count)}</span>
                        <span className="text-xs text-brand-gray-text w-10 text-right">{step.pct}%</span>
                      </div>
                    </div>
                    <div className="h-10 bg-brand-border rounded overflow-hidden">
                      <div className="h-full rounded flex items-center px-3 transition-all duration-700"
                        style={{ width: `${Math.max(w, 2)}%`, backgroundColor: step.color }}>
                        {w > 15 && <span className="text-white text-xs font-semibold">{step.pct}%</span>}
                      </div>
                    </div>
                    {i < data.funnel.steps.length - 1 && <div className="flex justify-center my-1"><ArrowDown size={14} className="text-brand-gray-muted" /></div>}
                  </div>
                )
              })}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Cart Abandonment', value: data.funnel.steps[1] ? `${100 - data.funnel.steps[1].pct}%` : '—', sub: 'leave without adding to cart' },
                { label: 'Checkout Drop', value: data.funnel.steps[2] ? `${100 - data.funnel.steps[2].pct}%` : '—', sub: 'cart adds don\'t reach checkout' },
                { label: 'Purchase Drop', value: data.funnel.steps[3] ? `${100 - data.funnel.steps[3].pct}%` : '—', sub: 'checkouts don\'t complete' },
              ].map(s => (
                <div key={s.label} className="bg-red-500/5 border border-red-500/20 rounded p-4">
                  <p className="text-xs text-brand-gray-text uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">{s.value}</p>
                  <p className="text-xs text-brand-gray-muted mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card-brand p-6 flex gap-6 items-start">
            <div className="w-12 h-12 rounded bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={22} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Abandoned Carts (30d)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-brand-gray-text uppercase tracking-wider">Count</p><p className="text-3xl font-bold text-orange-400 mt-1">{formatNumber(data.abandonedCarts.count)}</p></div>
                <div><p className="text-xs text-brand-gray-text uppercase tracking-wider">Est. Revenue Lost</p><p className="text-3xl font-bold text-red-400 mt-1">{formatPrice(data.abandonedCarts.estimatedRevenueLost)}</p></div>
              </div>
              <div className="mt-4 bg-[#FF5A00]/5 border border-[#FF5A00]/20 rounded p-3">
                <p className="text-xs text-[#FF5A00] font-medium">💡 Recovery: </p>
                <p className="text-xs text-brand-gray-text mt-1">Cron job sends WhatsApp reminders at 1h and 24h. Check Marketing → WhatsApp for delivery rates.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS */}
      {section === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: formatNumber(data.customerInsights.total), color: 'text-[#FF5A00]', icon: Users },
              { label: 'Repeat Buyers', value: formatNumber(data.customerInsights.repeat), color: 'text-green-400', icon: Repeat2 },
              { label: 'Repeat Rate', value: `${data.customerInsights.repeatRate}%`, color: 'text-purple-400', icon: Target },
              { label: 'New This Month', value: formatNumber(data.customerInsights.newThisMonth), color: 'text-yellow-400', icon: UserCheck },
            ].map(s => (
              <div key={s.label} className="card-brand p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-brand-gray-text uppercase tracking-wider">{s.label}</p>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="card-brand p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Customers by Lifetime Value</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-brand-gray-text uppercase tracking-wider border-b border-brand-border">
                    {['#', 'Customer', 'Segment', 'Orders', 'Avg Order', 'Total Spent'].map(h => (
                      <th key={h} className={`pb-3 font-medium ${h === '#' || h === 'Orders' || h === 'Avg Order' || h === 'Total Spent' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {data.topCustomers.map((c, i) => (
                    <tr key={c.id} className="hover:bg-brand-border/10 transition-colors">
                      <td className="py-3 text-right text-brand-gray-muted">{i === 0 ? <Crown size={14} className="text-yellow-400 ml-auto" /> : `#${i+1}`}</td>
                      <td className="py-3 pl-3"><p className="text-white font-medium">{c.name}</p><p className="text-xs text-brand-gray-text">{c.email}</p></td>
                      <td className="py-3"><span className={cn('badge border text-xs', SEG_COLORS[c.segment] || '')}>{c.segment}</span></td>
                      <td className="py-3 text-right text-white">{c.totalOrders}</td>
                      <td className="py-3 text-right text-brand-gray-text">{formatPrice(c.avgOrderValue)}</td>
                      <td className="py-3 text-right font-bold text-white">{formatPrice(c.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-brand-gray-text">
              <span><span className="text-yellow-400 font-medium">VIP</span> = 5+ orders</span>
              <span><span className="text-[#FF7A30] font-medium">Loyal</span> = 2–4 orders</span>
              <span><span className="text-green-400 font-medium">New</span> = 1 order</span>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE BREAKDOWN */}
      {section === 'revenue' && (
        <div className="space-y-6">
          <div className="card-brand p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Revenue by Category (30d)</h2>
            {!data.revenueByCategoryData.length ? (
              <p className="text-brand-gray-text text-sm">No category data yet</p>
            ) : data.revenueByCategoryData.map(c => {
              const max = data.revenueByCategoryData[0]?.revenue || 1
              return (
                <div key={c.category} className="mb-4">
                  <div className="flex justify-between mb-1"><span className="text-sm text-white">{c.category}</span><span className="text-sm font-bold text-white">{formatPrice(c.revenue)}</span></div>
                  <div className="h-8 bg-brand-border rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FF9A00] rounded" style={{ width: `${(c.revenue/max)*100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          {data.channelStats.length > 0 && (
            <div className="card-brand p-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Revenue by Channel (30d)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.channelStats}>
                  <XAxis dataKey="channel" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '12px' }} formatter={(v: any) => [formatPrice(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#FF5A00" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="card-brand p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Daily Revenue Trend (30d)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.revenueChart}>
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: '4px', fontSize: '12px' }} formatter={(v: any) => [formatPrice(v), 'Revenue']} />
                <Bar dataKey="revenue" radius={[2,2,0,0]}>
                  {data.revenueChart.map((_, i) => <Cell key={i} fill={i === data.revenueChart.length - 1 ? '#FF5A00' : '#1A0800'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
