import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Providers from './providers'
import AnnouncementBar from '@/components/store/AnnouncementBar'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  // FIX: Added metadataBase
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Nopego - Built Different',
    template: '%s | Nopego',
  },
  description:
    'Indian D2C sneakers built different. Premium footwear for every width, every terrain, every style. Free shipping above ₹999.',
  keywords: [
    'sneakers',
    'sports shoes',
    'footwear',
    'nopego',
    'buy shoes online India',
    'Indian D2C sneakers',
    'NG1',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nopego',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable} ${inter.variable}`}>
      <body className="bg-[#000000] text-white font-body antialiased">
        <Providers>
          <div className="fixed top-0 left-0 right-0 z-50">
            <AnnouncementBar />
          </div>
          <div className="pt-[100px]">{children}</div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111111',
                color: '#fff',
                border: '1px solid #242424',
                borderRadius: '4px',
                fontSize: '13px',
                fontFamily: 'var(--font-inter), sans-serif',
              },
              success: { iconTheme: { primary: '#FF5A00', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}