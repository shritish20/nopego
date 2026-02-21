'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Plus, Search, Edit, Eye } from 'lucide-react'
import Image from 'next/image'

type Product = {
  id: string; name: string; slug: string; basePrice: number; discountedPrice?: number | null
  isActive: boolean; isFeatured: boolean; images: string[]
  category: { name: string }
  variants: { id: string; size: string; color: string; sku: string; stock: number }[]
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/inventory').then((r) => r.json()).then((d) => { setProducts(d.products); setLoading(false) })
  }, [])

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Inventory</h1>
        <Link href="/admin/inventory/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
        <input className="input pl-10" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-brand-muted text-center py-12">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-brand-border">
              <tr className="text-brand-muted">
                {['Product', 'Category', 'Price', 'Variants', 'Total Stock', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-card rounded-lg overflow-hidden flex-shrink-0">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted text-xs">IMG</div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        {p.isFeatured && <span className="text-xs text-yellow-400">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{p.category.name}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-semibold">{formatPrice(p.discountedPrice ?? p.basePrice)}</p>
                    {p.discountedPrice && <p className="text-brand-muted text-xs line-through">{formatPrice(p.basePrice)}</p>}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{p.variants.length}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${totalStock(p) === 0 ? 'text-red-400' : totalStock(p) <= 10 ? 'text-yellow-400' : 'text-white'}`}>
                      {totalStock(p)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/inventory/${p.id}`} className="text-brand-orange hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link href={`/product/${p.slug}`} target="_blank" className="text-brand-muted hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-brand-muted">No products found</div>}
        </div>
      )}
    </div>
  )
}
