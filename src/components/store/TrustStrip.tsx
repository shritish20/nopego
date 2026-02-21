import { Truck, RotateCcw, Shield, CreditCard } from 'lucide-react'

const badges = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: RotateCcw, label: '7-Day Returns', sub: 'Hassle-free returns' },
  { icon: Shield, label: 'Secure Payments', sub: 'Razorpay encrypted' },
  { icon: CreditCard, label: 'COD Available', sub: 'Pay on delivery' },
]

export function TrustStrip() {
  return (
    <section className="py-16 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-brand-muted text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
