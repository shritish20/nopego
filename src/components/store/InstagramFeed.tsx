export default function InstagramFeed() {
  return (
    <section className="py-16 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[#FF5A00] text-xs font-medium tracking-widest uppercase mb-2">
            @nopego
          </p>
          <h2 className="font-display text-5xl text-white tracking-wide uppercase">
            Follow Us
          </h2>
        </div>
        <a
          href="https://instagram.com/nopego"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-gray-text hover:text-[#FF5A00] transition-colors"
        >
          View Profile →
        </a>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-brand-black-card border border-brand-black-border hover:border-[#FF5A00]/40 transition-colors rounded"
          />
        ))}
      </div>
    </section>
  )
}
