'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Zoom from 'react-medium-image-zoom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import {
  Star,
  Truck,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
  Heart,
  Send,
  CheckCircle,
  MapPin,
  Loader2,
} from 'lucide-react'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import ProductCard from '@/components/store/ProductCard'
import ColorSelector from '@/components/store/ColorSelector'
import SizeSelector from '@/components/store/SizeSelector'
import { ViewingCount, CountdownTimer } from '@/components/store/LiveFeed'
import { useCart } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { formatPrice, discountPercent } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_GUIDE = [
  { uk: 'UK 6', eu: '39', us: '7', cm: '24.5' },
  { uk: 'UK 7', eu: '40', us: '8', cm: '25.5' },
  { uk: 'UK 8', eu: '41', us: '9', cm: '26.5' },
  { uk: 'UK 9', eu: '42', us: '10', cm: '27.5' },
  { uk: 'UK 10', eu: '43', us: '11', cm: '28.0' },
  { uk: 'UK 11', eu: '44', us: '12', cm: '29.0' },
]

const COLOR_META: Record<string, { hex: string; images: string[] }> = {
  Red: {
    hex: '#e01e1e',
    images: [
      '/products/ng1-red/side.png',
      '/products/ng1-red/sole.png',
      '/products/ng1-red/collar.png',
      '/products/ng1-red/strap.png',
    ],
  },
  White: {
    hex: '#f5f5f5',
    images: [
      '/products/ng1-white/side.png',
      '/products/ng1-white/sole.png',
      '/products/ng1-white/collar.png',
      '/products/ng1-white/strap.png',
    ],
  },
}

const PRODUCT_IMAGES_FALLBACK = [
  '/products/ng1-red/side.png',
  '/products/ng1-red/sole.png',
  '/products/ng1-red/collar.png',
  '/products/ng1-red/strap.png',
]

const DETAIL_CARDS = [
  {
    key: 'sole',
    title: 'High-Traction Sole',
    desc: 'Multi-directional rubber outsole engineered for grip on any surface.',
    image: (color: string) => `/products/${color}/sole.png`,
  },
  {
    key: 'collar',
    title: 'Cushioned Insole',
    desc: 'Padded collar and insole for all-day comfort without fatigue.',
    image: (color: string) => `/products/${color}/collar.png`,
  },
  {
    key: 'strap',
    title: 'Adjustable Strap',
    desc: 'Signature NG velcro strap for a locked-in, customised fit.',
    image: (color: string) => `/products/${color}/strap.png`,
  },
]

const BENEFITS = [
  {
    icon: '⚡',
    title: 'Lightweight Cushioning',
    desc: 'EVA midsole absorbs impact and returns energy with every step.',
  },
  {
    icon: '💨',
    title: 'Breathable Mesh',
    desc: 'Premium engineered mesh upper keeps feet cool and dry all day.',
  },
  {
    icon: '🏃',
    title: 'Daily Comfort',
    desc: 'Contoured footbed and flexible outsole designed for prolonged wear.',
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-brand-border'
          }
        />
      ))}
    </div>
  )
}

function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!session) {
    return (
      <div className="bg-brand-card border border-brand-border rounded-xl p-6 text-center">
        <p className="text-brand-muted text-sm mb-3">Login to write a review</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-12 px-6 rounded-sm bg-[#FF5A00] text-white font-semibold text-sm"
        >
          Login
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
        <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
        <p className="text-green-400 font-semibold">Thank you for your review!</p>
        <p className="text-brand-muted text-sm mt-1">It will appear after approval.</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { toast.error('Please select a rating'); return }
    if (body.trim().length < 10) { toast.error('Review must be at least 10 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to submit review'); return }
      setSubmitted(true)
      toast.success('Review submitted!')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6">
      <h3 className="font-display text-xl text-white mb-4">WRITE A REVIEW</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-brand-muted uppercase tracking-wider mb-2 block">
            Your Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="p-0.5"
              >
                <Star
                  size={28}
                  className={
                    s <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-brand-border hover:text-yellow-400 transition-colors'
                  }
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-brand-muted uppercase tracking-wider mb-1.5 block">
            Review Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-brand"
            placeholder="e.g. Great quality, very comfortable"
            maxLength={100}
          />
        </div>
        <div>
          <label className="text-xs text-brand-muted uppercase tracking-wider mb-1.5 block">
            Your Review *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-brand resize-none"
            rows={4}
            placeholder="Tell others about your experience..."
            minLength={10}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !rating}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-sm bg-[#FF5A00] text-white font-semibold text-sm disabled:opacity-50 w-full"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

function PincodeChecker() {
  const [pincode, setPincode] = useState('')
  const [result, setResult] = useState<{
    valid: boolean
    city?: string
    state?: string
    deliveryDay?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  async function check() {
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/pincode?code=${pincode}`)
      const data = await res.json()
      if (data.valid) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const future = new Date()
        future.setDate(future.getDate() + 4)
        setResult({ valid: true, city: data.city, state: data.state, deliveryDay: days[future.getDay()] })
      } else {
        setResult({ valid: false })
      }
    } catch {
      setResult({ valid: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-brand-muted uppercase tracking-wider font-medium flex items-center gap-1.5">
        <MapPin size={12} /> Check Delivery
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 6)
            setPincode(v)
            if (result) setResult(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="Enter Pincode"
          maxLength={6}
          className="input-brand h-12 flex-1"
        />
        <button
          onClick={check}
          disabled={loading || pincode.length !== 6}
          className="h-12 px-4 rounded-sm bg-[#FF5A00] text-white text-sm font-semibold disabled:opacity-50 whitespace-nowrap hover:bg-[#FF7A30] transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
        </button>
      </div>
      {result && (
        <p
          className={
            'text-sm font-medium flex items-center gap-1.5 ' +
            (result.valid ? 'text-green-400' : 'text-red-400')
          }
        >
          {result.valid ? (
            <>
              <CheckCircle size={14} />
              Delivery by {result.deliveryDay} · {result.city}, {result.state}
            </>
          ) : (
            'Delivery not available for this pincode.'
          )}
        </p>
      )}
    </div>
  )
}

// Mobile gallery — Swiper only, no zoom (handoff: desktop must NOT use swiper)
function MobileGallery({ images }: { images: string[] }) {
  return (
    <div className="rounded-xl overflow-hidden bg-brand-card border border-brand-border">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        className="mobile-product-swiper"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="aspect-square relative">
              <Image
                src={src}
                alt={`Product view ${i + 1}`}
                fill
                sizes="100vw"
                className="object-contain p-4"
                priority={i === 0}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

// Desktop gallery — thumbnails left, main image right with react-medium-image-zoom
function DesktopGallery({ images, productName }: { images: string[]; productName: string }) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)

  function handleThumbClick(i: number) {
    if (i === active) return
    setFading(true)
    setTimeout(() => {
      setActive(i)
      setFading(false)
    }, 180)
  }

  return (
    <div className="grid lg:grid-cols-[120px_1fr] gap-6">
      {/* Thumbnails */}
      <div className="hidden lg:flex flex-col gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => handleThumbClick(i)}
            className={
              'w-20 h-20 rounded-lg border overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-105 hover:border-black hover:shadow-md ' +
              (i === active
                ? 'border-black scale-105 shadow-md'
                : 'border-brand-border opacity-60 hover:opacity-100')
            }
          >
            <Image
              src={src}
              alt={`${productName} view ${i + 1}`}
              width={80}
              height={80}
              sizes="80px"
              className="object-contain w-full h-full transition-transform duration-200"
            />
          </button>
        ))}
      </div>

      {/* Main image with react-medium-image-zoom + fade transition */}
      <div className="relative aspect-square max-w-xl w-full bg-brand-card rounded-xl border border-brand-border overflow-hidden flex items-center justify-center">
        <div
          className="w-full h-full transition-opacity duration-180"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <Zoom>
            <img
              src={images[active] || images[0]}
              alt={productName}
              width={600}
              height={600}
              style={{ objectFit: 'contain', padding: '24px', width: '100%', height: '100%' }}
            />
          </Zoom>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductPageClient({
  product,
  related,
}: {
  product: any
  related: any[]
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('description')
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addItem } = useCart()
  const { data: session } = useSession()

  const price = product.discountedPrice || product.basePrice
  const originalPrice = product.discountedPrice ? product.basePrice : null
  const discount = originalPrice ? discountPercent(originalPrice, price) : null

  const colors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[]
  const activeColor = selectedColor || colors[0] || 'Red'
  const sizesForColor: { size: string; stock: number }[] = product.variants
    .filter((v: any) => v.color === activeColor)
    .map((v: any) => ({ size: v.size, stock: v.stock }))

  const totalStock = product.variants.reduce((s: number, v: any) => s + v.stock, 0)
  const isLowStock = totalStock > 0 && totalStock <= 5

  const colorOptions = colors.map((c) => ({
    name: c,
    hex: product.variants.find((v: any) => v.color === c)?.colorHex || COLOR_META[c]?.hex || '#888',
    value: c,
  }))

  const activeImages =
    COLOR_META[activeColor]?.images ||
    (product.images?.length ? product.images : PRODUCT_IMAGES_FALLBACK)

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
    : 0

  const colorSlug = activeColor.toLowerCase() === 'white' ? 'ng1-white' : 'ng1-red'

  function handleAddToCart() {
    if (!selectedSize) { toast.error('Please select a size'); return }
    const variant = product.variants.find(
      (v: any) => v.color === activeColor && v.size === selectedSize
    )
    if (!variant || variant.stock === 0) { toast.error('This size is out of stock'); return }
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price,
      size: selectedSize,
      color: activeColor,
      image: activeImages[0],
    })
    toast.success('Added to cart! 👟')
  }

  async function handleWishlist() {
    if (!session) { toast.error('Please login to save to wishlist'); return }
    setWishlistLoading(true)
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (data.action === 'added') { setWishlisted(true); toast.success('Saved to wishlist ❤️') }
      else if (data.action === 'removed') { setWishlisted(false); toast.success('Removed from wishlist') }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-4 pt-8 pb-28 lg:pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${product.category.slug}`} className="hover:text-white transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {/* ── PRODUCT GRID ── */}
        <div className="grid lg:grid-cols-2 gap-16">

          {/* Left — Gallery */}
          <div>
            <div className="hidden lg:block">
              <DesktopGallery key={activeColor} images={activeImages} productName={product.name} />
            </div>
            <div className="lg:hidden">
              <MobileGallery key={activeColor} images={activeImages} />
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="space-y-6">
            <div>
              <ViewingCount productId={product.id} />
            </div>

            {/* Title — mb-2 as per handoff */}
            <div>
              <p className="text-[#FF5A00] text-xs tracking-widest font-medium uppercase mb-1">
                {product.category.name}
              </p>
              <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-2">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.reviews?.length > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={avgRating} />
                <span className="text-brand-muted text-sm">
                  {avgRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Low stock */}
            {isLowStock && (
              <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                🔥 Only {totalStock} left in stock — order soon!
              </p>
            )}

            {/* Countdown if on sale */}
            {discount && <CountdownTimer label="Sale price ends in" />}

            {/* Price — mb-4 as per handoff */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-medium text-white">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-brand-muted text-base line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {discount && (
                <span className="text-xs font-semibold bg-[#FF5A00]/20 text-[#FF5A00] px-2 py-0.5 rounded">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm text-brand-muted mb-2">
                  Color:{' '}
                  <span className="text-white font-medium">{activeColor}</span>
                </p>
                <ColorSelector
                  colors={colorOptions}
                  selected={activeColor}
                  onChange={(c) => { setSelectedColor(c); setSelectedSize(null) }}
                />
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-brand-muted">
                  Size:{' '}
                  <span className="text-white font-medium">
                    {selectedSize || 'Select size'}
                  </span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
                  className="text-[#FF5A00] text-xs hover:underline"
                >
                  Size Guide
                </button>
              </div>
              {sizeGuideOpen && (
                <div className="mb-3 bg-brand-card border border-brand-border rounded-xl p-4">
                  <table className="w-full text-xs text-brand-muted">
                    <thead>
                      <tr className="text-white">
                        {['UK', 'EU', 'US', 'CM'].map((h) => (
                          <th key={h} className="text-left py-1 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_GUIDE.map((r) => (
                        <tr key={r.uk}>
                          <td className="py-1 pr-4">{r.uk}</td>
                          <td className="py-1 pr-4">{r.eu}</td>
                          <td className="py-1 pr-4">{r.us}</td>
                          <td className="py-1 pr-4">{r.cm}cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-brand-subtle mt-2">
                    Tip: For sports shoes, order your true size.
                  </p>
                </div>
              )}
              <SizeSelector
                sizes={sizesForColor}
                selected={selectedSize}
                onChange={setSelectedSize}
              />
            </div>

            {/* Pincode checker */}
            <PincodeChecker />

            {/* Add to Cart — mt-4 as per handoff */}
            <button
              onClick={handleAddToCart}
              className="h-14 rounded-sm bg-[#FF5A00] text-white font-semibold w-full mt-4 hover:bg-[#FF7A30] transition-colors text-sm tracking-wide"
            >
              Add to Cart
            </button>

            {/* Buy Now — mt-2 as per handoff */}
            <button
              onClick={() => {
                if (!selectedSize) { toast.error('Please select a size'); return }
                handleAddToCart()
                window.location.href = '/checkout'
              }}
              className="h-14 rounded-xl border border-brand-border text-white font-semibold w-full mt-2 hover:border-white transition-colors text-sm tracking-wide"
            >
              Buy Now
            </button>

            {/* Trust signals — flex gap-4 desktop, flex-col mobile */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {[
                { icon: Truck, text: 'Free Delivery' },
                { icon: RefreshCw, text: 'Easy Returns' },
                { icon: Shield, text: 'Secure Payments' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-brand-muted">
                  <Icon size={14} className="text-green-400 flex-shrink-0" />
                  <span className="text-green-400 font-medium">✓</span>
                  {text}
                </div>
              ))}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              disabled={wishlistLoading}
              className={
                'flex items-center gap-2 text-sm transition-colors ' +
                (wishlisted ? 'text-red-400' : 'text-brand-muted hover:text-red-400')
              }
            >
              <Heart size={16} className={wishlisted ? 'fill-red-400' : ''} />
              {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Accordion */}
            {[
              {
                key: 'description',
                label: 'Description',
                content: product.description,
              },
              {
                key: 'material',
                label: 'Material & Care',
                content:
                  [product.material, product.careInstructions]
                    .filter(Boolean)
                    .join('\n\n') || 'Premium breathable mesh upper with synthetic overlays.',
              },
              {
                key: 'shipping',
                label: 'Shipping & Returns',
                content:
                  'Free shipping on orders above ₹999. Standard delivery 3-5 business days.\n\nReturns accepted within 7 days of delivery. Product must be unused and in original packaging.',
              },
            ].map(({ key, label, content }) => (
              <div key={key} className="border-t border-brand-border">
                <button
                  onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                  className="w-full flex items-center justify-between py-4 text-sm font-medium text-white hover:text-[#FF5A00] transition-colors"
                >
                  {label}
                  {expandedSection === key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSection === key && (
                  <p className="pb-4 text-brand-muted text-sm leading-relaxed whitespace-pre-line">
                    {content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── BENEFITS SECTION ── */}
        <section className="mt-20">
          <h2 className="font-display text-3xl text-white mb-8 text-center">Why Choose NG1?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-brand-card border border-brand-border rounded-xl p-8 text-center"
              >
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DETAIL SECTION ── */}
        <section className="mt-16">
          <div className="grid md:grid-cols-3 gap-6">
            {DETAIL_CARDS.map((card) => (
              <div
                key={card.key}
                className="bg-brand-card border border-brand-border rounded-xl overflow-hidden"
              >
                <div className="relative aspect-video bg-brand-card">
                  <Image
                    src={card.image(colorSlug)}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── REVIEWS SECTION ── */}
        <section className="mt-20">
          <h2 className="font-display text-3xl text-white mb-8">Customer Reviews</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {!product.reviews?.length ? (
                <div className="bg-brand-card border border-brand-border rounded-xl p-8 text-center">
                  <p className="text-brand-muted">No reviews yet. Be the first!</p>
                </div>
              ) : (
                product.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="bg-brand-card border border-brand-border rounded-xl p-6"
                  >
                    <Stars rating={review.rating} size={12} />
                    {review.title && (
                      <p className="font-semibold text-white text-sm mt-2 mb-1">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-brand-muted text-sm leading-relaxed">{review.body}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-brand-subtle">{review.customer?.name}</span>
                      <span className="text-xs text-green-400">✓ Verified Purchase</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </section>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl text-white mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── MOBILE STICKY CART — h-16 as per handoff, mobile only ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-[#111111] border-t border-[#1E1E1E] px-4 h-16 flex items-center justify-between">
        <div>
          <p className="text-xs text-white">Total</p>
          <p className="text-base font-semibold text-white">{formatPrice(price)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          className="h-10 px-8 rounded-sm bg-[#FF5A00] text-white font-semibold text-sm hover:bg-[#FF7A30] transition-colors"
        >
          Add to Cart
        </button>
      </div>

      <Footer />
    </>
  )
}
