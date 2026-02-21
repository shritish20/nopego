import { prisma } from '@/lib/prisma'
import { CollectionClient } from '@/app/sneakers/CollectionClient'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports & Running',
  description: 'Shop Nopego sports and running shoes. Built for performance.',
}

export default async function SportsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: 'sports' } },
    include: { category: true, variants: true, reviews: { select: { rating: true, isPublished: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <>
      <Navbar />
      <CollectionClient products={products} title="Sports & Running" />
      <Footer />
    </>
  )
}
