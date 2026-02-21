export interface CartItem {
  productId: string
  variantId: string
  name: string
  price: number
  size: string
  color: string
  image?: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  material?: string | null
  careInstructions?: string | null
  basePrice: number
  discountedPrice?: number | null
  images: string[]
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  category: { id: string; name: string; slug: string }
  variants: Variant[]
  reviews?: { rating: number; isPublished: boolean }[]
}

export interface Variant {
  id: string
  size: string
  color: string
  colorHex?: string | null
  sku: string
  stock: number
  lowStockAt: number
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  shippingCharge: number
  discount: number
  total: number
  couponCode?: string | null
  trackingNumber?: string | null
  courierName?: string | null
  createdAt: Date | string
  customer: { id: string; name: string; email: string; phone?: string | null }
  address: { line1: string; line2?: string | null; city: string; state: string; pincode: string }
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productName: string
  size: string
  color: string
  sku: string
  quantity: number
  price: number
  total: number
}
