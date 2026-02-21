'use client'
import { useState, useEffect } from 'react'
import { useCart, useCartSubtotal } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/store/Navbar'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Loader, CreditCard, Banknote, Tag, CheckCircle } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const subtotal = useCartSubtotal()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')
  const [shipping, setShipping] = useState(49)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', whatsappOptIn: true,
    line1: '', line2: '', city: '', state: '', pincode: '',
    couponCode: '',
  })
  const [pincodeLoading, setPincodeLoading] = useState(false)

  const discountedSubtotal = subtotal - couponDiscount
  const total = discountedSubtotal + shipping

  // Update shipping whenever subtotal or coupon changes
  useEffect(() => {
    setShipping(discountedSubtotal >= 999 ? 0 : 49)
  }, [discountedSubtotal])

  // Auto-fill city/state from pincode
  useEffect(() => {
    if (form.pincode.length !== 6) return
    setPincodeLoading(true)
    fetch(`/api/pincode?pincode=${form.pincode}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.city) {
          setForm((f) => ({ ...f, city: data.city, state: data.state }))
        }
      })
      .catch(() => {})
      .finally(() => setPincodeLoading(false))
  }, [form.pincode])

  // Reset coupon when cart changes
  useEffect(() => {
    setCouponDiscount(0)
    setCouponApplied(false)
  }, [subtotal])

  async function applyCoupon() {
    if (!form.couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.couponCode, subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid coupon')
        setCouponDiscount(0)
        setCouponApplied(false)
        return
      }
      setCouponDiscount(data.discount)
      setCouponApplied(true)
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`)
    } catch {
      toast.error('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    if (!form.name || !form.email || !form.phone || !form.line1 || !form.pincode || !form.city || !form.state) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          whatsappOptIn: form.whatsappOptIn,
          addressLine1: form.line1,
          addressLine2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          paymentMethod: paymentMethod === 'cod' ? 'COD' : 'UPI',
          couponCode: couponApplied ? form.couponCode : undefined,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create order')
        setLoading(false)
        return
      }

      // COD: done
      if (paymentMethod === 'cod') {
        clearCart()
        router.push(`/order-confirmed/${orderData.orderNumber}`)
        return
      }

      // Online payment: open Razorpay
      const loadRazorpay = () =>
        new Promise<void>((resolve) => {
          if (window.Razorpay) { resolve(); return }
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          document.body.appendChild(script)
        })

      await loadRazorpay()

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(orderData.total * 100),
        currency: 'INR',
        name: 'Nopego',
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#FF5C00' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error('Payment cancelled. Your order was not placed.')
          },
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            }),
          })
          if (verifyRes.ok) {
            clearCart()
            router.push(`/order-confirmed/${orderData.orderNumber}`)
          } else {
            toast.error('Payment verification failed. Please contact support with your payment ID.')
            setLoading(false)
          }
        },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-brand-bg pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-brand-muted text-xl mb-6">Your cart is empty</p>
            <a href="/" className="btn-primary px-8 py-3">Shop Now</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-brand-bg pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl text-white mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* ── Left: Form ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact */}
              <div className="card p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Contact Info</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    className="input"
                    placeholder="Full Name *"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email *"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <input
                  className="input"
                  placeholder="Phone Number *"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsappOptIn}
                    onChange={(e) => setForm((f) => ({ ...f, whatsappOptIn: e.target.checked }))}
                    className="w-4 h-4 accent-brand-orange"
                  />
                  <span className="text-brand-muted text-sm">
                    Get order updates on WhatsApp (recommended)
                  </span>
                </label>
              </div>

              {/* Address */}
              <div className="card p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Delivery Address</h2>
                <input
                  className="input"
                  placeholder="Address Line 1 *"
                  required
                  value={form.line1}
                  onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Address Line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      className="input"
                      placeholder="Pincode *"
                      maxLength={6}
                      required
                      value={form.pincode}
                      onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
                    />
                    {pincodeLoading && (
                      <Loader className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-brand-muted" />
                    )}
                  </div>
                  <input
                    className="input"
                    placeholder="City *"
                    required
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="State *"
                    required
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="card p-6 space-y-4">
                <h2 className="text-white font-semibold text-lg">Payment Method</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(
                    [
                      { value: 'online', label: 'Pay Online', sub: 'UPI, Card, NetBanking', Icon: CreditCard },
                      { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when delivered', Icon: Banknote },
                    ] as const
                  ).map(({ value, label, sub, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === value
                          ? 'border-brand-orange bg-brand-orange/10'
                          : 'border-brand-border hover:border-brand-muted'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-2 ${paymentMethod === value ? 'text-brand-orange' : 'text-brand-muted'}`}
                      />
                      <p
                        className={`font-semibold ${paymentMethod === value ? 'text-white' : 'text-brand-muted'}`}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-brand-muted">{sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Order summary ── */}
            <div>
              <div className="card p-6 space-y-4 sticky top-24">
                <h2 className="text-white font-semibold text-lg">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <div className="w-16 h-16 bg-brand-card rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-brand-muted text-xs">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                        <p className="text-white text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
                    <input
                      className="input pl-9 text-sm py-2 uppercase"
                      placeholder="Coupon code"
                      value={form.couponCode}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))
                        if (couponApplied) {
                          setCouponApplied(false)
                          setCouponDiscount(0)
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !form.couponCode || couponApplied}
                    className="btn-secondary px-3 py-2 text-sm whitespace-nowrap"
                  >
                    {couponLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : couponApplied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm border-t border-brand-border pt-4">
                  <div className="flex justify-between text-brand-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon ({form.couponCode})</span>
                      <span>−{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-brand-muted">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? '🎉 FREE' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-base border-t border-brand-border pt-2">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
                >
                  {loading && <Loader className="w-5 h-5 animate-spin" />}
                  {loading
                    ? 'Processing...'
                    : paymentMethod === 'cod'
                    ? 'Place Order (COD)'
                    : `Pay ${formatPrice(total)}`}
                </button>

                <p className="text-xs text-brand-muted text-center">
                  🔒 Secured by Razorpay · 128-bit SSL encryption
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
