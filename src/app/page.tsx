import { Navbar } from '@/components/store/Navbar'
import { Hero } from '@/components/store/Hero'
import { MarqueeTicker } from '@/components/store/MarqueeTicker'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { CategoryGrid } from '@/components/store/CategoryGrid'
import { TrustStrip } from '@/components/store/TrustStrip'
import { InstagramFeed } from '@/components/store/InstagramFeed'
import { Footer } from '@/components/store/Footer'
import { ChatWidget } from '@/components/store/ChatWidget'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <Navbar />
      <MarqueeTicker />
      <Hero />
      <FeaturedProducts />
      <CategoryGrid />
      <TrustStrip />
      <InstagramFeed />
      <Footer />
      <ChatWidget />
    </main>
  )
}
