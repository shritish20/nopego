'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import ProductCard from '@/components/store/ProductCard'
import ChatWidget from '@/components/store/ChatWidget'
import { SlidersHorizontal } from 'lucide-react'

interface Props {
  products: any[]
  title: string
  subtitle?: string
}

export default function CollectionClient({ products, title, subtitle }: Props) {
  return (
    <>
      <main className="max-w-7xl mx-auto px-4 pt-8 pb-20">
        <div className="mb-10">
          <p className="text-[#FF5A00] text-xs tracking-widest mb-2">NOPEGO</p>
          <h1 className="font-display text-6xl text-white">{title}</h1>
          {subtitle && <p className="text-brand-muted mt-2">{subtitle}</p>}
          <p className="text-brand-muted text-sm mt-1">{products.length} styles</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">👟</p>
            <p className="text-brand-muted">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
