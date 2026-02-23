'use client'
import { useState } from 'react'
import { Search, Package, Truck, MapPin, CheckCircle, Loader } from 'lucide-react'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import Footer from '@/components/store/Footer'
import { formatPrice } from '@/lib/utils'

const STATUS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const STATUS_ICONS = [CheckCircle, Package, Truck, Truck, MapPin]
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/track?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrder(data.order)
    } catch (err: any) {
      setError(err.message || 'Order not found. Check your order number and phone number.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12">
          <p className="text-[#FF5A00] text-xs tracking-widest mb-2">NOPEGO</p>
          <h1 className="font-display text-5xl text-white">TRACK YOUR ORDER</h1>
          <p className="text-brand-muted mt-2">Enter your order number to see live status</p>
        </div>

        <form onSubmit={handleTrack} className="bg-brand-card border border-brand-border rounded p-6 mb-8">
          <div className="space-y-3">
            <input
              required
              placeholder="Order Number (e.g. NPG-2025-00001)"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
              className="input-brand"
            />
            <input
              required
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-brand"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#FF5A00] text-white py-3 font-medium hover:bg-[#FF7A30] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            TRACK ORDER
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded text-sm text-center mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Status header */}
            <div className="bg-brand-card border border-brand-border rounded p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-brand-muted text-sm">Order #{order.orderNumber}</span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                  order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                  'bg-[#FF5A00]/20 text-[#FF5A00]'
                }`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              {order.trackingNumber && (
                <p className="text-brand-muted text-sm mt-2">
                  Tracking: <span className="text-white font-medium font-mono">{order.trackingNumber}</span>
                  {order.courierName && <span className="text-brand-muted"> via {order.courierName}</span>}
                </p>
              )}
              {order.address && (
                <p className="text-brand-muted text-xs mt-2">Delivering to: {order.address}</p>
              )}
            </div>

            {/* Progress tracker */}
            <div className="bg-brand-card border border-brand-border rounded p-6">
              <h2 className="font-medium text-white mb-6">Shipment Progress</h2>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-brand-border" />
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = STATUS_ICONS[i]
                    const isDone = i <= currentStep
                    const isActive = i === currentStep
                    return (
                      <div key={step} className="flex items-start gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-colors ${
                          isActive ? 'bg-[#FF5A00]' : isDone ? 'bg-green-500' : 'bg-brand-border'
                        }`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-medium ${isDone ? 'text-white' : 'text-brand-muted'}`}>
                            {STATUS_LABELS[step]}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-brand-card border border-brand-border rounded p-6">
              <h2 className="font-medium text-white mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-brand-muted text-xs">{item.color} · UK{item.size} · Qty {item.quantity}</p>
                    </div>
                    <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-border mt-4 pt-3 flex justify-between font-medium text-white">
                <span>Total</span>
                <span className="text-[#FF5A00]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
