'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ChevronLeft, Star, Truck, RotateCcw, Shield } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, discountPercent } from '@/lib/utils'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

type Variant = { id: string; size: string; color: string; colorHex?: string | null; sku: string; stock: number; lowStockAt: number }
type Review = { id: string; rating: number; title?: string | null; body?: string | null; isVerified: boolean; createdAt: Date | string; customer: { name: string } }
type Product = {
  id: string; name: string; slug: string; description: string
  material?: string | null; careInstructions?: string | null
  basePrice: number; discountedPrice?: number | null
  images: string[]; tags: string[]
  category: { name: string; slug: string }
  variants: Variant[]; reviews: Review[]
}

export function ProductPageClient({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [activeImage, setActiveImage] = useState(0)
  const { addItem } = useCart()

  const colors = [...new Set(product.variants.map((v) => v.color))]
  const sizes = [...new Set(product.variants.filter((v) => !selectedColor || v.color === selectedColor).map((v) => v.size))]

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize,
  )

  const price = product.discountedPrice ?? product.basePrice
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0

  function handleAddToCart() {
    if (!selectedVariant) {
      toast.error('Please select size and color')
      return
    }
    if (selectedVariant.stock === 0) {
      toast.error('This size is out of stock')
      return
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price,
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: product.images[0],
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

  return (
    <div className="min-h-screen bg-brand-bg pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${product.category.slug}`} className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors mt-6 mb-8">
          <ChevronLeft className="w-4 h-4" /> Back to {product.category.name}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-brand-card rounded-2xl overflow-hidden relative">
              {product.images[activeImage] ? (
                <Image src={product.images[activeImage]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-muted">
                  <ShoppingBag className="w-16 h-16" />
                </div>
              )}
              {product.discountedPrice && (
                <span className="absolute top-4 left-4 bg-brand-orange text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discountPercent(product.basePrice, product.discountedPrice)}%
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square bg-brand-card rounded-xl overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-brand-orange' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" width={100} height={100} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-brand-orange text-sm font-medium mb-2">{product.category.name}</p>
              <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">{product.name}</h1>
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-brand-border'}`} />
                    ))}
                  </div>
                  <span className="text-brand-muted text-sm">({product.reviews.length} reviews)</span>
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>
                {product.discountedPrice && (
                  <span className="text-xl text-brand-muted line-through">{formatPrice(product.basePrice)}</span>
                )}
              </div>
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-brand-muted mb-3">
                  Color: <span className="text-white">{selectedColor || 'Select'}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((color) => {
                    const v = product.variants.find((vv) => vv.color === color)
                    return (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color); setSelectedSize('') }}
                        title={color}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-brand-orange scale-110' : 'border-brand-border hover:border-brand-muted'}`}
                        style={{ backgroundColor: v?.colorHex ?? '#888' }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <p className="text-sm font-medium text-brand-muted mb-3">
                Size: <span className="text-white">{selectedSize || 'Select'}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variant = product.variants.find((v) => v.size === size && (!selectedColor || v.color === selectedColor))
                  const inStock = (variant?.stock ?? 0) > 0
                  return (
                    <button
                      key={size}
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                        selectedSize === size
                          ? 'border-brand-orange text-white bg-brand-orange/10'
                          : inStock
                          ? 'border-brand-border text-white hover:border-brand-orange'
                          : 'border-brand-border text-brand-subtle opacity-40 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedVariant && selectedVariant.stock <= selectedVariant.lowStockAt && selectedVariant.stock > 0 && (
                <p className="text-yellow-400 text-sm mt-2">⚠️ Only {selectedVariant.stock} left!</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              {!selectedColor || !selectedSize ? 'Select Size & Color' : 'Add to Cart'}
            </motion.button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-border">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-5 h-5 text-brand-orange" />
                <span className="text-xs text-brand-muted">Free above ₹999</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-5 h-5 text-brand-orange" />
                <span className="text-xs text-brand-muted">7-day returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Shield className="w-5 h-5 text-brand-orange" />
                <span className="text-xs text-brand-muted">Secure payment</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4 border-t border-brand-border">
              <p className="text-brand-muted leading-relaxed">{product.description}</p>
              {product.material && <p className="text-sm text-brand-muted"><span className="text-white font-medium">Material:</span> {product.material}</p>}
              {product.careInstructions && <p className="text-sm text-brand-muted"><span className="text-white font-medium">Care:</span> {product.careInstructions}</p>}
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div id="reviews" className="mt-16">
            <h2 className="font-display text-3xl text-white mb-8">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="card p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-brand-border'}`} />
                    ))}
                    {review.isVerified && <span className="ml-auto badge bg-green-900/30 text-green-400">✓ Verified</span>}
                  </div>
                  {review.title && <p className="font-semibold text-white mb-1">{review.title}</p>}
                  {review.body && <p className="text-brand-muted text-sm">{review.body}</p>}
                  <p className="text-brand-subtle text-xs mt-3">{review.customer.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}