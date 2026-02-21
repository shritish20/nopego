'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Coupon = {
  id: string; code: string; discountType: string; discountValue: number
  minOrderValue: number; maxUses?: number | null; usedCount: number
  isActive: boolean; expiresAt?: string | null
  influencer?: { name: string } | null
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '0', maxUses: '', expiresAt: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/coupons').then((r) => r.json()).then((d) => setCoupons(d.coupons))
  }, [])

  async function createCoupon() {
    setSaving(true)
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setCoupons((prev) => [data.coupon, ...prev])
      setShowForm(false)
      setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderValue: '0', maxUses: '', expiresAt: '' })
      toast.success('Coupon created')
    } else {
      toast.error('Failed to create coupon')
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive } : c)))
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Coupon deleted')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 max-w-2xl">
          <h2 className="text-white font-semibold">Create Coupon</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-muted text-sm mb-1">Code</label>
              <input className="input uppercase" placeholder="SAVE20" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-1">Discount Type</label>
              <select className="input" value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-1">Discount Value</label>
              <input className="input" type="number" placeholder={form.discountType === 'PERCENTAGE' ? '20' : '100'} value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-1">Min Order (₹)</label>
              <input className="input" type="number" value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} />
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-1">Max Uses (blank = unlimited)</label>
              <input className="input" type="number" placeholder="100" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} />
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-1">Expires At (optional)</label>
              <input className="input" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={createCoupon} disabled={saving || !form.code || !form.discountValue} className="btn-primary flex-1">
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border">
            <tr className="text-brand-muted">
              {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-brand-border hover:bg-brand-bg/50">
                <td className="px-4 py-3 font-mono font-bold text-brand-orange">{c.code}</td>
                <td className="px-4 py-3 text-white">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-4 py-3 text-brand-muted">₹{c.minOrderValue}</td>
                <td className="px-4 py-3 text-brand-muted">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                <td className="px-4 py-3 text-brand-muted">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c.id, !c.isActive)}
                    className={`badge cursor-pointer ${c.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteCoupon(c.id)} className="text-brand-muted hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="text-center py-12 text-brand-muted">No coupons yet</div>}
      </div>
    </div>
  )
}
