import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { SaleClient } from './SaleClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sale — Up to 40% Off',
  description:
    'Shop Nopego sale — premium sneakers at unbeatable prices. Limited stock. Free shipping above ₹999.',
}

export default async function SalePage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      discountedPrice: { not: null },
    },
    include: {
      category: true,
      variants: true,
      reviews: { select: { rating: true, isPublished: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <>
      <Navbar />
      <SaleClient products={products} />
      <Footer />
    </>
  )
}
