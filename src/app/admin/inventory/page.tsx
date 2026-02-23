'use client'
import { useEffect, useState } from 'react'
import { Search, AlertTriangle, Plus, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/admin/inventory')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoading(false))
  }, [])

  async function saveStock(variantId: string, stock: number) {
    const res = await fetch(`/api/admin/inventory/${variantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    if (res.ok) {
      setProducts(prev => prev.map(p => ({
        ...p,
        variants: p.variants.map((v: any) => v.id === variantId ? { ...v, stock } : v),
      })))
      const { [variantId]: _, ...rest } = editing
      setEditing(rest)
      toast.success('Stock updated')
    } else {
      toast.error('Failed to update stock')
    }
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
  const allVariants = products.flatMap(p => p.variants)
  const lowStockCount = allVariants.filter((v: any) => v.stock > 0 && v.stock <= v.lowStockAt).length
  const outOfStockCount = allVariants.filter((v: any) => v.stock === 0).length
  const totalUnits = allVariants.reduce((s: number, v: any) => s + v.stock, 0)

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
        <h1 className="font-display text-3xl text-white">INVENTORY</h1>
        <a href="/admin/inventory/add"
          className="flex items-center gap-2 bg-[#FF5A00] text-white px-4 py-2 text-sm font-medium hover:bg-[#FF7A30] transition-colors">
          <Plus size={16} /> Add Product
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
          <p className="text-yellow-400 font-bold text-2xl">{lowStockCount}</p>
          <p className="text-yellow-400 text-sm">Low Stock SKUs</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
          <p className="text-red-400 font-bold text-2xl">{outOfStockCount}</p>
          <p className="text-red-400 text-sm">Out of Stock</p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded p-4">
          <p className="text-white font-bold text-2xl">{totalUnits}</p>
          <p className="text-brand-muted text-sm">Total Units</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-brand pl-9" />
      </div>

      <div className="space-y-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-brand-card border border-brand-border rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
              <div>
                <h3 className="font-medium text-white">{product.name}</h3>
                <p className="text-brand-muted text-xs">{product.category?.name}</p>
              </div>
              <a href={`/admin/inventory/${product.id}`}
                className="text-[#FF5A00] text-xs hover:underline flex items-center gap-1">
                <Edit2 size={12} /> Edit Product
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-brand-muted border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Color</th>
                    <th className="px-4 py-2 text-left">Stock</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {product.variants.map((variant: any) => {
                    const isLow = variant.stock > 0 && variant.stock <= variant.lowStockAt
                    const isOut = variant.stock === 0
                    return (
                      <tr key={variant.id} className={isOut ? 'bg-red-500/5' : isLow ? 'bg-yellow-500/5' : ''}>
                        <td className="px-4 py-2 font-mono text-xs text-brand-muted">{variant.sku}</td>
                        <td className="px-4 py-2 text-white">{variant.size}</td>
                        <td className="px-4 py-2 text-brand-muted">
                          <div className="flex items-center gap-2">
                            {variant.colorHex && (
                              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: variant.colorHex }} />
                            )}
                            {variant.color}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {editing[variant.id] !== undefined ? (
                            <div className="flex items-center gap-2">
                              <input type="number" min="0" value={editing[variant.id]}
                                onChange={e => setEditing(prev => ({ ...prev, [variant.id]: parseInt(e.target.value) || 0 }))}
                                className="w-20 bg-brand-bg border border-[#FF5A00] text-white text-sm px-2 py-1 focus:outline-none" />
                              <button onClick={() => saveStock(variant.id, editing[variant.id])}
                                className="text-green-400 hover:text-green-300">
                                <Save size={14} />
                              </button>
                              <button onClick={() => { const { [variant.id]: _, ...rest } = editing; setEditing(rest) }}
                                className="text-brand-muted hover:text-white">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setEditing(prev => ({ ...prev, [variant.id]: variant.stock }))}
                              className="flex items-center gap-2 hover:text-[#FF5A00] transition-colors group">
                              <span className={`font-medium ${isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'}`}>
                                {variant.stock}
                              </span>
                              <Edit2 size={12} className="text-brand-subtle opacity-0 group-hover:opacity-100" />
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">Out of Stock</span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1 w-fit">
                              <AlertTriangle size={10} /> Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-2" />
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
