'use client'
import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/store/ProductCard'
import { SlidersHorizontal } from 'lucide-react'

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

export function CollectionClient({ products, title }: { products: Product[]; title: string }) {
  const [sortBy, setSortBy] = useState('newest')
  const [selectedSize, setSelectedSize] = useState<string>('')

  const sizes = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p) => p.variants.forEach((v) => s.add(v.size)))
    return [...s].sort()
  }, [products])

  const filtered = useMemo(() => {
    let result = [...products]
    if (selectedSize) {
      result = result.filter((p) => p.variants.some((v) => v.size === selectedSize && v.stock > 0))
    }
    if (sortBy === 'price-asc') result.sort((a, b) => (a.discountedPrice ?? a.basePrice) - (b.discountedPrice ?? b.basePrice))
    else if (sortBy === 'price-desc') result.sort((a, b) => (b.discountedPrice ?? b.basePrice) - (a.discountedPrice ?? a.basePrice))
    return result
  }, [products, sortBy, selectedSize])

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl text-white">{title}</h1>
            <p className="text-brand-muted mt-1">{filtered.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-brand-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {sizes.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedSize('')}
              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${!selectedSize ? 'border-brand-orange text-brand-orange' : 'border-brand-border text-brand-muted hover:border-brand-orange'}`}
            >
              All Sizes
            </button>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${selectedSize === size ? 'border-brand-orange text-brand-orange' : 'border-brand-border text-brand-muted hover:border-brand-orange'}`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-brand-muted">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
