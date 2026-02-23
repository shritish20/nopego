'use client'
import { useEffect, useState } from 'react'
import { Plus, TrendingUp, Users, ShoppingBag, DollarSign, Loader, X, Edit2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLATFORMS = ['Instagram', 'YouTube', 'Twitter/X', 'Moj', 'Josh', 'ShareChat', 'Other']
const EMPTY_FORM = { name: '', handle: '', platform: 'Instagram', followers: '', notes: '' }

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/influencers')
      .then(r => r.json())
      .then(data => setInfluencers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, followers: form.followers ? parseInt(form.followers) : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInfluencers(prev => [...prev, data])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success(`${data.name} added!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  const totalRevenue = influencers.reduce((s, i) => s + (i.totalRevenue || 0), 0)
  const totalOrders = influencers.reduce((s, i) => s + (i.totalOrders || 0), 0)
  const totalPaid = influencers.reduce((s, i) => s + (i.amountPaid || 0), 0)
  const overallROAS = totalPaid > 0 ? (totalRevenue / totalPaid).toFixed(1) : 'N/A'

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
        <h1 className="font-display text-3xl text-white">INFLUENCERS</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#FF5A00] text-white px-4 py-2 text-sm font-medium hover:bg-[#FF7A30] transition-colors">
          <Plus size={16} /> Add Influencer
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Influencers', value: influencers.length },
          { icon: ShoppingBag, label: 'Orders Generated', value: totalOrders },
          { icon: TrendingUp, label: 'Revenue Driven', value: formatPrice(totalRevenue) },
          { icon: DollarSign, label: 'Overall ROAS', value: overallROAS === 'N/A' ? 'N/A' : `${overallROAS}x` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-brand-card border border-brand-border rounded p-4">
            <Icon size={18} className="text-[#FF5A00] mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-brand-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-brand-card border border-[#FF5A00]/30 rounded-lg p-6 mb-6">
          <h2 className="font-display text-xl text-white mb-4 tracking-wide">ADD INFLUENCER</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">FULL NAME *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Rahul Sharma" className="input-brand" />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">HANDLE *</label>
              <input required value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))}
                placeholder="@rahulsharma" className="input-brand" />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">PLATFORM</label>
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="input-brand">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">FOLLOWERS</label>
              <input type="number" value={form.followers}
                onChange={e => setForm(f => ({ ...f, followers: e.target.value }))}
                placeholder="50000" className="input-brand" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">NOTES</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Niche, past collab notes, payment terms..." className="input-brand" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-[#FF5A00] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#FF7A30] transition-colors disabled:opacity-60">
              {saving ? <Loader size={15} className="animate-spin" /> : <Plus size={15} />} Add
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="text-brand-muted hover:text-white text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-brand-card border border-brand-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border text-xs text-brand-muted">
            <tr>
              {['Influencer', 'Platform', 'Reach', 'Revenue', 'Orders', 'Amount Paid', 'ROAS', 'Coupon', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {influencers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <Users size={32} className="text-brand-border mx-auto mb-3" />
                  <p className="text-brand-muted">No influencers yet</p>
                  <p className="text-brand-muted text-xs mt-1">Add your first influencer to start tracking performance</p>
                </td>
              </tr>
            ) : influencers.map(inf => {
              const roas = parseFloat(inf.roas)
              const roasColor = isNaN(roas) ? 'text-brand-muted' : roas >= 3 ? 'text-green-400' : roas >= 1 ? 'text-yellow-400' : 'text-red-400'
              return (
                <tr key={inf.id} className="hover:bg-brand-bg/40">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{inf.name}</p>
                    <p className="text-[#FF5A00] text-xs">{inf.handle}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{inf.platform}</td>
                  <td className="px-4 py-3 text-brand-muted">
                    {inf.followers ? (inf.followers >= 100000 ? `${(inf.followers / 100000).toFixed(1)}L` : `${(inf.followers / 1000).toFixed(0)}K`) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#FF5A00] font-medium">{formatPrice(inf.totalRevenue || 0)}</td>
                  <td className="px-4 py-3 text-white">{inf.totalOrders || 0}</td>
                  <td className="px-4 py-3 text-brand-muted">{formatPrice(inf.amountPaid || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${roasColor}`}>{inf.roas || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {inf.coupons?.[0] ? (
                      <span className="font-mono text-xs text-[#FF5A00] bg-[#FF5A00]/10 border border-[#FF5A00]/20 px-2 py-1 rounded">
                        {inf.coupons[0].code}
                      </span>
                    ) : (
                      <a href="/admin/coupons" className="text-brand-muted hover:text-[#FF5A00] text-xs underline">Create code</a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(inf)} className="text-brand-muted hover:text-white transition-colors">
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        {[
          { color: 'text-green-400', range: 'ROAS > 3x', meaning: 'For every ₹1 paid, you got ₹3+ in sales. Keep working with them.' },
          { color: 'text-yellow-400', range: 'ROAS 1x–3x', meaning: 'Breaking even or low profit. Negotiate better rates or test different content.' },
          { color: 'text-red-400', range: 'ROAS < 1x', meaning: 'Losing money. Either stop or move to gifting-only model.' },
        ].map(({ color, range, meaning }) => (
          <div key={range} className="bg-brand-card border border-brand-border rounded p-3">
            <p className={`font-bold ${color} mb-1`}>{range}</p>
            <p className="text-brand-muted">{meaning}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-brand-border">
              <div>
                <h2 className="font-display text-xl text-white">{selected.name}</h2>
                <p className="text-[#FF5A00] text-sm">{selected.handle} · {selected.platform}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-brand-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Revenue', value: formatPrice(selected.totalRevenue || 0) },
                  { label: 'Orders', value: selected.totalOrders || 0 },
                  { label: 'Amount Paid', value: formatPrice(selected.amountPaid || 0) },
                  { label: 'ROAS', value: selected.roas || 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-brand-bg border border-brand-border rounded p-3">
                    <p className="text-brand-muted text-xs">{label}</p>
                    <p className="text-white font-bold">{value}</p>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div>
                  <p className="text-brand-muted text-xs mb-1">NOTES</p>
                  <p className="text-white">{selected.notes}</p>
                </div>
              )}
              {selected.coupons?.length > 0 && (
                <div>
                  <p className="text-brand-muted text-xs mb-2">COUPON CODES</p>
                  {selected.coupons.map((c: any) => (
                    <div key={c.code} className="flex justify-between items-center bg-brand-bg rounded p-2 mb-1">
                      <span className="font-mono text-[#FF5A00]">{c.code}</span>
                      <span className="text-brand-muted text-xs">{c.usedCount} uses</span>
                    </div>
                  ))}
                </div>
              )}
              <a href="/admin/coupons" className="flex items-center gap-2 text-[#FF5A00] text-sm hover:underline">
                <Plus size={14} /> Create coupon for this influencer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
