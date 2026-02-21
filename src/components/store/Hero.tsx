'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-brand-bg overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-brand-orange font-medium text-sm tracking-widest uppercase mb-6">Indian D2C Sneakers</p>
          <h1 className="font-display text-7xl sm:text-9xl text-white leading-none mb-6">
            BUILT<br />
            <span className="text-brand-orange">DIFFERENT</span>
          </h1>
          <p className="text-brand-muted text-xl max-w-xl mx-auto mb-10">
            Premium sneakers designed for India. Every width, every terrain, every style.
            Free shipping above ₹999.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/all" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/sneakers" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-lg">
              Sneakers & Casual
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
