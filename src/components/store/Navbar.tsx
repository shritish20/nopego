'use client'
import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart, useCartItemCount } from '@/hooks/useCart'
import { CartDrawer } from './CartDrawer'
import { useState } from 'react'

const links = [
  { href: '/sneakers', label: 'Sneakers' },
  { href: '/sports', label: 'Sports' },
  { href: '/sale', label: 'Sale', hot: true },
  { href: '/all', label: 'All' },
]

export function Navbar() {
  const { openCart } = useCart()
  const itemCount = useCartItemCount()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-white tracking-wider">NOPEGO</Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${l.hot ? 'text-brand-orange hover:text-white' : 'text-brand-muted hover:text-white'}`}
              >
                {l.label}
                {l.hot && <span className="ml-1 text-xs bg-brand-orange text-white px-1 py-0.5 rounded">HOT</span>}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={openCart} className="relative p-2 text-brand-muted hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 text-brand-muted hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-brand-card border-t border-brand-border px-4 py-4 space-y-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block font-medium transition-colors ${l.hot ? 'text-brand-orange' : 'text-brand-muted hover:text-white'}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <CartDrawer />
    </>
  )
}
