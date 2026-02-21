'use client'
import { useState } from 'react'
import { Navbar } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { formatDate, formatPrice } from '@/lib/utils'
import { Package, Truck, CheckCircle, Clock, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const STATUS_ICONS: Record<string, typeof Package> = {
  PENDING: Clock, CONFIRMED: CheckCircle, PROCESSING: Package,
  SHIPPED: Truck, OUT_FOR_DELIVERY: Truck, DELIVERED: CheckCircle,
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/track?orderNumber=${orderNumber}&phone=${phone}`)
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Order not found'); return }
      setOrder(data.order)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status as string) : -1

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-bg pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="font-display text-4xl text-white mb-2">Track Order</h1>
          <p className="text-brand-muted mb-8">Enter your order number and phone to track your delivery.</p>

          <form onSubmit={handleSearch} className="card p-6 space-y-4 mb-8">
            <input
              className="input"
              placeholder="Order Number (e.g. NPG-2025-00001)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {order && (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-brand-orange font-semibold">{order.orderNumber as string}</p>
                    <p className="text-brand-muted text-sm">{formatDate(order.createdAt as string)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatPrice(order.total as number)}</p>
                    <p className="text-brand-muted text-sm">{order.paymentMethod as string}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3 mt-6">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = STATUS_ICONS[step] ?? Package
                    const done = i <= currentStepIndex
                    const current = i === currentStepIndex
                    return (
                      <div key={step} className={`flex items-center gap-3 ${done ? 'text-white' : 'text-brand-muted'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${current ? 'bg-brand-orange' : done ? 'bg-green-600' : 'bg-brand-card border border-brand-border'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium ${current ? 'text-brand-orange' : ''}`}>
                          {step.replace(/_/g, ' ')}
                        </span>
                        {current && <span className="ml-auto text-xs text-brand-orange">Current</span>}
                      </div>
                    )
                  })}
                </div>

                {(order.trackingNumber as string) && (
                  <div className="mt-6 p-4 bg-brand-card rounded-lg border border-brand-border">
                    <p className="text-sm text-brand-muted">Tracking Number</p>
                    <p className="text-white font-mono font-semibold">{order.trackingNumber as string}</p>
                    {(order.courierName as string) && <p className="text-brand-muted text-sm mt-1">via {order.courierName as string}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
