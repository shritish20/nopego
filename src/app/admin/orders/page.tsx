'use client'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'

type Order = {
  id: string; orderNumber: string; status: string; total: number; paymentMethod: string
  createdAt: string; customer: { name: string; email: string; phone?: string | null }
  address: { city: string; state: string }; items: { productName: string; quantity: number; size: string }[]
  trackingNumber?: string | null; courierName?: string | null
}

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','RETURN_REQUESTED','CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => r.json()).then((d) => setOrders(d.orders))
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.orderNumber.includes(search) || o.customer.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus() {
    if (!selected || !newStatus) return
    setUpdating(true)
    const res = await fetch(`/api/admin/orders/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, trackingNumber, courierName }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === selected.id ? { ...o, status: newStatus, trackingNumber, courierName } : o))
      setSelected(null)
      toast.success('Order updated')
    } else {
      toast.error('Failed to update')
    }
    setUpdating(false)
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-900/20', CONFIRMED: 'text-blue-400 bg-blue-900/20',
    SHIPPED: 'text-purple-400 bg-purple-900/20', DELIVERED: 'text-green-400 bg-green-900/20',
    CANCELLED: 'text-red-400 bg-red-900/20', PROCESSING: 'text-orange-400 bg-orange-900/20',
    OUT_FOR_DELIVERY: 'text-indigo-400 bg-indigo-900/20', RETURN_REQUESTED: 'text-pink-400 bg-pink-900/20',
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-4xl text-white">Orders</h1>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
          <input className="input pl-10" placeholder="Search by order number or customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border">
            <tr className="text-brand-muted">
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                <td className="px-4 py-3 text-brand-orange font-mono font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-white">{order.customer.name}</p>
                  <p className="text-brand-muted text-xs">{order.address.city}</p>
                </td>
                <td className="px-4 py-3 text-brand-muted">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                <td className="px-4 py-3 text-white font-semibold">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 text-brand-muted">{order.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${statusColor[order.status] ?? 'text-brand-muted bg-brand-card'}`}>{order.status}</span>
                </td>
                <td className="px-4 py-3 text-brand-muted">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setSelected(order); setNewStatus(order.status); setTrackingNumber(order.trackingNumber ?? ''); setCourierName(order.courierName ?? '') }}
                    className="text-brand-orange hover:text-white transition-colors text-xs font-medium">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-brand-muted">No orders found</div>}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card p-6 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold text-lg">{selected.orderNumber}</h2>
            <div className="text-sm space-y-1 text-brand-muted">
              <p><span className="text-white">Customer:</span> {selected.customer.name} · {selected.customer.phone}</p>
              <p><span className="text-white">Items:</span> {selected.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')}</p>
              <p><span className="text-white">Total:</span> {formatPrice(selected.total)}</p>
            </div>
            <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {newStatus === 'SHIPPED' && (
              <>
                <input className="input" placeholder="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                <input className="input" placeholder="Courier Name (e.g. Delhivery)" value={courierName} onChange={(e) => setCourierName(e.target.value)} />
              </>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={updateStatus} disabled={updating} className="btn-primary flex-1">{updating ? 'Updating...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
