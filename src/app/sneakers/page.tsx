import { prisma } from '@/lib/prisma'
import { CollectionClient } from './CollectionClient'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sneakers & Casual',
  description: 'Shop Nopego sneakers and casual shoes. Free shipping above ₹999.',
}

export default async function SneakersPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: 'sneakers' } },
    include: { category: true, variants: true, reviews: { select: { rating: true, isPublished: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <>
      <Navbar />
      <CollectionClient products={products} title="Sneakers & Casual" />
      <Footer />
    </>
  )
}
