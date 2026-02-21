import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { prisma } from '@/lib/prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function generateOrderNumber(count: number): string {
  // Suffix with last 3 digits of timestamp to reduce race condition collisions
  const ts = String(Date.now()).slice(-3)
  return `NPG-${new Date().getFullYear()}-${String(count).padStart(5, '0')}-${ts}`
}

export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100)
}

export async function getShippingSettings() {
  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: ['FREE_SHIPPING_THRESHOLD', 'SHIPPING_CHARGE', 'COD_MIN_ORDER', 'COD_ENABLED'] } },
  })
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  return {
    freeShippingThreshold: parseFloat(map.FREE_SHIPPING_THRESHOLD ?? '999'),
    shippingCharge: parseFloat(map.SHIPPING_CHARGE ?? '49'),
    codMinOrder: parseFloat(map.COD_MIN_ORDER ?? '299'),
    codEnabled: (map.COD_ENABLED ?? 'true') === 'true',
  }
}

export function calculateShipping(subtotal: number, freeThreshold = 999, charge = 49): number {
  return subtotal >= freeThreshold ? 0 : charge
}
