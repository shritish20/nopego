'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Star } from 'lucide-react'
import { formatPrice, discountPercent } from '@/lib/utils'
import { motion } from 'framer-motion'

type Product = {
  id: string; name: string; slug: string
  basePrice: number; discountedPrice?: number | null
  images: string[]; tags: string[]
  category?: { name: string }
  variants?: { stock: number; size: string }[]
  reviews?: { rating: number; isPublished: boolean }[]
}

export function ProductCard({ product }: { product: Product }) {
  const price = product.discountedPrice ?? product.basePrice
  const avgRating = product.reviews?.filter((r) => r.isPublished).length
    ? product.reviews.filter((r) => r.isPublished).reduce((s, r) => s + r.rating, 0) / product.reviews.filter((r) => r.isPublished).length
    : 0
  const reviewCount = product.reviews?.filter((r) => r.isPublished).length ?? 0
  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/product/${product.slug}`} className="block group">
        <div className="relative aspect-square bg-brand-card rounded-xl overflow-hidden mb-3">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-muted">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}
          {product.discountedPrice && (
            <span className="absolute top-3 left-3 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discountPercent(product.basePrice, product.discountedPrice)}%
            </span>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Out of Stock</span>
            </div>
          )}
          {product.tags?.includes('bestseller') && (
            <span className="absolute top-3 right-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium px-2 py-1 rounded-lg">
              Bestseller
            </span>
          )}
        </div>
        <div>
          <p className="text-white font-medium text-sm mb-1 truncate">{product.name}</p>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-brand-muted">{avgRating.toFixed(1)} ({reviewCount})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{formatPrice(price)}</span>
            {product.discountedPrice && (
              <span className="text-brand-muted text-sm line-through">{formatPrice(product.basePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
