import { prisma } from '@/lib/prisma'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Footer from '@/components/store/Footer'
import CollectionClient from './CollectionClient'

export const metadata = { title: 'Sneakers | Nopego', description: 'Shop premium sneakers and casual shoes at Nopego.' }

export default async function SneakersPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: 'sneakers' } },
    include: { variants: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CollectionClient products={products} title="SNEAKERS" subtitle="Street-ready. All-day comfort." />
      <Footer />
    </>
  )
}
