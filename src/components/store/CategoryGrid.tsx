import Link from 'next/link'

const categories = [
  { slug: 'sneakers', label: 'Sneakers & Casual', description: 'Street-ready styles', emoji: '👟' },
  { slug: 'sports', label: 'Sports & Running', description: 'Built for performance', emoji: '🏃' },
  { slug: 'all', label: 'View All', description: 'Complete collection', emoji: '✨' },
]

export function CategoryGrid() {
  return (
    <section className="py-24 bg-brand-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brand-orange text-sm font-medium tracking-widest uppercase mb-2">Browse</p>
          <h2 className="font-display text-5xl text-white">SHOP BY CATEGORY</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/${cat.slug}`} className="group card p-8 flex flex-col gap-3 hover:border-brand-orange transition-all duration-300">
              <span className="text-4xl">{cat.emoji}</span>
              <h3 className="text-white font-semibold text-xl group-hover:text-brand-orange transition-colors">{cat.label}</h3>
              <p className="text-brand-muted text-sm">{cat.description}</p>
              <span className="text-brand-orange text-sm font-medium mt-auto">Shop Now →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
