import { Truck, RefreshCw, Shield, Headphones } from 'lucide-react'

const trusts = [
  { icon: Truck,       title: 'Ships in 48 Hours',  desc: 'Free delivery above ₹999' },
  { icon: RefreshCw,   title: '7-Day Easy Returns',  desc: 'No questions asked' },
  { icon: Shield,      title: 'Secure Payments',     desc: 'UPI, Cards, COD, EMI' },
  { icon: Headphones,  title: 'WhatsApp Support',    desc: 'Real humans, fast replies' },
]

export default function TrustStrip() {
  return (
    <section className="border-y border-[#1A1A1A] bg-[#0D0D0D]">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {trusts.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-[#FF5A00]/10 border border-[#FF5A00]/20 flex items-center justify-center">
              <Icon size={22} className="text-[#FF5A00]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{title}</p>
              <p className="text-[#666] text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
