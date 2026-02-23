import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface CartItem {
productId: string
variantId: string
name: string
price: number
size: string
color: string
image?: string
quantity: number
}
interface CartStore {
items: CartItem[]
isOpen: boolean
openCart: () => void
closeCart: () => void
addItem: (item: Omit<CartItem, 'quantity'>) => void
removeItem: (variantId: string) => void
updateQuantity: (variantId: string, quantity: number) => void
clearCart: () => void
itemCount: number
subtotal: number
}
export const useCart = create<CartStore>()(
persist(
(set, get) => ({
items: [],
isOpen: false,
openCart: () => set({ isOpen: true }),
closeCart: () => set({ isOpen: false }),
addItem: (item) => {
const items = get().items
const existing = items.find(i => i.variantId === item.variantId)
if (existing) {
set({ items: items.map(i => i.variantId === item.variantId ? {
...i, quantity: i.quantity + 1 } : i), isOpen: true })
} else {
set({ items: [...items, { ...item, quantity: 1 }], isOpen: true })}
},
removeItem: (variantId) => set({ items: get().items.filter(i =>
i.variantId !== variantId) }),
updateQuantity: (variantId, quantity) => {
if (quantity <= 0) { get().removeItem(variantId); return }
set({ items: get().items.map(i => i.variantId === variantId ? {
...i, quantity } : i) })
},
clearCart: () => set({ items: [] }),
get itemCount() { return get().items.reduce((s, i) => s + i.quantity,
0) },
get subtotal() { return get().items.reduce((s, i) => s + i.price *
i.quantity, 0) },
}),
{ name: 'nopego-cart' }
)
)