'use client'
import { useEffect, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-[#FF5A00]/20 text-[#FF7A30]',
  PROCESSING: 'bg-orange-500/20 text-orange-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  OUT_FOR_DELIVERY: 'bg-cyan-500/20 text-cyan-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  RETURN_REQUESTED: 'bg-orange-500/20 text-orange-400',
  REFUNDED: 'bg-gray-500/20 text-gray-400',
}

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'CANCELLED']

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.orderNumber.includes(search.toUpperCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      if (selected?.id === orderId) setSelected((s: any) => ({ ...s, status }))
      toast.success('Status updated')
    } else {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-white">ORDERS</h1>
        <span className="text-brand-muted text-sm">{orders.length} total</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input placeholder="Search by order # or customer name..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-brand pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-brand w-full sm:w-48">
          <option value="ALL">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-brand-card border border-brand-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border">
              <tr className="text-left text-brand-muted text-xs">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-brand-muted">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-brand-bg/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#FF5A00] whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-white">{order.customer?.name}</p>
                    <p className="text-brand-muted text-xs">{order.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-white font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : order.paymentMethod === 'COD' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.paymentMethod === 'COD' ? 'COD' : order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-brand-border text-brand-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted whitespace-nowrap text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="text-brand-muted hover:text-[#FF5A00] transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-card">
              <div>
                <h2 className="font-display text-xl text-white">{selected.orderNumber}</h2>
                <p className="text-brand-muted text-xs">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-brand-muted hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-brand-muted text-xs mb-1">CUSTOMER</p>
                <p className="text-white">{selected.customer?.name}</p>
                <p className="text-brand-muted text-sm">{selected.customer?.email} · {selected.customer?.phone}</p>
              </div>
              {selected.address && (
                <div>
                  <p className="text-brand-muted text-xs mb-1">DELIVERY ADDRESS</p>
                  <p className="text-white text-sm">{selected.address.line1}, {selected.address.city}, {selected.address.state} - {selected.address.pincode}</p>
                </div>
              )}
              <div>
                <p className="text-brand-muted text-xs mb-2">ITEMS</p>
                {selected.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-white">{item.productName} · {item.size} · Qty {item.quantity}</span>
                    <span className="text-brand-muted">{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="border-t border-brand-border mt-2 pt-2 flex justify-between font-medium">
                  <span className="text-brand-muted">Total</span>
                  <span className="text-[#FF5A00]">{formatPrice(selected.total)}</span>
                </div>
              </div>
              <div>
                <p className="text-brand-muted text-xs mb-2">UPDATE STATUS</p>
                <div className="grid grid-cols-2 gap-2">
                  {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`py-2 text-xs border transition-colors rounded ${selected.status === s ? 'border-[#FF5A00] text-[#FF5A00] bg-[#FF5A00]/10' : 'border-brand-border text-brand-muted hover:border-[#FF5A00]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {selected.trackingNumber && (
                <div className="bg-brand-bg rounded p-3">
                  <p className="text-brand-muted text-xs">TRACKING</p>
                  <p className="text-white font-medium font-mono">{selected.trackingNumber}</p>
                  <p className="text-brand-muted text-xs">{selected.courierName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
