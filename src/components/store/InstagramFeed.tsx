export function InstagramFeed() {
  return (
    <section className="py-24 bg-brand-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-brand-orange text-sm font-medium tracking-widest uppercase mb-2">Follow Us</p>
        <h2 className="font-display text-5xl text-white mb-4">@NOPEGO</h2>
        <p className="text-brand-muted mb-12">Tag us in your shots for a chance to be featured</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <a key={i} href="https://instagram.com/nopego" target="_blank" rel="noopener noreferrer"
              className="aspect-square bg-brand-bg rounded-xl overflow-hidden hover:opacity-80 transition-opacity flex items-center justify-center text-brand-muted">
              <span className="text-3xl">📸</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
