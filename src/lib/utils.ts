import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateOrderNumber(count: number): string {
  const year = new Date().getFullYear()
  return `NPG-${year}-${String(count).padStart(5, '0')}`
}

export async function lookupPincode(pincode: string) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await res.json()
    if (data[0]?.Status === 'Success') {
      const post = data[0].PostOffice[0]
      return { city: post.District, state: post.State, valid: true }
    }
    return { city: '', state: '', valid: false }
  } catch {
    return { city: '', state: '', valid: false }
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function discountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateShipping(subtotal: number, freeThreshold = 999, shippingCharge = 49): number {
  return subtotal >= freeThreshold ? 0 : shippingCharge
}

export function isCODAvailable(subtotal: number, codMinOrder = 299): boolean {
  return subtotal >= codMinOrder
}

export async function getShippingSettings(): Promise<{
  freeThreshold: number
  shippingCharge: number
  codMinOrder: number
  codEnabled: boolean
}> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['FREE_SHIPPING_THRESHOLD', 'SHIPPING_CHARGE', 'COD_MIN_ORDER', 'COD_ENABLED'] } },
    })
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
    return {
      freeThreshold: parseFloat(map['FREE_SHIPPING_THRESHOLD'] || '999'),
      shippingCharge: parseFloat(map['SHIPPING_CHARGE'] || '49'),
      codMinOrder: parseFloat(map['COD_MIN_ORDER'] || '299'),
      codEnabled: (map['COD_ENABLED'] || 'true') === 'true',
    }
  } catch {
    return { freeThreshold: 999, shippingCharge: 49, codMinOrder: 299, codEnabled: true }
  }
}

export function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
