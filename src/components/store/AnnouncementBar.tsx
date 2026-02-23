'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

const ANNOUNCEMENTS = [
  { icon: '🚀', text: 'NEW DROP: AirFlex Pro 2.0 — Limited stock available!' },
  { icon: '🔥', text: 'SALE: Up to 40% OFF on Sports collection — Use code SPORT40' },
  { icon: '🚚', text: 'FREE SHIPPING on all orders above ₹999 — Shop now!' },
  { icon: '⭐', text: 'Rated 4.8/5 by 10,000+ customers — Join the Nopego family' },
  { icon: '🎁', text: 'Buy 2 pairs, get 10% extra OFF — No coupon needed!' },
  { icon: '⚡', text: 'Flash Sale: Sneaker collection from ₹799 — Limited time only!' },
  { icon: '📦', text: 'Easy 7-day returns on all products — Zero questions asked' },
  { icon: '💳', text: 'EMI available from ₹199/month — Pay easy, wear great!' },
]

const DOUBLE = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS]

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="relative overflow-hidden h-9 flex items-center z-50"
      style={{ background: '#FF5A00' }}
    >
      <div className="flex overflow-hidden w-full">
        <div className="announcement-track flex items-center gap-0">
          {DOUBLE.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 px-8 text-xs font-bold tracking-wide text-white flex-shrink-0"
            >
              <span className="text-sm">{item.icon}</span>
              {item.text}
              <span className="text-white/50 mx-4">◆</span>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors flex-shrink-0 z-10"
        aria-label="Close announcement"
      >
        <X size={14} />
      </button>
    </div>
  )
}
