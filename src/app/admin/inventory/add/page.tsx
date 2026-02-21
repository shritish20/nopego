'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Upload, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

type Category = { id: string; name: string }
type VariantForm = { size: string; color: string; colorHex: string; sku: string; stock: string }

const SIZES = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11']
const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy/White', hex: '#1B3A6B' },
  { name: 'Black/Orange', hex: '#1A1A1A' },
  { name: 'Grey', hex: '#888888' },
]

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', material: '', careInstructions: '',
    categoryId: '', basePrice: '', discountedPrice: '',
    isFeatured: false, metaTitle: '', metaDescription: '',
    images: [] as string[], tags: '' ,
  })
  const [variants, setVariants] = useState<VariantForm[]>([])

  useEffect(() => {
    fetch('/api/admin/inventory/categories').then((r) => r.json()).then((d) => {
      setCategories(d.categories)
      if (d.categories.length > 0) setForm((f) => ({ ...f, categoryId: d.categories[0].id }))
    })
  }, [])

  function addVariant() {
    setVariants((v) => [...v, { size: 'UK8', color: 'White', colorHex: '#FFFFFF', sku: '', stock: '0' }])
  }

  function updateVariant(i: number, field: keyof VariantForm, value: string) {
    setVariants((v) => v.map((vv, idx) => idx === i ? { ...vv, [field]: value } : vv))
  }

  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i))
  }

  function generateSKUs() {
    const slug = form.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 8)
    setVariants((v) => v.map((vv) => ({
      ...vv,
      sku: `${slug}-${vv.color.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)}-${vv.size}`
    })))
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      setForm((f) => ({ ...f, images: [...f.images, data.url] }))
    } else {
      toast.error('Upload failed')
    }
  }

  async function save() {
    if (!form.name || !form.categoryId || !form.basePrice) {
      toast.error('Fill in required fields')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        variants,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Product created!')
      router.push('/admin/inventory')
    } else {
      toast.error('Failed to create product')
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <h1 className="font-display text-4xl text-white">Add Product</h1>

      <div className="card p-6 space-y-5">
        <h2 className="text-white font-semibold">Basic Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-brand-muted text-sm mb-1">Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Category *</label>
            <select className="input" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-brand-muted text-sm mb-1">Description *</label>
          <textarea className="input h-28 resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-brand-muted text-sm mb-1">Material</label>
            <input className="input" placeholder="Mesh upper, Rubber sole..." value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Care Instructions</label>
            <input className="input" placeholder="Wipe clean with damp cloth..." value={form.careInstructions} onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Base Price (₹) *</label>
            <input className="input" type="number" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Sale Price (₹)</label>
            <input className="input" type="number" value={form.discountedPrice} onChange={(e) => setForm((f) => ({ ...f, discountedPrice: e.target.value }))} />
          </div>
          <div>
            <label className="block text-brand-muted text-sm mb-1">Tags (comma separated)</label>
            <input className="input" placeholder="bestseller, new, running" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-brand-orange" />
          <span className="text-brand-muted text-sm">Featured on homepage</span>
        </label>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">Images</h2>
        <div className="flex gap-3 flex-wrap">
          {form.images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
              >×</button>
            </div>
          ))}
          <label className="w-20 h-20 bg-brand-card border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange transition-colors">
            {uploading ? <Loader className="w-5 h-5 animate-spin text-brand-muted" /> : <Upload className="w-5 h-5 text-brand-muted" />}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </label>
        </div>
        <p className="text-brand-muted text-xs">First image is the main product image. Recommended: 800x800px square.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Variants</h2>
          <div className="flex gap-2">
            {form.name && <button onClick={generateSKUs} className="btn-secondary px-3 py-1.5 text-xs">Auto-generate SKUs</button>}
            <button onClick={addVariant} className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs">
              <Plus className="w-3 h-3" /> Add Variant
            </button>
          </div>
        </div>

        {variants.length === 0 && (
          <p className="text-brand-muted text-sm text-center py-4">No variants yet. Click "Add Variant" to add size/color combinations.</p>
        )}

        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 p-3 bg-brand-bg rounded-lg items-end">
            <div>
              <label className="block text-brand-muted text-xs mb-1">Size</label>
              <select className="input text-sm py-2" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-brand-muted text-xs mb-1">Color</label>
              <select className="input text-sm py-2" value={v.color} onChange={(e) => {
                const color = COLORS.find((c) => c.name === e.target.value)
                updateVariant(i, 'color', e.target.value)
                if (color) updateVariant(i, 'colorHex', color.hex)
              }}>
                {COLORS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                <option value="custom">Custom...</option>
              </select>
            </div>
            <div>
              <label className="block text-brand-muted text-xs mb-1">SKU</label>
              <input className="input text-sm py-2 font-mono" placeholder="NPG-SR-WHT-UK8" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} />
            </div>
            <div>
              <label className="block text-brand-muted text-xs mb-1">Stock</label>
              <input className="input text-sm py-2" type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
            </div>
            <button onClick={() => removeVariant(i)} className="p-2 text-brand-muted hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-white font-semibold">SEO (optional)</h2>
        <input className="input" placeholder="Meta Title" value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} />
        <textarea className="input h-20 resize-none" placeholder="Meta Description (max 160 chars)" maxLength={160} value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} />
      </div>

      <div className="flex gap-4">
        <button onClick={() => router.push('/admin/inventory')} className="btn-secondary flex-1">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {saving && <Loader className="w-4 h-4 animate-spin" />}
          {saving ? 'Creating...' : 'Create Product'}
        </button>
      </div>
    </div>
  )
}
