'use client'
import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/store/ProductCard'
import { Zap, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { discountPercent } from '@/lib/utils'

type Product = {
  id: string
  name: string
  slug: string
  basePrice: number
  discountedPrice?: number | null
  images: string[]
  tags: string[]
  category: { name: string; slug: string }
  variants: { size: string; color: string; stock: number }[]
  reviews?: { rating: number; isPublished: boolean }[]
}

const DISCOUNT_FILTERS = [
  { label: 'All Deals', min: 0 },
  { label: '10%+ off', min: 10 },
  { label: '20%+ off', min: 20 },
  { label: '30%+ off', min: 30 },
]

export function SaleClient({ products }: { products: Product[] }) {
  const [sortBy, setSortBy] = useState('discount')
  const [selectedSize, setSelectedSize] = useState('')
  const [minDiscount, setMinDiscount] = useState(0)

  const sizes = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p) => p.variants.forEach((v) => s.add(v.size)))
    return [...s].sort()
  }, [products])

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (!p.discountedPrice) return false
      const pct = discountPercent(p.basePrice, p.discountedPrice)
      if (pct < minDiscount) return false
      if (selectedSize) {
        return p.variants.some((v) => v.size === selectedSize && v.stock > 0)
      }
      return true
    })

    if (sortBy === 'discount') {
      result = result.sort((a, b) => {
        const da = discountPercent(a.basePrice, a.discountedPrice!)
        const db = discountPercent(b.basePrice, b.discountedPrice!)
        return db - da
      })
    } else if (sortBy === 'price-asc') {
      result = result.sort((a, b) => (a.discountedPrice ?? a.basePrice) - (b.discountedPrice ?? b.basePrice))
    } else if (sortBy === 'price-desc') {
      result = result.sort((a, b) => (b.discountedPrice ?? b.basePrice) - (a.discountedPrice ?? a.basePrice))
    }

    return result
  }, [products, sortBy, selectedSize, minDiscount])

  const maxSaving = useMemo(() => {
    if (filtered.length === 0) return 0
    return Math.max(
      ...filtered.map((p) => (p.discountedPrice ? discountPercent(p.basePrice, p.discountedPrice) : 0)),
    )
  }, [filtered])

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <div className="relative bg-brand-orange pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <span className="absolute top-0 left-0 font-display text-[220px] text-white leading-none select-none -translate-y-6 -translate-x-4">
            SALE
          </span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4 fill-white" />
              Limited time · While stocks last
            </div>
            <h1 className="font-display text-7xl sm:text-9xl text-white leading-none mb-4">SALE</h1>
            {maxSaving > 0 && (
              <p className="text-white/90 text-2xl font-semibold mb-2">Up to {maxSaving}% off</p>
            )}
            <p className="text-white/60 text-sm">{filtered.length} products on sale · Free shipping above ₹999</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Discount filter pills */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {DISCOUNT_FILTERS.map((f) => (
              <button
                key={f.min}
                onClick={() => setMinDiscount(f.min)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  minDiscount === f.min
                    ? 'bg-brand-orange border-brand-orange text-white'
                    : 'border-brand-border text-brand-muted hover:border-brand-orange hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-brand-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-sm py-2 w-auto"
            >
              <option value="discount">Biggest Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Size filter */}
        {sizes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedSize('')}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                !selectedSize ? 'border-brand-orange text-brand-orange' : 'border-brand-border text-brand-muted hover:border-brand-orange'
              }`}
            >
              All Sizes
            </button>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                  selectedSize === size ? 'border-brand-orange text-brand-orange' : 'border-brand-border text-brand-muted hover:border-brand-orange'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div className="text-center py-24 card p-16">
            <p className="font-display text-4xl text-white mb-4">COMING SOON</p>
            <p className="text-brand-muted">Our next sale is being planned. Check back soon!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-brand-muted text-lg mb-3">No products match your filters</p>
            <button
              onClick={() => { setMinDiscount(0); setSelectedSize('') }}
              className="text-brand-orange hover:text-white transition-colors text-sm font-medium"
            >
              Clear all filters →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
