'use client'
import { useEffect, useState } from 'react'
import { Search, Users, TrendingUp, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(d => setCustomers(d.customers || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.includes(search) ||
      c.phone?.includes(search)
    const matchFilter = filter === 'ALL' ||
      (filter === 'REPEAT' && c.totalOrders > 1) ||
      (filter === 'NEW' && c.totalOrders <= 1)
    return matchSearch && matchFilter
  })

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const repeatCustomers = customers.filter(c => c.totalOrders > 1).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-white mb-6">CUSTOMERS</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Customers', value: customers.length },
          { icon: TrendingUp, label: 'Repeat Buyers', value: `${repeatCustomers} (${customers.length ? Math.round(repeatCustomers / customers.length * 100) : 0}%)` },
          { icon: ShoppingBag, label: 'Total Revenue', value: formatPrice(totalRevenue) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-brand-card border border-brand-border rounded p-4">
            <Icon size={18} className="text-[#FF5A00] mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-brand-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input placeholder="Search by name, email, phone..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-brand pl-9" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-brand w-40">
          <option value="ALL">All</option>
          <option value="REPEAT">Repeat</option>
          <option value="NEW">New</option>
        </select>
      </div>

      <div className="bg-brand-card border border-brand-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border text-xs text-brand-muted">
            <tr>
              {['Customer', 'Phone', 'Orders', 'Total Spent', 'Last Order', 'WhatsApp'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-brand-bg/40">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="text-brand-muted text-xs">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-brand-muted">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-white font-medium">{c.totalOrders}</td>
                <td className="px-4 py-3 text-[#FF5A00] font-medium">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-3 text-brand-muted text-xs">
                  {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.whatsappOptIn ? 'bg-green-500/20 text-green-400' : 'bg-brand-border text-brand-muted'}`}>
                    {c.whatsappOptIn ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-brand-muted py-8">No customers found</p>
        )}
      </div>
    </div>
  )
}
