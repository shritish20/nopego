import Link from 'next/link'
import { CheckCircle, Package, Truck, Home } from 'lucide-react'
import { Navbar } from '@/components/store/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been placed successfully.',
}

const steps = [
  { icon: CheckCircle, label: 'Confirmed' },
  { icon: Package, label: 'Processing' },
  { icon: Truck, label: 'Shipped' },
  { icon: Home, label: 'Delivered' },
]

export default function OrderConfirmedPage({ params }: { params: { orderNumber: string } }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-bg pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-lg w-full px-4 text-center">
          <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="font-display text-5xl text-white mb-3">ORDER CONFIRMED!</h1>
          <p className="text-brand-muted mb-1">
            Order{' '}
            <span className="text-brand-orange font-semibold font-mono">{params.orderNumber}</span>
          </p>
          <p className="text-brand-muted text-sm mb-10">
            A confirmation email has been sent to you. We'll WhatsApp you when your order ships.
          </p>

          {/* Progress steps */}
          <div className="card p-6 mb-8">
            <div className="flex justify-between">
              {steps.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      i === 0 ? 'bg-green-600' : 'bg-brand-card border border-brand-border'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-brand-muted'}`} />
                  </div>
                  <span className={`text-xs text-center leading-tight ${i === 0 ? 'text-white font-medium' : 'text-brand-muted'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/track" className="flex-1 btn-secondary text-center py-3 text-sm">
              Track Order
            </Link>
            <Link href="/" className="flex-1 btn-primary text-center py-3 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
