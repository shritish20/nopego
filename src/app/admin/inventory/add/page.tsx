'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Upload, X, Loader, ArrowLeft, ImageIcon } from 'lucide-react'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VariantRow {
  id: string
  size: string
  color: string
  colorHex: string
  sku: string
  stock: number
  lowStockAt: number
}

const STANDARD_SIZES = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11']
const COMMON_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'Navy', hex: '#1B3A6B' },
  { name: 'Red', hex: '#C0392B' },
  { name: 'Grey', hex: '#7F8C8D' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Green', hex: '#27AE60' },
]

function generateSKU(productName: string, color: string, size: string): string {
  const brand = 'NPG'
  const name = productName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)
  const col = color.replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 3)
  return `${brand}-${name}-${col}-${size}`
}

export default function AddProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [careInstructions, setCareInstructions] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [basePrice, setBasePrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [tags, setTags] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [bulkColor, setBulkColor] = useState('White')
  const [bulkColorHex, setBulkColorHex] = useState('#FFFFFF')
  const [bulkStock, setBulkStock] = useState('10')
  const [saving, setSaving] = useState(false)

  // FIX: useEffect (not useState) to load categories on mount
  useEffect(() => {
    fetch('/api/admin/inventory/categories')
      .then(r => r.json())
      .then(d => {
        setCategories(d.categories || [])
        if (d.categories?.length) setCategoryId(d.categories[0].id)
      })
      .catch(() => {})
  }, [])

  const slug = slugify(name)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Only image files'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size: 5MB'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) { setImages(prev => [...prev, data.url]); toast.success('Image uploaded!') }
    } catch {
      toast.error('Upload failed')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function addImageByUrl() {
    if (!imageUrl.trim()) return
    setImages(prev => [...prev, imageUrl.trim()])
    setImageUrl('')
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function addBulkVariants() {
    if (!name.trim()) { toast.error('Enter product name first'); return }
    const newVariants: VariantRow[] = STANDARD_SIZES.map(size => ({
      id: crypto.randomUUID(),
      size,
      color: bulkColor,
      colorHex: bulkColorHex,
      sku: generateSKU(name, bulkColor, size),
      stock: parseInt(bulkStock) || 0,
      lowStockAt: 3,
    }))
    setVariants(prev => [...prev, ...newVariants])
  }

  function addSingleVariant() {
    if (!name.trim()) { toast.error('Enter product name first'); return }
    setVariants(prev => [...prev, {
      id: crypto.randomUUID(),
      size: 'UK8',
      color: 'White',
      colorHex: '#FFFFFF',
      sku: generateSKU(name, 'White', 'UK8'),
      stock: 0,
      lowStockAt: 3,
    }])
  }

  function updateVariant(id: string, field: keyof VariantRow, value: string | number) {
    setVariants(prev => prev.map(v => {
      if (v.id !== id) return v
      const updated = { ...v, [field]: value }
      if (field === 'color' || field === 'size') {
        updated.sku = generateSKU(name, updated.color, updated.size)
      }
      return updated
    }))
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Product name required'); return }
    if (!categoryId) { toast.error('Select a category'); return }
    if (!basePrice || parseFloat(basePrice) <= 0) { toast.error('Enter valid price'); return }
    if (variants.length === 0) { toast.error('Add at least one variant'); return }
    if (images.length === 0) { toast.error('Add at least one product image'); return }
    const skus = variants.map(v => v.sku)
    if (new Set(skus).size !== skus.length) { toast.error('Duplicate SKUs detected'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), slug, description: description.trim(),
          material: material.trim(), careInstructions: careInstructions.trim(),
          categoryId,
          basePrice: parseFloat(basePrice),
          discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          images, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isFeatured,
          metaTitle: metaTitle || name,
          metaDescription: metaDescription || description.slice(0, 160),
          variants: variants.map(({ id, ...v }) => v),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Product created!')
      router.push('/admin/inventory')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product')
    }
    setSaving(false)
  }

  const discountPct = basePrice && discountedPrice
    ? Math.round(((parseFloat(basePrice) - parseFloat(discountedPrice)) / parseFloat(basePrice)) * 100)
    : null

  const labelClass = 'block text-brand-gray-muted text-xs tracking-wider mb-1.5'
  const sectionClass = 'bg-brand-black-card border border-brand-black-border rounded-lg p-6'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-brand-gray-muted hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-white">ADD PRODUCT</h1>
          <p className="text-brand-gray-muted text-sm mt-0.5">New product will be live immediately after saving</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Information */}
        <section className={sectionClass}>
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">BASIC INFORMATION</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PRODUCT NAME *</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Street Runner Pro" className="input-brand" />
                {name && (
                  <p className="text-brand-gray-muted text-xs mt-1">
                    Slug: <span className="text-[#FF5A00] font-mono">/product/{slug}</span>
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>CATEGORY *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="input-brand" required>
                  {categories.length === 0
                    ? <option value="">Loading categories...</option>
                    : categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>DESCRIPTION *</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)}
                rows={4} placeholder="What makes this shoe special? Materials, design story, who it's for..."
                className="input-brand resize-none" />
              <p className="text-brand-gray-muted text-xs mt-1">{description.length} characters</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>MATERIAL</label>
                <input value={material} onChange={e => setMaterial(e.target.value)}
                  placeholder="e.g. Mesh upper, Rubber sole, EVA midsole" className="input-brand" />
              </div>
              <div>
                <label className={labelClass}>CARE INSTRUCTIONS</label>
                <input value={careInstructions} onChange={e => setCareInstructions(e.target.value)}
                  placeholder="e.g. Wipe clean with damp cloth" className="input-brand" />
              </div>
            </div>

            <div>
              <label className={labelClass}>TAGS (comma separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="bestseller, running, lightweight, summer" className="input-brand" />
            </div>

            <div className="flex items-center gap-3 p-4 bg-brand-black-border rounded">
              <button type="button" onClick={() => setIsFeatured(!isFeatured)}
                className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${isFeatured ? 'bg-[#FF5A00]' : 'bg-brand-black-border'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${isFeatured ? 'translate-x-6' : ''}`} />
              </button>
              <div>
                <p className="text-white text-sm font-medium">Featured Product</p>
                <p className="text-brand-gray-muted text-xs">Shows on homepage bestsellers section</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className={sectionClass}>
          <h2 className="font-display text-xl text-white mb-5 tracking-wide">PRICING</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>BASE PRICE (₹) *</label>
              <input required type="number" min="1" value={basePrice}
                onChange={e => setBasePrice(e.target.value)} placeholder="2499" className="input-brand" />
            </div>
            <div>
              <label className={labelClass}>SALE PRICE (₹) <span className="font-normal normal-case">optional</span></label>
              <input type="number" min="1" value={discountedPrice}
                onChange={e => setDiscountedPrice(e.target.value)} placeholder="1999" className="input-brand" />
            </div>
            <div className="flex items-end pb-0.5">
              {discountPct !== null && discountPct > 0 ? (
                <div className="bg-[#FF5A00]/20 border border-[#FF5A00]/40 rounded px-4 py-3 w-full text-center">
                  <p className="text-[#FF5A00] font-bold text-2xl">{discountPct}% OFF</p>
                  <p className="text-brand-gray-muted text-xs">shown on product</p>
                </div>
              ) : (
                <div className="bg-brand-black-card border border-brand-black-border rounded px-4 py-3 w-full text-center">
                  <p className="text-brand-gray-muted text-sm">No discount</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Images */}
        <section className={sectionClass}>
          <h2 className="font-display text-xl text-white mb-2 tracking-wide">PRODUCT IMAGES</h2>
          <p className="text-brand-gray-muted text-xs mb-4">First image is the main display. Recommended: 1200×1200px square. Max 5MB per image.</p>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {images.map((url, i) => (
                <div key={i} className={`relative aspect-square rounded overflow-hidden border group ${i === 0 ? 'border-[#FF5A00]' : 'border-brand-black-border'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImage(i)}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                  {i === 0 && <div className="absolute bottom-1 left-1 bg-[#FF5A00] text-white text-xs px-1.5 py-0.5 rounded">Main</div>}
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full border border-dashed border-brand-black-border hover:border-[#FF5A00] rounded p-6 flex flex-col items-center gap-2 text-brand-gray-muted hover:text-white transition-colors disabled:opacity-50">
                {uploading ? <Loader size={24} className="animate-spin" /> : <Upload size={24} />}
                <p className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload from computer'}</p>
                <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-brand-gray-muted text-xs tracking-wider">OR PASTE IMAGE URL (from Cloudinary)</p>
              <textarea value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                rows={4} className="input-brand resize-none text-xs font-mono flex-1" />
              <button type="button" onClick={addImageByUrl} disabled={!imageUrl.trim()}
                className="bg-brand-black-card border border-brand-black-border text-brand-gray-muted hover:text-white hover:border-[#FF5A00] px-4 py-2 text-sm transition-colors disabled:opacity-40 flex items-center gap-2">
                <ImageIcon size={14} /> Add Image URL
              </button>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className={sectionClass}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl text-white tracking-wide">SIZES & STOCK</h2>
              <p className="text-brand-gray-muted text-xs mt-0.5">Each size + color combination is one variant with its own SKU and stock count</p>
            </div>
            <span className="text-[#FF5A00] text-sm font-medium">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Bulk add */}
          <div className="bg-brand-black-card border border-brand-black-border rounded p-4 mb-4">
            <p className="text-white text-sm font-medium mb-3">Bulk Add — All Sizes for One Color</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-brand-gray-muted text-xs mb-1">COLOR NAME</label>
                <input value={bulkColor} onChange={e => setBulkColor(e.target.value)}
                  placeholder="White" className="input-brand" />
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs mb-1">COLOR HEX</label>
                <div className="flex gap-2">
                  <input value={bulkColorHex} onChange={e => setBulkColorHex(e.target.value)}
                    placeholder="#FFFFFF" className="input-brand flex-1 font-mono text-sm" />
                  <input type="color" value={bulkColorHex} onChange={e => setBulkColorHex(e.target.value)}
                    className="w-10 h-10 rounded border border-brand-black-border bg-transparent cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-brand-gray-muted text-xs mb-1">STOCK PER SIZE</label>
                <input type="number" min="0" value={bulkStock} onChange={e => setBulkStock(e.target.value)}
                  placeholder="10" className="input-brand" />
              </div>
              <button type="button" onClick={addBulkVariants}
                className="bg-[#FF5A00] text-white px-4 py-3 text-sm font-medium hover:bg-[#FF7A30] transition-colors flex items-center gap-2">
                <Plus size={15} /> Add UK6–UK11
              </button>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-brand-gray-muted text-xs self-center">Quick:</span>
              {COMMON_COLORS.map(c => (
                <button key={c.name} type="button"
                  onClick={() => { setBulkColor(c.name); setBulkColorHex(c.hex) }}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs border border-brand-black-border hover:border-[#FF5A00] rounded transition-colors text-brand-gray-muted hover:text-white">
                  <span className="w-3 h-3 rounded-full border border-brand-black-border" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-brand-gray-muted border-b border-brand-black-border">
                  <tr>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Color</th>
                    <th className="px-3 py-2 text-left">Hex</th>
                    <th className="px-3 py-2 text-left">SKU</th>
                    <th className="px-3 py-2 text-left">Stock</th>
                    <th className="px-3 py-2 text-left">Alert at</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-black-border">
                  {variants.map(v => (
                    <tr key={v.id} className="hover:bg-brand-black-card/50">
                      <td className="px-3 py-2">
                        <select value={v.size} onChange={e => updateVariant(v.id, 'size', e.target.value)}
                          className="bg-transparent border border-brand-black-border text-white text-sm px-2 py-1 focus:outline-none focus:border-[#FF5A00] w-24">
                          {STANDARD_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input value={v.color} onChange={e => updateVariant(v.id, 'color', e.target.value)}
                          className="bg-transparent border border-brand-black-border text-white text-sm px-2 py-1 focus:outline-none focus:border-[#FF5A00] w-28" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={v.colorHex} onChange={e => updateVariant(v.id, 'colorHex', e.target.value)}
                            className="w-7 h-7 rounded border border-brand-black-border bg-transparent cursor-pointer" />
                          <span className="text-brand-gray-muted text-xs font-mono">{v.colorHex}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input value={v.sku} onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                          className="bg-transparent border border-brand-black-border text-brand-gray-muted text-xs font-mono px-2 py-1 focus:outline-none focus:border-[#FF5A00] w-44" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={v.stock}
                          onChange={e => updateVariant(v.id, 'stock', parseInt(e.target.value) || 0)}
                          className="bg-transparent border border-brand-black-border text-white text-sm px-2 py-1 focus:outline-none focus:border-[#FF5A00] w-20 text-center" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={v.lowStockAt}
                          onChange={e => updateVariant(v.id, 'lowStockAt', parseInt(e.target.value) || 3)}
                          className="bg-transparent border border-brand-black-border text-brand-gray-muted text-sm px-2 py-1 focus:outline-none focus:border-[#FF5A00] w-20 text-center" />
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeVariant(v.id)}
                          className="text-brand-gray-muted hover:text-red-400 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button type="button" onClick={addSingleVariant}
            className="mt-3 flex items-center gap-2 text-brand-gray-muted hover:text-[#FF5A00] transition-colors text-sm">
            <Plus size={15} /> Add single variant manually
          </button>
        </section>

        {/* SEO */}
        <section className={sectionClass}>
          <h2 className="font-display text-xl text-white mb-2 tracking-wide">SEO</h2>
          <p className="text-brand-gray-muted text-xs mb-5">These appear in Google search results. Leave blank to auto-fill.</p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>META TITLE</label>
              <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)}
                placeholder={name || 'Auto-filled from product name'} className="input-brand" maxLength={60} />
              <p className="text-brand-gray-muted text-xs mt-1">{metaTitle.length}/60 characters</p>
            </div>
            <div>
              <label className={labelClass}>META DESCRIPTION</label>
              <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)}
                placeholder={description.slice(0, 155) || 'Auto-filled from product description'}
                rows={2} className="input-brand resize-none" maxLength={160} />
              <p className="text-brand-gray-muted text-xs mt-1">{metaDescription.length}/160 characters</p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-8">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#FF5A00] text-white px-10 py-4 font-display text-xl tracking-widest hover:bg-[#FF7A30] transition-colors disabled:opacity-60">
            {saving ? <><Loader size={18} className="animate-spin" /> SAVING...</> : 'SAVE PRODUCT'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-brand-gray-muted hover:text-white transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
