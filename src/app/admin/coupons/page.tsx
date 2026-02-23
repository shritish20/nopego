'use client'
import { useEffect, useState } from 'react'
import { Plus, Copy, Trash2, Loader, Tag, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  discountType: 'PERCENT' | 'FLAT'
  discountValue: number
  minOrderValue: number
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  influencer: { name: string; handle: string } | null
  createdAt: string
}

const EMPTY_FORM = {
  code: '',
  discountType: 'PERCENT' as const,
  discountValue: '',
  minOrderValue: '',
  maxUses: '',
  expiresAt: '',
  influencerId: '',
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [influencers, setInfluencers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/coupons').then(r => r.json()),
      fetch('/api/admin/influencers').then(r => r.json()),
    ]).then(([c, inf]) => {
      setCoupons(c.coupons || [])
      setInfluencers(Array.isArray(inf) ? inf : [])
    }).finally(() => setLoading(false))
  }, [])

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    toast.success(`Copied ${code}`)
    setTimeout(() => setCopied(null), 500)
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    })
    if (res.ok) {
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled')
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('Coupon deleted')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.discountValue) { toast.error('Code and discount required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          minOrderValue: parseFloat(form.minOrderValue || '0'),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          influencerId: form.influencerId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoupons(prev => [data, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast.success('Coupon created!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon')
    }
    setSaving(false)
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
        <div>
          <h1 className="font-display text-3xl text-white">COUPONS</h1>
          <p className="text-brand-gray-muted text-sm mt-0.5">{coupons.length} total coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#FF5A00] text-white px-4 py-2 text-sm font-medium hover:bg-[#FF7A30] transition-colors">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-brand-black-card border border-brand-black-border rounded-lg p-6 mb-6">
          <h2 className="font-display text-xl text-white mb-4 tracking-wide">NEW COUPON</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">COUPON CODE *</label>
                <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE20" className="input-brand font-mono tracking-widest" maxLength={30} />
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">DISCOUNT TYPE</label>
                <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))}
                  className="input-brand">
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">
                  DISCOUNT VALUE {form.discountType === 'PERCENT' ? '(%)' : '(₹)'} *
                </label>
                <input required type="number" min="1" value={form.discountValue}
                  onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))}
                  placeholder={form.discountType === 'PERCENT' ? '20' : '200'} className="input-brand" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">MIN ORDER VALUE (₹)</label>
                <input type="number" min="0" value={form.minOrderValue}
                  onChange={e => setForm(p => ({ ...p, minOrderValue: e.target.value }))}
                  placeholder="0" className="input-brand" />
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">MAX USES (leave blank = unlimited)</label>
                <input type="number" min="1" value={form.maxUses}
                  onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
                  placeholder="Unlimited" className="input-brand" />
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">EXPIRY DATE</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="input-brand" />
              </div>
            </div>
            {influencers.length > 0 && (
              <div>
                <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">LINK TO INFLUENCER (optional)</label>
                <select value={form.influencerId} onChange={e => setForm(p => ({ ...p, influencerId: e.target.value }))}
                  className="input-brand">
                  <option value="">None</option>
                  {influencers.map(i => <option key={i.id} value={i.id}>{i.name} ({i.handle})</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-[#FF5A00] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#FF7A30] transition-colors disabled:opacity-50">
                {saving ? <Loader size={14} className="animate-spin" /> : <Tag size={14} />}
                Create Coupon
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-sm text-brand-gray-muted hover:text-white border border-brand-black-border hover:border-[#FF5A00] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon list */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-12 text-brand-gray-muted">No coupons yet</div>
        ) : coupons.map(coupon => (
          <div key={coupon.id}
            className={`bg-brand-black-card border rounded-lg p-4 flex items-center gap-4 ${!coupon.isActive ? 'opacity-60 border-brand-black-border' : 'border-brand-black-border'}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-white font-bold tracking-widest text-sm">{coupon.code}</span>
                <button onClick={() => copyCode(coupon.code)}
                  className="text-brand-gray-muted hover:text-[#FF5A00] transition-colors">
                  {copied === coupon.code ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                {!coupon.isActive && <span className="text-xs text-red-400 font-medium">DISABLED</span>}
                {coupon.influencer && (
                  <span className="text-xs text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded">
                    @{coupon.influencer.handle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-brand-gray-muted">
                <span>
                  {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                </span>
                {coupon.minOrderValue > 0 && <span>Min. order {formatPrice(coupon.minOrderValue)}</span>}
                <span>{coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''} uses</span>
                {coupon.expiresAt && (
                  <span>Expires {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(coupon)}
                className="text-brand-gray-muted hover:text-white transition-colors" title={coupon.isActive ? 'Disable' : 'Enable'}>
                {coupon.isActive ? <ToggleRight size={22} className="text-green-400" /> : <ToggleLeft size={22} />}
              </button>
              <button onClick={() => deleteCoupon(coupon.id)}
                className="text-brand-gray-muted hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
