'use client'
import { useEffect, useState } from 'react'
import { formatDate, formatPrice } from '@/lib/utils'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'

type Return = {
  id: string; reason: string; description?: string | null; status: string; createdAt: string
  order: { orderNumber: string; total: number; customer: { name: string; phone?: string | null }; address: { city: string }; items: { productName: string; quantity: number; size: string }[] }
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [selected, setSelected] = useState<Return | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/returns').then((r) => r.json()).then((d) => setReturns(d.returns))
  }, [])

  async function handleAction(status: string) {
    if (!selected) return
    setProcessing(true)
    const res = await fetch(`/api/admin/returns/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes }),
    })
    if (res.ok) {
      setReturns((prev) => prev.map((r) => r.id === selected.id ? { ...r, status } : r))
      setSelected(null)
      toast.success(`Return ${status.toLowerCase()}`)
    } else {
      toast.error('Action failed')
    }
    setProcessing(false)
  }

  const statusColor: Record<string, string> = {
    REQUESTED: 'border-l-yellow-400', APPROVED: 'border-l-green-400',
    REJECTED: 'border-l-red-400', PICKUP_SCHEDULED: 'border-l-blue-400',
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-4xl text-white">Returns</h1>
      <div className="space-y-4">
        {returns.map((r) => (
          <div key={r.id} className={`card p-5 border-l-4 ${statusColor[r.status] ?? 'border-l-brand-border'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-orange font-medium">{r.order.orderNumber}</p>
                <p className="text-white">{r.order.customer.name} · {r.order.address.city}</p>
                <p className="text-brand-muted text-sm mt-1">Reason: {r.reason.replace(/_/g, ' ')} · {formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge text-xs ${r.status === 'APPROVED' ? 'bg-green-900/30 text-green-400' : r.status === 'REQUESTED' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>{r.status}</span>
                <button onClick={() => { setSelected(r); setNotes('') }} className="text-brand-orange hover:text-white transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {returns.length === 0 && <div className="text-center py-12 text-brand-muted card p-12">No return requests</div>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card p-6 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white font-semibold">Return — {selected.order.orderNumber}</h2>
            <div className="text-sm space-y-2 text-brand-muted">
              <p><span className="text-white">Customer:</span> {selected.order.customer.name} · {selected.order.customer.phone}</p>
              <p><span className="text-white">Reason:</span> {selected.reason.replace(/_/g, ' ')}</p>
              {selected.description && <p><span className="text-white">Notes:</span> {selected.description}</p>}
              <p><span className="text-white">Items:</span> {selected.order.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')}</p>
              <p><span className="text-white">Order Total:</span> {formatPrice(selected.order.total)}</p>
            </div>
            <textarea className="input h-24 resize-none" placeholder="Admin notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {selected.status === 'REQUESTED' && (
              <div className="flex gap-3">
                <button onClick={() => handleAction('REJECTED')} disabled={processing} className="btn-secondary flex-1 border-red-800 text-red-400">Reject</button>
                <button onClick={() => handleAction('APPROVED')} disabled={processing} className="btn-primary flex-1">Approve & Schedule Pickup</button>
              </div>
            )}
            <button onClick={() => setSelected(null)} className="btn-secondary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
