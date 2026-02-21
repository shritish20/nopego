import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: { default: 'Nopego — Built Different', template: '%s | Nopego' },
  description: 'Indian D2C sneaker brand. Premium quality, honest pricing. Free shipping above ₹999.',
  keywords: ['sneakers india', 'buy sneakers online india', 'nopego'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nopego',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${dmSans.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: '#161616', color: '#fff', border: '1px solid #222' },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
