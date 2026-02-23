'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Lock, Loader, Tag, CheckCircle, X } from 'lucide-react'
import Navbar from '@/components/store/Navbar'
import CartDrawer from '@/components/store/CartDrawer'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateShipping, isCODAvailable } from '@/lib/utils'
import toast from 'react-hot-toast'

declare global {
  interface Window { Razorpay: any }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY')
  const [whatsappOptIn, setWhatsappOptIn] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '',
  })

  const shipping = calculateShipping(subtotal - discount)
  const total = Math.max(0, subtotal - discount + shipping)
  const codAvailable = isCODAvailable(subtotal)

  useEffect(() => {
    if (items.length === 0) router.push('/')
  }, [items, router])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  async function handlePincodeBlur() {
    if (form.pincode.length !== 6) return
    setPincodeLoading(true)
    try {
      const res = await fetch(`/api/pincode?code=${form.pincode}`)
      const data = await res.json()
      if (data.valid) setForm(f => ({ ...f, city: data.city, state: data.state }))
      else toast.error('Invalid pincode')
    } finally {
      setPincodeLoading(false)
    }
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      // Validate coupon via a lightweight check on the order API
      // We do a dry-run POST to see if the coupon is valid
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Invalid coupon code')
        return
      }
      setCouponCode(data.code)
      setDiscount(data.discount)
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`)
    } catch {
      toast.error('Could not apply coupon. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponCode('')
    setCouponInput('')
    setDiscount(0)
    toast.success('Coupon removed')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          whatsappOptIn,
          addressLine1: form.line1,
          addressLine2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
          paymentMethod: paymentMethod === 'COD' ? 'COD' : 'UPI',
          couponCode: couponCode || undefined,
          utmSource: params.get('utm_source') || undefined,
          utmMedium: params.get('utm_medium') || undefined,
          utmCampaign: params.get('utm_campaign') || undefined,
        }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      if (paymentMethod === 'COD') {
        clearCart()
        router.push(`/order-confirmed/${order.orderNumber}`)
        return
      }

      // Razorpay payment
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.razorpayOrderId,
        amount: total * 100,
        currency: 'INR',
        name: 'Nopego',
        description: `Order #${order.orderNumber}`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#FF5A00' },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId,
            }),
          })
          const result = await verifyRes.json()
          if (result.success) {
            clearCart()
            router.push(`/order-confirmed/${result.orderNumber}`)
          } else {
            toast.error('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-brand-muted hover:text-white flex items-center gap-1 text-sm transition-colors">
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
        </div>
        <h1 className="font-display text-4xl text-white mb-10">CHECKOUT</h1>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_380px] gap-10">

          {/* Left column */}
          <div className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="font-display text-xl text-white mb-4 tracking-wide">CONTACT INFORMATION</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-brand col-span-2" />
                <input required type="email" placeholder="Email Address" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-brand" />
                <input required placeholder="Phone Number" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="input-brand" />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={whatsappOptIn}
                  onChange={e => setWhatsappOptIn(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5A00]" />
                <span className="text-sm text-brand-muted">Get order updates on WhatsApp</span>
              </label>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="font-display text-xl text-white mb-4 tracking-wide">DELIVERY ADDRESS</h2>
              <div className="space-y-3">
                <input required placeholder="Address Line 1" value={form.line1}
                  onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
                  className="input-brand" />
                <input placeholder="Address Line 2 (optional)" value={form.line2}
                  onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
                  className="input-brand" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input required placeholder="Pincode" value={form.pincode}
                      onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                      onBlur={handlePincodeBlur} maxLength={6}
                      className="input-brand" />
                    {pincodeLoading && (
                      <Loader size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted animate-spin" />
                    )}
                  </div>
                  <input required placeholder="City" value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="input-brand" />
                </div>
                <input required placeholder="State" value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="input-brand" />
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-display text-xl text-white mb-4 tracking-wide">PAYMENT METHOD</h2>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-[#FF5A00] bg-[#FF5A00]/5' : 'border-brand-border hover:border-brand-muted'}`}>
                  <input type="radio" name="payment" value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-0.5 accent-[#FF5A00]" />
                  <div>
                    <p className="font-medium text-white text-sm">Pay Online</p>
                    <p className="text-brand-muted text-xs mt-0.5">UPI, Cards, Net Banking, EMI via Razorpay</p>
                  </div>
                </label>
                {codAvailable ? (
                  <label className={`flex items-start gap-3 p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#FF5A00] bg-[#FF5A00]/5' : 'border-brand-border hover:border-brand-muted'}`}>
                    <input type="radio" name="payment" value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-0.5 accent-[#FF5A00]" />
                    <div>
                      <p className="font-medium text-white text-sm">Cash on Delivery</p>
                      <p className="text-brand-muted text-xs mt-0.5">Pay when your order arrives</p>
                    </div>
                  </label>
                ) : (
                  <div className="p-4 border border-brand-border rounded opacity-50">
                    <p className="text-brand-muted text-sm">COD available for orders above ₹299</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right — order summary */}
          <div>
            <div className="bg-brand-card border border-brand-border rounded p-6 sticky top-24">
              <h2 className="font-display text-xl text-white mb-5 tracking-wide">ORDER SUMMARY</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-bg rounded flex items-center justify-center flex-shrink-0 text-lg overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                        : '👟'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-brand-muted text-xs">{item.color} · UK{item.size} · Qty {item.quantity}</p>
                    </div>
                    <span className="text-white text-sm font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon code */}
              <div className="mb-4">
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-green-400 text-sm font-medium">{couponCode}</span>
                      <span className="text-brand-muted text-xs">−{formatPrice(discount)}</span>
                    </div>
                    <button type="button" onClick={removeCoupon} className="text-brand-muted hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                        className="input-brand pl-9 text-sm py-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 border border-brand-border text-white text-sm hover:border-[#FF5A00] transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? <Loader size={14} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-brand-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Coupon Discount</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-brand-border">
                  <span>Total</span>
                  <span className="text-[#FF5A00]">{formatPrice(total)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-5 bg-[#FF5A00] text-white py-4 font-display text-lg tracking-widest hover:bg-[#FF7A30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader size={18} className="animate-spin" /> : <Lock size={16} />}
                {paymentMethod === 'COD' ? 'PLACE ORDER' : 'PAY NOW'}
              </button>
              <p className="text-center text-brand-subtle text-xs mt-3">🔒 256-bit SSL encrypted</p>
            </div>
          </div>

        </form>
      </main>
    </>
  )
}
