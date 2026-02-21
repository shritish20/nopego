import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { ProductPageClient } from './ProductPageClient'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description.slice(0, 160),
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      category: true,
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      reviews: {
        where: { isPublished: true },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0],
    offers: {
      '@type': 'Offer',
      price: product.discountedPrice ?? product.basePrice,
      priceCurrency: 'INR',
      availability: product.variants.some((v) => v.stock > 0) ? 'InStock' : 'OutOfStock',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <ProductPageClient product={product} />
      <Footer />
    </>
  )
}
