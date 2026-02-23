'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  return (
    <section className="relative bg-[#0A0A0A] min-h-[85vh] flex items-center overflow-hidden">
      {/* Orange radial glow — top right */}
      <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 30%, rgba(255,90,0,0.18) 0%, transparent 65%)' }}
      />
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 w-full py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — Text */}
          <div
            className={
              'transition-all duration-700 ' +
              (loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')
            }
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-[#FF5A00] uppercase mb-6">
              INDIAN D2C SNEAKERS
            </p>

            <h1 className="font-display leading-none text-white mb-2">
              <span className="block text-[clamp(3rem,10vw,7rem)]">BUILT</span>
              <span
                className="block text-[clamp(3rem,10vw,7rem)]"
                style={{ color: '#FF5A00' }}
              >
                DIFFERENT
              </span>
            </h1>

            <p className="text-[#A0A0A0] text-base lg:text-lg mb-10 max-w-md leading-relaxed mt-4">
              Premium sneakers designed for India. Every width, every terrain, every style.{' '}
              <span className="text-white font-medium">Free shipping above ₹999.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sneakers"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#FF5A00] text-white font-bold text-sm tracking-wide hover:bg-[#FF7A30] active:scale-95 transition-all duration-200 rounded-sm"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/all"
                className="inline-flex items-center justify-center gap-2 h-14 px-8 border border-[#333] text-white font-semibold text-sm tracking-wide hover:border-[#FF5A00] hover:text-[#FF5A00] active:scale-95 transition-all duration-200 rounded-sm"
              >
                All Products
              </Link>
            </div>

            {/* Trust micro-badges */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#1A1A1A]">
              {[
                ['Free Delivery', 'above ₹999'],
                ['7-Day', 'Easy Returns'],
                ['100%', 'Genuine Product'],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-sm font-bold text-white">{val}</p>
                  <p className="text-xs text-[#666]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Shoe Image */}
          <div
            className={
              'relative transition-all duration-700 delay-200 ' +
              (loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')
            }
          >
            {/* Orange glow behind shoe */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,90,0,0.12) 0%, transparent 70%)' }}
            />
            <Image
              src="/hero/hero-main.png"
              alt="NOPEGO Performance Sneakers"
              priority
              width={1600}
              height={900}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain w-full h-auto drop-shadow-2xl relative z-10"
              style={{ filter: 'drop-shadow(0 0 40px rgba(255,90,0,0.25))' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
