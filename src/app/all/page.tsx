import { prisma } from '@/lib/prisma'
import { CollectionClient } from '@/app/sneakers/CollectionClient'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse the complete Nopego collection.',
}

export default async function AllProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, variants: true, reviews: { select: { rating: true, isPublished: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <>
      <Navbar />
      <CollectionClient products={products} title="All Products" />
      <Footer />
    </>
  )
}
