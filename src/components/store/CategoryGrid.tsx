import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const categories = [
  {
    name: 'Sneakers & Casual',
    slug: 'sneakers',
    description: 'Street-ready. All-day comfort.',
    count: '12 styles',
    gradient: 'from-[#FF5A00]/30 via-[#FF5A00]/10 to-transparent',
  },
  {
    name: 'Sports & Running',
    slug: 'sports',
    description: 'Performance built for Indian conditions.',
    count: '8 styles',
    gradient: 'from-[#CC4800]/30 via-[#CC4800]/10 to-transparent',
  },
]

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[#FF5A00] text-xs tracking-[0.3em] font-semibold mb-2 uppercase">SHOP BY</p>
          <h2 className="font-display text-5xl text-white">CATEGORY</h2>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group relative bg-[#111111] border border-[#1E1E1E] overflow-hidden aspect-[4/3] flex flex-col justify-end p-8 hover:border-[#FF5A00]/50 transition-all duration-300"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-80`} />

            <div className="relative z-10">
              <span className="text-[#FF5A00] text-xs tracking-[0.2em] font-bold">{cat.count}</span>
              <h3 className="font-display text-4xl text-white mt-1 mb-2">{cat.name}</h3>
              <p className="text-[#A0A0A0] text-sm">{cat.description}</p>
            </div>

            <div className="absolute top-6 right-6 w-10 h-10 bg-[#FF5A00]/0 group-hover:bg-[#FF5A00] flex items-center justify-center transition-all duration-300 rounded-sm">
              <ArrowUpRight size={20} className="text-white" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <span className="font-display text-9xl text-white">👟</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
