'use client'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart, useCartSubtotal } from '@/hooks/useCart'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const FREE_SHIPPING_THRESHOLD = 999

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCart()
  const subtotal = useCartSubtotal()
  const shippingLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-card border-l border-brand-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-brand-orange" />
                <h2 className="text-white font-semibold text-lg">Cart ({items.length})</h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-brand-border"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping bar */}
            {subtotal > 0 && (
              <div className="px-6 py-3 border-b border-brand-border">
                {shippingLeft > 0 ? (
                  <p className="text-sm text-brand-muted mb-2">
                    Add {formatPrice(shippingLeft)} more for{' '}
                    <span className="text-green-400">FREE shipping</span>
                  </p>
                ) : (
                  <p className="text-sm text-green-400 mb-2">🎉 You have free shipping!</p>
                )}
                <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500 rounded-full"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-brand-muted gap-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p>Your cart is empty</p>
                  <button onClick={closeCart} className="btn-secondary px-6 py-2 text-sm">
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 bg-brand-bg rounded-xl p-3">
                    <div className="w-20 h-20 bg-brand-card rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      <p className="text-brand-muted text-xs mt-0.5">
                        {item.color} · {item.size}
                      </p>
                      <p className="text-brand-orange font-semibold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-muted hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-brand-card flex items-center justify-center text-brand-muted hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="ml-auto text-brand-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-brand-border space-y-4">
                <div className="flex justify-between text-white">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full text-center block py-4 text-base font-semibold"
                >
                  Checkout → {formatPrice(subtotal)}
                </Link>
                <p className="text-xs text-brand-muted text-center">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
