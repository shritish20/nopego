const items = [
  'FREE SHIPPING ABOVE ₹999',
  'GENUINE PRODUCTS',
  '7-DAY EASY RETURNS',
  'COD AVAILABLE',
  'SECURE PAYMENTS',
  'MADE FOR BHARAT',
  'BUILT DIFFERENT',
  'INDIAN D2C SNEAKERS',
]
const doubled = [...items, ...items]

export default function MarqueeTicker() {
  return (
    <div className="overflow-hidden py-3" style={{ background: '#FF5A00' }}>
      <div className="marquee-container">
        <div className="marquee-track flex items-center gap-0">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-6 text-xs font-bold tracking-[0.25em] text-white flex-shrink-0 uppercase"
            >
              {item}
              <span className="text-white/40">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
