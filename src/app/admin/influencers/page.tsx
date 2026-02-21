'use client'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

type Influencer = {
  id: string; name: string; handle: string; platform: string
  followers?: number | null; totalRevenue: number; totalOrders: number
  amountPaid: number; notes?: string | null; createdAt: string
  coupons: { code: string; usedCount: number }[]
}

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', handle: '', platform: 'Instagram', followers: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/influencers').then((r) => r.json()).then((d) => setInfluencers(d.influencers))
  }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/admin/influencers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setInfluencers((prev) => [data.influencer, ...prev])
      setShowForm(false)
      setForm({ name: '', handle: '', platform: 'Instagram', followers: '', notes: '' })
      toast.success('Influencer added')
    } else {
      toast.error('Failed to add')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Influencers</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Influencer
        </button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 max-w-lg">
          <h2 className="text-white font-semibold">Add Influencer</h2>
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="input" placeholder="@handle" value={form.handle} onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))} />
          <select className="input" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
            {['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Other'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input className="input" type="number" placeholder="Followers (optional)" value={form.followers} onChange={(e) => setForm((f) => ({ ...f, followers: e.target.value }))} />
          <textarea className="input h-24 resize-none" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={saving || !form.name} className="btn-primary flex-1">
              {saving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {influencers.map((inf) => (
          <div key={inf.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-semibold">{inf.name}</p>
                <p className="text-brand-orange text-sm">{inf.handle} · {inf.platform}</p>
                {inf.followers && <p className="text-brand-muted text-xs mt-0.5">{inf.followers.toLocaleString()} followers</p>}
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{formatPrice(inf.totalRevenue)}</p>
                <p className="text-brand-muted text-xs">{inf.totalOrders} orders</p>
              </div>
            </div>
            {inf.coupons.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {inf.coupons.map((c) => (
                  <span key={c.code} className="badge bg-brand-orange/10 text-brand-orange border border-brand-orange/20 text-xs">
                    {c.code} ({c.usedCount} uses)
                  </span>
                ))}
              </div>
            )}
            {inf.notes && <p className="text-brand-muted text-xs mt-3 border-t border-brand-border pt-3">{inf.notes}</p>}
          </div>
        ))}
        {influencers.length === 0 && <div className="text-center py-12 text-brand-muted card p-12">No influencers yet</div>}
      </div>
    </div>
  )
}
