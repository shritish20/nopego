'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader, Upload, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Variant = { id: string; size: string; color: string; colorHex?: string | null; sku: string; stock: number; lowStockAt: number }
type Category = { id: string; name: string }
type Product = {
  id: string; name: string; slug: string; description: string; material?: string | null
  careInstructions?: string | null; categoryId: string; basePrice: number
  discountedPrice?: number | null; images: string[]; tags: string[]
  isFeatured: boolean; isActive: boolean; metaTitle?: string | null; metaDescription?: string | null
  category: Category; variants: Variant[]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingStock, setEditingStock] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/inventory/${params.id}`).then((r) => r.json()),
      fetch('/api/admin/inventory/categories').then((r) => r.json()),
    ]).then(([pd, cd]) => {
      setProduct(pd.product)
      setCategories(cd.categories)
    })
  }, [params.id])

  async function save() {
    if (!product) return
    setSaving(true)
    const res = await fetch(`/api/admin/inventory/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        basePrice: parseFloat(String(product.basePrice)),
        discountedPrice: product.discountedPrice ? parseFloat(String(product.discountedPrice)) : null,
      }),
    })
    setSaving(false)
    if (res.ok) toast.success('Product saved')
    else toast.error('Failed to save')
  }

  async function updateStock(variantId: string, stock: number) {
    const res = await fetch(`/api/admin/inventory/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, stock }),
    })
    if (res.ok) {
      setProduct((p) => p ? { ...p, variants: p.variants.map((v) => v.id === variantId ? { ...v, stock } : v) } : p)
      setEditingStock(null)
      toast.success('Stock updated')
    }
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !product) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) setProduct((p) => p ? { ...p, images: [...p.images, data.url] } : p)
    else toast.error('Upload failed')
  }

  if (!product) return <div className="p-8 text-brand-muted">Loading...</div>

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-white">Edit Product</h1>
        <Link href={`/product/${product.slug}`} target="_blank" className="btn-secondary flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4" /> View Live
        </Link>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">Basic Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-brand-muted text-sm mb-1">Name</label>
            <input className="input" value={product.name} onChange={(e) => setProduct((p) => p ? { ...p, name: e.target.value } : p)} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Category</label>
            <select className="input" value={product.categoryId} onChange={(e) => setProduct((p) => p ? { ...p, categoryId: e.target.value } : p)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-brand-muted text-sm mb-1">Description</label>
          <textarea className="input h-28 resize-none" value={product.description} onChange={(e) => setProduct((p) => p ? { ...p, description: e.target.value } : p)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-brand-muted text-sm mb-1">Base Price (₹)</label>
            <input className="input" type="number" value={product.basePrice} onChange={(e) => setProduct((p) => p ? { ...p, basePrice: parseFloat(e.target.value) } : p)} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Sale Price (₹)</label>
            <input className="input" type="number" value={product.discountedPrice ?? ''} onChange={(e) => setProduct((p) => p ? { ...p, discountedPrice: e.target.value ? parseFloat(e.target.value) : null } : p)} />
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={product.isFeatured} onChange={(e) => setProduct((p) => p ? { ...p, isFeatured: e.target.checked } : p)} className="w-4 h-4 accent-brand-orange" />
            <span className="text-brand-muted text-sm">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={product.isActive} onChange={(e) => setProduct((p) => p ? { ...p, isActive: e.target.checked } : p)} className="w-4 h-4 accent-brand-orange" />
            <span className="text-brand-muted text-sm">Active</span>
          </label>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">Images</h2>
        <div className="flex gap-3 flex-wrap">
          {product.images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setProduct((p) => p ? { ...p, images: p.images.filter((_, idx) => idx !== i) } : p)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
              >×</button>
            </div>
          ))}
          <label className="w-20 h-20 bg-brand-card border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange transition-colors">
            {uploading ? <Loader className="w-5 h-5 animate-spin text-brand-muted" /> : <Upload className="w-5 h-5 text-brand-muted" />}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </label>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">Variants & Stock</h2>
        <div className="space-y-2">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-brand-border" style={{ backgroundColor: v.colorHex ?? '#888' }} />
                <p className="text-white text-sm font-medium">{v.size} · {v.color}</p>
                <p className="text-brand-muted text-xs font-mono">{v.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                {editingStock === v.id ? (
                  <>
                    <input
                      type="number"
                      className="input w-20 py-1.5 text-sm text-center"
                      defaultValue={v.stock}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateStock(v.id, parseInt((e.target as HTMLInputElement).value)) }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement)
                        updateStock(v.id, parseInt(input.value))
                      }}
                      className="text-green-400 hover:text-green-300 text-xs font-medium"
                    >Save</button>
                    <button onClick={() => setEditingStock(null)} className="text-brand-muted text-xs">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className={`font-semibold text-sm ${v.stock === 0 ? 'text-red-400' : v.stock <= v.lowStockAt ? 'text-yellow-400' : 'text-white'}`}>
                      {v.stock} in stock
                    </span>
                    <button onClick={() => setEditingStock(v.id)} className="text-brand-orange hover:text-white text-xs font-medium">Edit</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.push('/admin/inventory')} className="btn-secondary flex-1">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
