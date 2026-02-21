import { prisma } from '@/lib/prisma'
import { ProductCard } from './ProductCard'
import Link from 'next/link'

export async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: true, variants: true, reviews: { select: { rating: true, isPublished: true } } },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  if (products.length === 0) return null

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-brand-orange text-sm font-medium tracking-widest uppercase mb-2">Bestsellers</p>
            <h2 className="font-display text-5xl text-white">FEATURED DROPS</h2>
          </div>
          <Link href="/all" className="text-brand-muted hover:text-white transition-colors text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
