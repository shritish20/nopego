'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader, Upload, Plus, Trash2, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface VariantRow {
  id: string
  size: string
  color: string
  colorHex: string
  sku: string
  stock: number
  lowStockAt: number
  isNew?: boolean
}

const STANDARD_SIZES = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11']

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [careInstructions, setCareInstructions] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [basePrice, setBasePrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [tags, setTags] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [originalSlug, setOriginalSlug] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/inventory/${params.id}`).then(r => r.json()),
      fetch('/api/admin/inventory/categories').then(r => r.json()),
    ]).then(([product, cats]) => {
      setCategories(cats.categories || [])
      if (product.error) {
        toast.error('Product not found')
        router.push('/admin/inventory')
        return
      }
      setName(product.name)
      setOriginalSlug(product.slug)
      setDescription(product.description)
      setMaterial(product.material || '')
      setCareInstructions(product.careInstructions || '')
      setCategoryId(product.categoryId)
      setBasePrice(String(product.basePrice))
      setDiscountedPrice(product.discountedPrice ? String(product.discountedPrice) : '')
      setIsFeatured(product.isFeatured)
      setIsActive(product.isActive)
      setTags(product.tags.join(', '))
      setMetaTitle(product.metaTitle || '')
      setMetaDescription(product.metaDescription || '')
      setImages(product.images || [])
      setVariants(product.variants.map((v: any) => ({ ...v })))
    }).finally(() => setLoading(false))
  }, [params.id])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setImages(prev => [...prev, data.url])
        toast.success('Image uploaded!')
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function updateVariant(id: string, field: keyof VariantRow, value: string | number) {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  function addVariant() {
    setVariants(prev => [...prev, {
      id: crypto.randomUUID(),
      size: 'UK8', color: 'White', colorHex: '#FFFFFF',
      sku: `NPG-${Date.now()}`,
      stock: 0, lowStockAt: 3, isNew: true,
    }])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (variants.length === 0) { toast.error('Add at least one variant'); return }
    if (images.length === 0) { toast.error('Add at least one image'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/inventory/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, material, careInstructions, categoryId,
          basePrice: parseFloat(basePrice),
          discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          images, isFeatured, isActive,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          metaTitle: metaTitle || name,
          metaDescription: metaDescription || description.slice(0, 160),
          variants: variants.map(({ id, isNew, ...v }) => v),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Product updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Archive this product? It will no longer show on the store but order history is preserved.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/inventory/${params.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Product archived')
      router.push('/admin/inventory')
    } else {
      toast.error('Failed to archive')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const discountPct = basePrice && discountedPrice
    ? Math.round(((parseFloat(basePrice) - parseFloat(discountedPrice)) / parseFloat(basePrice)) * 100)
    : null

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-brand-muted hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-3xl text-white">EDIT PRODUCT</h1>
            <p className="text-brand-muted text-sm mt-0.5 font-mono">/product/{originalSlug}</p>
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 text-sm transition-colors rounded disabled:opacity-50">
          {deleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Archive Product
        </button>
      </div>

      {!isActive && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded mb-6 text-sm">
          <AlertTriangle size={16} />
          This product is archived and not visible on the store.
          <button onClick={() => setIsActive(true)} className="underline hover:no-underline ml-auto">Restore</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6">
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">BASIC INFORMATION</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-muted text-xs tracking-wider mb-1.5">PRODUCT NAME *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-brand" />
              </div>
              <div>
                <label className="block text-brand-muted text-xs tracking-wider mb-1.5">CATEGORY *</label>
                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input-brand">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">DESCRIPTION *</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)}
                rows={4} className="input-brand resize-none" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-muted text-xs tracking-wider mb-1.5">MATERIAL</label>
                <input value={material} onChange={e => setMaterial(e.target.value)} className="input-brand" />
              </div>
              <div>
                <label className="block text-brand-muted text-xs tracking-wider mb-1.5">CARE INSTRUCTIONS</label>
                <input value={careInstructions} onChange={e => setCareInstructions(e.target.value)} className="input-brand" />
              </div>
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">TAGS (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="bestseller, running, lightweight" className="input-brand" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-11 h-6 rounded-full transition-colors ${isFeatured ? 'bg-[#FF5A00]' : 'bg-brand-border'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${isFeatured ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-white text-sm">Featured on homepage</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors ${isActive ? 'bg-green-500' : 'bg-brand-border'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${isActive ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-white text-sm">Active (visible on store)</span>
              </label>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6">
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">PRICING</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">BASE PRICE (₹)</label>
              <input required type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="input-brand" />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">SALE PRICE (₹)</label>
              <input type="number" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} className="input-brand" />
            </div>
            <div className="flex items-end pb-0.5">
              {discountPct && discountPct > 0 ? (
                <div className="w-full bg-[#FF5A00]/10 border border-[#FF5A00]/30 rounded p-3 text-center">
                  <p className="text-[#FF5A00] font-bold text-2xl">{discountPct}% OFF</p>
                </div>
              ) : (
                <div className="w-full bg-brand-bg border border-brand-border rounded p-3 text-center text-brand-muted text-sm">
                  No discount
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6">
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">IMAGES</h2>
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {images.map((url, i) => (
                <div key={i} className={`relative aspect-square rounded overflow-hidden border group ${i === 0 ? 'border-[#FF5A00]' : 'border-brand-border'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex">
                    <X size={12} className="text-white" />
                  </button>
                  {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[#FF5A00] text-white text-xs text-center py-0.5">Main</div>}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 border border-brand-border hover:border-[#FF5A00] text-brand-muted hover:text-white px-4 py-2 text-sm transition-colors disabled:opacity-50">
              {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
            <div className="flex gap-2 flex-1">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="Or paste Cloudinary URL..." className="input-brand text-sm" />
              <button type="button" onClick={() => { if (imageUrl) { setImages(p => [...p, imageUrl]); setImageUrl('') } }}
                disabled={!imageUrl}
                className="flex items-center gap-1 border border-brand-border hover:border-[#FF5A00] text-brand-muted hover:text-white px-3 text-sm transition-colors disabled:opacity-40">
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-white tracking-wide">VARIANTS</h2>
            <span className="text-[#FF5A00] text-sm">{variants.length} SKUs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-brand-muted border-b border-brand-border">
                <tr>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Color</th>
                  <th className="px-3 py-2 text-left">Hex</th>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-left w-24">Stock</th>
                  <th className="px-3 py-2 text-left w-24">Alert≤</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {variants.map(v => (
                  <tr key={v.id} className={v.isNew ? 'bg-[#FF5A00]/5' : ''}>
                    <td className="px-3 py-2">
                      <select value={v.size} onChange={e => updateVariant(v.id, 'size', e.target.value)}
                        className="bg-transparent border border-brand-border text-white text-sm px-2 py-1.5 focus:outline-none focus:border-[#FF5A00] w-24">
                        {STANDARD_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input value={v.color} onChange={e => updateVariant(v.id, 'color', e.target.value)}
                        className="bg-transparent border border-brand-border text-white text-sm px-2 py-1.5 focus:outline-none focus:border-[#FF5A00] w-28" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="color" value={v.colorHex || '#888888'}
                        onChange={e => updateVariant(v.id, 'colorHex', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border border-brand-border bg-transparent" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={v.sku} onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                        className="bg-transparent border border-brand-border text-brand-muted text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-[#FF5A00] w-40" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={v.stock}
                        onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                        className={`bg-transparent border text-sm px-2 py-1.5 focus:outline-none focus:border-[#FF5A00] w-20 text-center ${
                          v.stock === 0 ? 'border-red-500/50 text-red-400' :
                          v.stock <= v.lowStockAt ? 'border-yellow-500/50 text-yellow-400' :
                          'border-brand-border text-white'
                        }`} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={v.lowStockAt}
                        onChange={e => updateVariant(v.id, 'lowStockAt', parseInt(e.target.value) || 3)}
                        className="bg-transparent border border-brand-border text-brand-muted text-sm px-2 py-1.5 focus:outline-none focus:border-[#FF5A00] w-20 text-center" />
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => setVariants(p => p.filter(x => x.id !== v.id))}
                        className="text-brand-muted hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addVariant}
            className="mt-3 flex items-center gap-2 text-brand-muted hover:text-[#FF5A00] text-sm transition-colors">
            <Plus size={15} /> Add variant
          </button>
        </section>

        {/* SEO */}
        <section className="bg-brand-card border border-brand-border rounded-lg p-6">
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">SEO</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">META TITLE</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="input-brand" maxLength={60} />
              <p className="text-brand-muted text-xs mt-1">{metaTitle.length}/60</p>
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">META DESCRIPTION</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                rows={2} className="input-brand resize-none" maxLength={160} />
              <p className="text-brand-muted text-xs mt-1">{metaDescription.length}/160</p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-8">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#FF5A00] text-white px-10 py-4 font-display text-xl tracking-widest hover:bg-[#FF7A30] transition-colors disabled:opacity-60">
            {saving ? <><Loader size={18} className="animate-spin" /> SAVING...</> : 'SAVE CHANGES'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-brand-muted hover:text-white text-sm transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
