export function MarqueeTicker() {
  const items = ['FREE SHIPPING ABOVE ₹999', 'COD AVAILABLE', '7-DAY RETURNS', 'MADE FOR INDIA', 'SECURE PAYMENTS', 'SIZES UK6-UK11']
  const doubled = [...items, ...items]
  return (
    <div className="bg-brand-orange py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-white font-semibold text-sm tracking-widest mx-8">
            {item} <span className="mx-2">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
