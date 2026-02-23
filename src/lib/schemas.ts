/**
 * Central Zod validation schemas for orders, auth, and reviews.
 */
import { z } from 'zod'

// ── Auth ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
})

// ── Orders ──────────────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10),
})

export const OrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  whatsappOptIn: z.boolean().default(false),
  addressLine1: z.string().min(5, 'Address is too short').max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().length(6, 'Pincode must be 6 digits').regex(/^\d{6}$/, 'Invalid pincode'),
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD', 'EMI', 'WALLET']),
  couponCode: z.string().max(50).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
})

// ── Reviews ─────────────────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  body: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must be 1000 characters or less'),
})

// ── Coupon ──────────────────────────────────────────────────────────────────

export const CouponValidateSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  subtotal: z.number().min(0),
})

// ── Chat ────────────────────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
})

export const ChatSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type OrderInput = z.infer<typeof OrderSchema>
export type ReviewInput = z.infer<typeof ReviewSchema>
