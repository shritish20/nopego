import ProductCard from './ProductCard'
import Link from 'next/link'

interface Props {
  products: any[]
}

export default function FeaturedProducts({ products }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#FF5A00] text-xs tracking-[0.3em] font-semibold mb-2 uppercase">HANDPICKED</p>
          <h2 className="font-display text-5xl text-white">BESTSELLERS</h2>
        </div>
        <Link
          href="/all"
          className="text-[#A0A0A0] hover:text-white text-sm tracking-wide transition-colors border-b border-[#333] hover:border-[#FF5A00] pb-1"
        >
          VIEW ALL →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-[#1E1E1E] rounded aspect-square animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
