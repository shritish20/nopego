import Link from 'next/link'
import { Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-[#1A1A1A] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <h2 className="font-display text-4xl tracking-widest text-[#FF5A00] mb-4">NOPEGO</h2>
          <p className="text-[#666] text-sm leading-relaxed max-w-xs">
            Built for Bharat. Sneakers and sports shoes designed for Indian streets, Indian occasions, and Indian feet.
          </p>
          <div className="flex gap-4 mt-6">
            <a
              href="https://instagram.com/nopego"
              target="_blank"
              rel="noopener"
              className="w-9 h-9 border border-[#242424] flex items-center justify-center text-[#666] hover:text-[#FF5A00] hover:border-[#FF5A00] transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://youtube.com/@nopego"
              target="_blank"
              rel="noopener"
              className="w-9 h-9 border border-[#242424] flex items-center justify-center text-[#666] hover:text-[#FF5A00] hover:border-[#FF5A00] transition-all"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-display text-lg tracking-widest text-white mb-5">SHOP</h3>
          <ul className="space-y-3">
            {[
              ['Sneakers', '/sneakers'],
              ['Sports', '/sports'],
              ['New In', '/all'],
              ['Sale', '/all?sale=true'],
              ['All Products', '/all'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-[#666] hover:text-[#FF5A00] text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-display text-lg tracking-widest text-white mb-5">HELP</h3>
          <ul className="space-y-3">
            {[
              ['Track Order', '/track'],
              ['Size Guide', '/size-guide'],
              ['Returns', '/returns'],
              ['Shipping Info', '/shipping'],
              ['Contact Us', '/contact'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-[#666] hover:text-[#FF5A00] text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 py-6 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#444] text-xs">© 2025 Nopego. All rights reserved.</p>
        <div className="flex gap-6">
          {[
            ['Privacy Policy', '/privacy'],
            ['Terms', '/terms'],
            ['Refund Policy', '/refunds'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-[#444] hover:text-[#A0A0A0] text-xs transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
