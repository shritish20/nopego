export type Category = 'SNEAKERS' | 'SPORTS' | 'CASUAL' | 'FORMAL' |
'ETHNIC'
export type Gender = 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED'
| 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' |
'RETURN_APPROVED' | 'RETURN_PICKED' | 'REFUNDED'
export type PaymentMethod = 'RAZORPAY' | 'COD'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export interface ProductVariant { id: string; size: string; color: string;
colorHex: string; sku: string; stock: number; lowStockThreshold: number }
export interface Product { id: string; name: string; slug: string;
description: string; category: Category; gender: Gender; price: number;
comparePrice?: number; images: string[]; tags: string[]; isActive: boolean;
isFeatured: boolean; variants: ProductVariant[]; metaTitle?: string;
metaDescription?: string; createdAt: string; updatedAt: string; avgRating?:
number; reviewCount?: number }
export interface CartItem { id?: string; product: Product; variant:
ProductVariant; quantity: number }
export interface Address { id?: string; name: string; phone: string; line1:
string; line2?: string; city: string; state: string; pincode: string;
isDefault?: boolean }
export interface Customer { id: string; name: string; email: string; phone?:
string; whatsappOptIn: boolean; addresses: Address[]; totalOrders: number;
totalSpend: number }
export interface ApiResponse<T = any> { success: boolean; data?: T; error?:
string; message?: string }
export interface DashboardStats { today: { revenue: number; orders: number;
visitors: number; conversionRate: number }; yesterday: { revenue: number;
orders: number }; thisMonth: { revenue: number; orders: number;
newCustomers: number }; allTime: { revenue: number; orders: number;
customers: number; avgOrderValue: number } }