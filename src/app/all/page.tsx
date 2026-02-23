import { prisma } from '@/lib/prisma'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Footer from '@/components/store/Footer'
import ProductCard from '@/components/store/ProductCard'

export const metadata = { title: 'All Products | Nopego' }

export default async function AllPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="max-w-7xl mx-auto px-4 pt-8 pb-20">
        <div className="mb-10">
          <p className="text-[#FF5A00] text-sm tracking-widest mb-2">EXPLORE</p>
          <h1 className="font-display text-5xl text-white">ALL PRODUCTS</h1>
          <p className="text-brand-muted mt-2">{products.length} styles available</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {products.length === 0 && (
          <div className="text-center py-20 text-brand-muted">No products found.</div>
        )}
      </main>
      <Footer />
    </>
  )
}
