'use client'
import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Arjun Mehta',
    location: 'Mumbai',
    rating: 5,
    text: 'Ordered the Street Runner last week and I am blown away. The quality is on par with brands 3x the price. Delivery was super fast — came in 2 days!',
    product: 'Street Runner White',
    avatar: 'AM',
    color: '#FF5A00',
    verified: true,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'Finally a brand that makes shoes for Indian feet and Indian prices. The sneakers look exactly like the photos, fit perfectly, and the sole grip is amazing.',
    product: 'Urban Edge',
    avatar: 'PS',
    color: '#CC4800',
    verified: true,
  },
  {
    id: 3,
    name: 'Rohan Iyer',
    location: 'Bangalore',
    rating: 5,
    text: 'Been wearing these for my morning runs for a month now. Zero discomfort, great cushioning. The return policy gave me confidence and I am so glad I tried.',
    product: 'Pace Runner',
    avatar: 'RI',
    color: '#FF7A30',
    verified: true,
  },
  {
    id: 4,
    name: 'Kavya Nair',
    location: 'Chennai',
    rating: 4,
    text: 'Great sneakers and super affordable. Fits true to size. Customer support on WhatsApp was quick and helpful when I had a sizing question.',
    product: 'Street Runner White',
    avatar: 'KN',
    color: '#E85000',
    verified: true,
  },
  {
    id: 5,
    name: 'Siddharth Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'The build quality is excellent. I was skeptical ordering shoes online but Nopego proved me wrong. The 7-day return policy made it a risk-free purchase.',
    product: 'Pace Runner',
    avatar: 'SP',
    color: '#FF6020',
    verified: true,
  },
  {
    id: 6,
    name: 'Ananya Gupta',
    location: 'Kolkata',
    rating: 5,
    text: 'Gifted these to my brother and he absolutely loves them. Great packaging, genuine product, fast delivery. Will definitely buy again for the whole family!',
    product: 'Urban Edge',
    avatar: 'AG',
    color: '#D94500',
    verified: true,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#2A2A2A]'}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => {
      setActive((p) => (p + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(t)
  }, [autoPlay])

  const prev = () => {
    setAutoPlay(false)
    setActive((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }
  const next = () => {
    setAutoPlay(false)
    setActive((p) => (p + 1) % TESTIMONIALS.length)
  }

  const visible = [
    TESTIMONIALS[active],
    TESTIMONIALS[(active + 1) % TESTIMONIALS.length],
    TESTIMONIALS[(active + 2) % TESTIMONIALS.length],
  ]

  return (
    <section className="bg-[#0D0D0D] border-y border-[#1A1A1A] py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#FF5A00] text-xs tracking-[0.3em] font-semibold mb-2 uppercase">REAL CUSTOMERS</p>
            <h2 className="font-display text-5xl text-white">WHAT THEY SAY</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 border border-[#242424] hover:border-[#FF5A00] text-[#666] hover:text-white transition-all flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 border border-[#242424] hover:border-[#FF5A00] text-[#666] hover:text-white transition-all flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className={
                'bg-[#111111] border rounded-sm p-6 flex flex-col gap-4 transition-all duration-500 ' +
                (i === 0 ? 'border-[#FF5A00]/40' : 'border-[#1E1E1E]') +
                (i === 2 ? ' hidden lg:flex' : '')
              }
            >
              <Quote size={24} style={{ color: 'rgba(255,90,0,0.3)' }} />
              <p className="text-[#A0A0A0] text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div>
                <StarRating rating={t.rating} />
                <p className="text-xs text-[#555] mt-1">{t.product}</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-[#1A1A1A]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#555] text-xs">{t.location}</p>
                    {t.verified && <span className="text-green-400 text-xs">✓ Verified</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAutoPlay(false); setActive(i) }}
              className={
                'h-1 rounded-full transition-all duration-300 ' +
                (i === active ? 'w-8 bg-[#FF5A00]' : 'w-2 bg-[#2A2A2A] hover:bg-[#444]')
              }
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-[#1A1A1A]">
          {[
            { val: '10,000+', label: 'Happy Customers' },
            { val: '4.8 / 5',  label: 'Average Rating' },
            { val: '98%',      label: 'Would Recommend' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-[#FF5A00]">{val}</p>
              <p className="text-[#666] text-xs mt-1 tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
