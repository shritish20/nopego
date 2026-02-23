'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Star, Heart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { formatPrice, discountPercent } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    basePrice: number
    discountedPrice?: number | null
    images: string[]
    variants: Array<{ id: string; size: string; color: string; stock: number }>
    reviews?: Array<{ rating: number }>
  }
}

export default function ProductCard({ product }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [showSizes, setShowSizes] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addItem } = useCart()
  const { data: session } = useSession()

  const price = product.discountedPrice || product.basePrice
  const originalPrice = product.discountedPrice ? product.basePrice : null
  const discount = originalPrice ? discountPercent(originalPrice, price) : null

  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  const sizes = Array.from(new Set(product.variants.map((v) => v.size)))

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      toast.error('Please login to save to wishlist')
      return
    }
    setWishlistLoading(true)
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (data.action === 'added') {
        setWishlisted(true)
        toast.success('Saved to wishlist')
      } else if (data.action === 'removed') {
        setWishlisted(false)
        toast.success('Removed from wishlist')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setWishlistLoading(false)
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedSize) {
      setShowSizes(true)
      toast.error('Please select a size')
      return
    }
    const variant = product.variants.find((v) => v.size === selectedSize)
    if (!variant || variant.stock === 0) {
      toast.error('Out of stock')
      return
    }
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price,
      size: selectedSize,
      color: variant.color,
      image: product.images[0],
    })
    toast.success('Added to cart!')
    setShowSizes(false)
    setSelectedSize(null)
  }

  return (
    <div className="group bg-[#111111] border border-[#1E1E1E] hover:border-[#FF5A00]/50 transition-all duration-300 overflow-hidden relative">
      {/* Image */}
      <Link href={'/product/' + product.slug} className="block relative aspect-square bg-[#0D0D0D] overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#333]">
            <span className="text-6xl">👟</span>
          </div>
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-[#FF5A00] text-white text-xs font-bold px-2 py-1">
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ' +
            (wishlisted
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-[#0A0A0A]/80 text-[#666] hover:bg-[#0A0A0A] hover:text-red-400 opacity-0 group-hover:opacity-100')
          }
          aria-label="Wishlist"
        >
          <Heart size={14} className={wishlisted ? 'fill-white' : ''} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={'/product/' + product.slug}>
          <h3 className="font-medium text-white hover:text-[#FF5A00] transition-colors truncate text-sm">
            {product.name}
          </h3>
        </Link>
        {avgRating && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[#666] text-xs">
              {avgRating} ({product.reviews!.length})
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-white">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-[#555] text-sm line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {/* Size selector */}
        <div
          className={
            'overflow-hidden transition-all duration-300 ' +
            (showSizes
              ? 'max-h-40 mt-3'
              : 'max-h-0 md:group-hover:max-h-40 md:group-hover:mt-3')
          }
        >
          <div className="flex flex-wrap gap-1">
            {sizes.map((size) => {
              const variant = product.variants.find((v) => v.size === size)
              const outOfStock = !variant || variant.stock === 0
              return (
                <button
                  key={size}
                  disabled={outOfStock}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedSize(size)
                  }}
                  className={
                    'text-xs px-2 py-1 border transition-all ' +
                    (outOfStock
                      ? 'border-[#1E1E1E] text-[#444] cursor-not-allowed line-through'
                      : selectedSize === size
                      ? 'border-[#FF5A00] bg-[#FF5A00] text-white'
                      : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#FF5A00] hover:text-white')
                  }
                >
                  {size}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full mt-2 bg-[#FF5A00] text-white py-2 text-xs font-bold hover:bg-[#FF7A30] transition-colors flex items-center justify-center gap-2 tracking-wide"
          >
            <ShoppingBag size={13} /> ADD TO CART
          </button>
        </div>

        {/* Mobile: tap to show sizes */}
        <button
          className="md:hidden w-full mt-2 border border-[#2A2A2A] text-[#A0A0A0] text-xs py-1.5 transition-colors hover:border-[#FF5A00] hover:text-white"
          onClick={(e) => {
            e.preventDefault()
            setShowSizes((v) => !v)
          }}
        >
          {showSizes ? 'Hide sizes' : 'Select size'}
        </button>
      </div>
    </div>
  )
}
