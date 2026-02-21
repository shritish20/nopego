'use client'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search } from 'lucide-react'

type Customer = { id: string; name: string; email: string; phone?: string | null; totalOrders: number; totalSpent: number; lastOrderAt?: string | null; whatsappOptIn: boolean; _count: { orders: number } }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('all')

  useEffect(() => {
    fetch('/api/admin/customers').then((r) => r.json()).then((d) => setCustomers(d.customers))
  }, [])

  const filtered = customers.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const matchSegment = segment === 'all' || (segment === 'repeat' && c.totalOrders >= 2) || (segment === 'new' && c.totalOrders <= 1)
    return matchSearch && matchSegment
  })

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-4xl text-white">Customers</h1>
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
          <input className="input pl-10" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['repeat', 'Repeat Buyers'], ['new', 'New']].map(([v, l]) => (
            <button key={v} onClick={() => setSegment(v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${segment === v ? 'bg-brand-orange text-white' : 'border border-brand-border text-brand-muted hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-border">
            <tr className="text-brand-muted">
              {['Name', 'Email', 'Phone', 'Orders', 'Spent', 'Last Order', 'WhatsApp'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                <td className="px-4 py-3 text-brand-muted">{c.email}</td>
                <td className="px-4 py-3 text-brand-muted">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-white">{c.totalOrders}</td>
                <td className="px-4 py-3 text-white font-semibold">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-3 text-brand-muted">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
                <td className="px-4 py-3">{c.whatsappOptIn ? <span className="text-green-400 text-xs">✓ Yes</span> : <span className="text-brand-muted text-xs">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-brand-muted">No customers found</div>}
      </div>
    </div>
  )
}
