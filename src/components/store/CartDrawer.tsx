'use client'
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice, calculateShipping } from '@/lib/utils'
import Link from 'next/link'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, subtotal } = useCart()
  const shipping = calculateShipping(subtotal)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-50" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] z-50 flex flex-col animate-slide-in-right border-l border-[#1E1E1E]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#FF5A00]" />
            <span className="font-display text-xl tracking-wide">YOUR CART</span>
            <span className="bg-[#FF5A00] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {items.length}
            </span>
          </div>
          <button onClick={closeCart} className="text-[#666] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-6xl">👟</span>
              <p className="text-[#666]">Your cart is empty</p>
              <button onClick={closeCart} className="text-[#FF5A00] text-sm hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="flex gap-4 p-3 bg-[#0D0D0D] border border-[#1E1E1E]">
                {/* Image */}
                <div className="w-16 h-16 bg-[#111111] flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👟</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{item.name}</p>
                  <p className="text-[#666] text-xs">{item.color} · UK{item.size}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 border border-[#2A2A2A] text-[#666] hover:border-[#FF5A00] hover:text-white flex items-center justify-center text-sm transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 border border-[#2A2A2A] text-[#666] hover:border-[#FF5A00] hover:text-white flex items-center justify-center text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[#FF5A00] font-bold text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-[#444] hover:text-red-400 transition-colors self-start"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#1E1E1E] space-y-4">
            {/* Free shipping progress */}
            {subtotal < 999 && (
              <div>
                <div className="flex justify-between text-xs text-[#666] mb-2">
                  <span>Add {formatPrice(999 - subtotal)} more for free shipping</span>
                  <span>{Math.round((subtotal / 999) * 100)}%</span>
                </div>
                <div className="h-1 bg-[#1E1E1E] rounded-full">
                  <div
                    className="h-1 bg-[#FF5A00] rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 999 && (
              <p className="text-green-400 text-xs text-center">🎉 You&apos;ve unlocked free shipping!</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-[#1E1E1E]">
                <span>Total</span>
                <span className="text-[#FF5A00]">{formatPrice(subtotal + shipping)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-[#FF5A00] text-white py-4 font-bold tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF7A30] transition-colors"
            >
              CHECKOUT <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
