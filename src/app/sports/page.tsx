import { prisma } from '@/lib/prisma'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Footer from '@/components/store/Footer'
import CollectionClient from '../sneakers/CollectionClient'

export const metadata = { title: 'Sports Shoes | Nopego', description: 'Performance sports shoes built for Indian conditions.' }

export default async function SportsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, category: { slug: 'sports' } },
    include: { variants: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CollectionClient products={products} title="SPORTS" subtitle="Performance built for Indian conditions." />
      <Footer />
    </>
  )
}
