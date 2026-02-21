import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getFooterSettings() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['WHATSAPP_NUMBER', 'INSTAGRAM_HANDLE', 'STORE_NAME'] } },
    })
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    return {
      whatsappNumber: map.WHATSAPP_NUMBER ?? '919999999999',
      instagramHandle: map.INSTAGRAM_HANDLE ?? '@nopego',
      storeName: map.STORE_NAME ?? 'Nopego',
    }
  } catch {
    return { whatsappNumber: '919999999999', instagramHandle: '@nopego', storeName: 'Nopego' }
  }
}

export async function Footer() {
  const { whatsappNumber, instagramHandle, storeName } = await getFooterSettings()
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`
  const igUrl = `https://instagram.com/${instagramHandle.replace('@', '')}`

  return (
    <footer className="bg-brand-card border-t border-brand-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-display text-3xl text-white mb-4">{storeName.toUpperCase()}</h3>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              Indian D2C sneaker brand. Premium quality, honest pricing. Designed for Indian feet,
              built for Indian streets.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-border rounded-lg flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-orange border border-transparent transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-brand-border rounded-lg flex items-center justify-center text-brand-muted hover:text-white hover:border-brand-orange border border-transparent transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                ['Sneakers & Casual', '/sneakers'],
                ['Sports & Running', '/sports'],
                ['Sale', '/sale'],
                ['All Products', '/all'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-brand-muted hover:text-white transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                ['Track Order', '/track'],
                ['Returns', '/track'],
                ['WhatsApp Support', waUrl],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-brand-muted hover:text-white transition-colors text-sm"
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-brand-muted text-xs">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="text-brand-muted text-xs">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
