'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingBag, Menu, X, User, Heart,
  LogOut, ChevronDown, Package, MapPin,
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const { data: session } = useSession()

  const isCustomer = session?.user?.role === 'customer'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!accountOpen) return
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-account-menu]')) setAccountOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [accountOpen])

  return (
    <nav
      className={
        'fixed top-9 left-0 right-0 z-40 transition-all duration-300 ' +
        (scrolled
          ? 'bg-[#0A0A0A]/98 backdrop-blur-md border-b border-[#1F1F1F] shadow-lg shadow-black/50'
          : 'bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#1A1A1A]')
      }
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-3xl tracking-widest text-white hover:text-[#FF5A00] transition-colors duration-200"
        >
          NOPEGO
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-[0.18em]">
          {[
            { href: '/sneakers', label: 'SNEAKERS' },
            { href: '/sports',   label: 'SPORTS' },
            { href: '/all',      label: 'NEW IN', accent: true },
            { href: '/all?sale=true', label: 'SALE', red: true },
          ].map(({ href, label, accent, red }) => (
            <Link
              key={href}
              href={href}
              className={
                accent
                  ? 'text-[#FF5A00] hover:text-[#FF7A30] transition-colors'
                  : red
                  ? 'text-red-400 hover:text-red-300 transition-colors'
                  : 'text-[#A0A0A0] hover:text-white transition-colors'
              }
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isCustomer && (
            <Link
              href="/account?tab=wishlist"
              className="text-[#A0A0A0] hover:text-red-400 transition-colors p-1"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
          )}

          {/* Account */}
          {isCustomer ? (
            <div className="relative" data-account-menu>
              <button
                onClick={() => setAccountOpen((v) => !v)}
                className="flex items-center gap-1.5 p-1 text-[#A0A0A0] hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#FF5A00] flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-xs font-medium">
                  {session?.user?.name?.split(' ')[0]}
                </span>
                <ChevronDown
                  size={12}
                  className={'transition-transform ' + (accountOpen ? 'rotate-180' : '')}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#111111] border border-[#242424] shadow-2xl z-50 overflow-hidden rounded-sm">
                  <div className="px-4 py-3 bg-[#FF5A00]/10 border-b border-[#242424]">
                    <p className="text-xs font-semibold text-white">{session?.user?.name}</p>
                    <p className="text-xs text-[#666] truncate mt-0.5">{session?.user?.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { href: '/account',                  icon: Package, label: 'My Orders' },
                      { href: '/account?tab=wishlist',     icon: Heart,   label: 'Wishlist' },
                      { href: '/account?tab=addresses',    icon: MapPin,  label: 'Addresses' },
                      { href: '/account?tab=profile',      icon: User,    label: 'Profile' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-all"
                      >
                        <Icon size={14} /> {label}
                      </Link>
                    ))}
                    <hr className="my-1 border-[#242424]" />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-[#333] text-[#A0A0A0] hover:border-[#FF5A00] hover:text-[#FF5A00] rounded-sm transition-all tracking-wide"
            >
              <User size={14} />
              LOGIN
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative text-[#A0A0A0] hover:text-white transition-colors p-1"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF5A00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1 text-[#A0A0A0] hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D0D0D] border-t border-[#1A1A1A] px-4 py-6 flex flex-col gap-4">
          <Link href="/sneakers" className="text-lg font-display tracking-widest text-[#A0A0A0] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>SNEAKERS</Link>
          <Link href="/sports"   className="text-lg font-display tracking-widest text-[#A0A0A0] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>SPORTS</Link>
          <Link href="/all"      className="text-lg font-display tracking-widest text-[#FF5A00]" onClick={() => setMobileOpen(false)}>NEW IN</Link>
          <Link href="/all?sale=true" className="text-lg font-display tracking-widest text-red-400" onClick={() => setMobileOpen(false)}>SALE</Link>
          <hr className="border-[#1A1A1A]" />
          {isCustomer ? (
            <>
              <Link href="/account" className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                <User size={16} /> My Account
              </Link>
              <Link href="/account?tab=wishlist" className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-red-400 transition-colors" onClick={() => setMobileOpen(false)}>
                <Heart size={16} /> Wishlist
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-sm text-red-400">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#FF5A00] px-4 py-3 rounded-sm hover:bg-[#FF7A30] transition-colors" onClick={() => setMobileOpen(false)}>
              <User size={16} /> Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
