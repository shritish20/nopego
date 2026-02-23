import { prisma } from '@/lib/prisma'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Hero from '@/components/store/Hero'
import MarqueeTicker from '@/components/store/MarqueeTicker'
import CategoryGrid from '@/components/store/CategoryGrid'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import TrustStrip from '@/components/store/TrustStrip'
import Testimonials from '@/components/store/Testimonials'
import InstagramFeed from '@/components/store/InstagramFeed'
import Footer from '@/components/store/Footer'
import ChatWidget from '@/components/store/ChatWidget'
import SplashScreen from '@/components/store/SplashScreen'
import { SoldNotification } from '@/components/store/LiveFeed'

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      variants: true,
      reviews: { select: { rating: true } },
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <>
      {/* Splash screen - shows once per session */}
      <SplashScreen />
      {/* Live sold notification popups */}
      <SoldNotification />
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <MarqueeTicker />
        <CategoryGrid />
        <FeaturedProducts products={products} />
        <TrustStrip />
        <Testimonials />
        <InstagramFeed />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
