'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, Loader } from 'lucide-react'
import { formatPrice, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Wrong Size',
  WRONG_PRODUCT: 'Wrong Product',
  DAMAGED: 'Damaged',
  NOT_AS_DESCRIBED: 'Not as Described',
  CHANGED_MIND: 'Changed Mind',
  OTHER: 'Other',
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
  RETURN_PICKED: 'bg-[#FF5A00]/20 text-[#FF7A30] border border-[#FF5A00]/30',
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetch('/api/admin/returns')
      .then(r => r.json())
      .then(d => setReturns(d.returns || []))
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(returnId: string, action: 'APPROVED' | 'REJECTED') {
    setProcessing(true)
    const res = await fetch(`/api/admin/returns/${returnId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action, adminNote: adminNote.trim() || undefined }),
    })
    if (res.ok) {
      setReturns(prev => prev.map(r => r.id === returnId ? { ...r, status: action, adminNote } : r))
      if (selected?.id === returnId) setSelected((s: any) => ({ ...s, status: action, adminNote }))
      toast.success(`Return ${action.toLowerCase()}`)
      setAdminNote('')
    } else {
      toast.error('Failed to update return')
    }
    setProcessing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pending = returns.filter(r => r.status === 'PENDING')

  return (
    <div className="flex gap-6 h-full">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-white">RETURNS</h1>
            <p className="text-brand-gray-muted text-sm mt-0.5">{returns.length} total · {pending.length} pending</p>
          </div>
          {pending.length > 0 && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              {pending.length} PENDING
            </span>
          )}
        </div>

        <div className="bg-brand-black-card border border-brand-black-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-black-border">
              <tr className="text-xs text-brand-gray-muted uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-black-border">
              {returns.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-gray-muted">No return requests</td></tr>
              ) : returns.map(r => (
                <tr key={r.id} className={`hover:bg-brand-black-card/50 transition-colors ${selected?.id === r.id ? 'bg-[#FF5A00]/5' : ''}`}>
                  <td className="px-4 py-3 text-white font-mono text-xs">{r.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs">{r.customer?.name}</p>
                    <p className="text-brand-gray-muted text-xs">{r.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-gray-text text-xs">{REASON_LABELS[r.reason] || r.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_STYLES[r.status] || ''}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-gray-muted text-xs">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(r); setAdminNote(r.adminNote || '') }}
                      className="text-brand-gray-muted hover:text-[#FF5A00] transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 bg-brand-black-card border border-brand-black-border rounded-lg p-5 h-fit sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-white">RETURN DETAIL</h2>
            <button onClick={() => setSelected(null)} className="text-brand-gray-muted hover:text-white text-xs">
              Close
            </button>
          </div>

          <div className="space-y-3 text-sm mb-5">
            <div>
              <p className="text-brand-gray-muted text-xs">Order</p>
              <p className="text-white font-mono">{selected.orderNumber}</p>
            </div>
            <div>
              <p className="text-brand-gray-muted text-xs">Customer</p>
              <p className="text-white">{selected.customer?.name}</p>
              <p className="text-brand-gray-muted text-xs">{selected.customer?.email}</p>
              <p className="text-brand-gray-muted text-xs">{selected.customer?.phone}</p>
            </div>
            <div>
              <p className="text-brand-gray-muted text-xs">Reason</p>
              <p className="text-white">{REASON_LABELS[selected.reason] || selected.reason}</p>
            </div>
            {selected.description && (
              <div>
                <p className="text-brand-gray-muted text-xs">Customer note</p>
                <p className="text-brand-gray-text">{selected.description}</p>
              </div>
            )}
            <div>
              <p className="text-brand-gray-muted text-xs">Status</p>
              <span className={`badge text-xs ${STATUS_STYLES[selected.status] || ''}`}>{selected.status}</span>
            </div>
          </div>

          {selected.status === 'PENDING' && (
            <>
              <div className="mb-4">
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">ADMIN NOTE (optional)</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  rows={3} placeholder="Note for internal records..."
                  className="input-brand resize-none text-xs" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(selected.id, 'APPROVED')} disabled={processing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                  {processing ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Approve
                </button>
                <button onClick={() => handleAction(selected.id, 'REJECTED')} disabled={processing}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-2 text-sm font-medium transition-colors disabled:opacity-50">
                  {processing ? <Loader size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
