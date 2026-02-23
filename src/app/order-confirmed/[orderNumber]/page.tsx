import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'

export default async function OrderConfirmedPage({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { customer: true, address: true, items: { include: { product: true } } },
  })

  if (!order) notFound()

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-20">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="font-display text-4xl text-white mb-2">ORDER CONFIRMED!</h1>
          <p className="text-brand-muted">Thank you, {order.customer.name}. Your shoes are on their way.</p>
          <div className="inline-block mt-3 px-4 py-2 bg-brand-card border border-brand-border rounded">
            <span className="text-brand-muted text-sm">Order Number: </span>
            <span className="text-[#FF5A00] font-bold"> {order.orderNumber}</span>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="flex items-center justify-between mb-10 px-4">
          {[
            { icon: CheckCircle, label: 'Confirmed', done: true },
            { icon: Package, label: 'Processing', done: order.status !== 'PENDING' && order.status !== 'CONFIRMED' },
            { icon: Truck, label: 'Shipped', done: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
            { icon: MapPin, label: 'Delivered', done: order.status === 'DELIVERED' },
          ].map(({ icon: Icon, label, done }, i, arr) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-green-500' : 'bg-brand-card border border-brand-border'}`}>
                  <Icon size={18} className={done ? 'text-white' : 'text-brand-muted'} />
                </div>
                <span className={`text-xs ${done ? 'text-white' : 'text-brand-muted'}`}> {label}</span>
              </div>
              {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-500' : 'bg-brand-border'}`} />}
            </div>
          ))}
        </div>

        {/* Order details */}
        <div className="bg-brand-card border border-brand-border rounded p-6 mb-6">
          <h2 className="font-medium text-white mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{item.productName}</p>
                  <p className="text-brand-muted text-xs">{item.color} · UK{item.size} · Qty {item.quantity}</p>
                </div>
                <span className="text-white font-medium"> {formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-border mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-brand-muted"><span>Subtotal</span> <span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between text-brand-muted">
              <span>Shipping</span>
              <span className={order.shippingCharge === 0 ? 'text-green-400' : ''}>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base pt-1">
              <span>Total Paid</span><span className="text-[#FF5A00]"> {formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* FIX: Check if order.address exists before trying to render its properties */}
        {order.address && (
          <div className="bg-brand-card border border-brand-border rounded p-6 mb-8">
            <h2 className="font-medium text-white mb-3 flex items-center gap-2"><MapPin size={16} className="text-[#FF5A00]" /> Delivering To</h2>
            <p className="text-white text-sm">{order.address.name}</p>
            <p className="text-brand-muted text-sm">{order.address.line1} {order.address.line2 ? `, ${order.address.line2}` : ''}</p>
            <p className="text-brand-muted text-sm">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            <p className="text-brand-muted text-sm">{order.address.phone}</p>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-8 text-center">
          <p className="text-green-400 font-medium mb-1">📱 Get WhatsApp Updates</p>
          <p className="text-brand-muted text-sm">We'll send you shipping updates directly on WhatsApp</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/track" className="flex-1 text-center border border-brand-border text-brand-muted hover:border-[#FF5A00] hover:text-white py-3 transition-colors text-sm font-medium">
            TRACK ORDER
          </Link>
          <Link href="/" className="flex-1 text-center bg-[#FF5A00] text-white py-3 hover:bg-[#FF7A30] transition-colors text-sm font-medium">
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}