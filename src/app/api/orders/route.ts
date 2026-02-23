import { orderLogger, paymentLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRazorpayOrder } from '@/lib/razorpay'
import { calculateShipping } from '@/lib/utils'
import { sendOrderConfirmationWA } from '@/lib/whatsapp'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { createShiprocketOrder } from '@/lib/shiprocket'
import { z } from 'zod'
import crypto from 'crypto'

const OrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  whatsappOptIn: z.boolean().default(false),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  items: z.array(
    z.object({ variantId: z.string(), quantity: z.number().min(1) })
  ),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD', 'EMI', 'WALLET']),
  couponCode: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = OrderSchema.parse(body)

    // --- Stock validation ---
    const variants = await prisma.variant.findMany({
      where: { id: { in: data.items.map(i => i.variantId) } },
      include: { product: true },
    })

    for (const item of data.items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (!variant) {
        return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 })
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `${variant.product.name} (${variant.size}) is out of stock` },
          { status: 400 }
        )
      }
    }

    // --- Build order items and calculate subtotal ---
    let subtotal = 0
    const orderItems = data.items.map(item => {
      const variant = variants.find(v => v.id === item.variantId)!
      const price = variant.product.discountedPrice ?? variant.product.basePrice
      const total = price * item.quantity
      subtotal += total
      return {
        productId: variant.productId,
        variantId: item.variantId,
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        quantity: item.quantity,
        price,
        total,
      }
    })

    const shipping = calculateShipping(subtotal)

    // --- Coupon validation ---
    let discount = 0
    let validatedCouponCode: string | undefined

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase().trim() },
      })

      if (!coupon) {
        return NextResponse.json({ error: 'Coupon code not found' }, { status: 400 })
      }
      if (!coupon.isActive) {
        return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }
      if (subtotal < coupon.minOrderValue) {
        return NextResponse.json(
          { error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` },
          { status: 400 }
        )
      }

      if (coupon.discountType === 'PERCENT') {
        discount = Math.round((subtotal * coupon.discountValue) / 100)
      } else if (coupon.discountType === 'FLAT') {
        discount = Math.min(coupon.discountValue, subtotal)
      }

      validatedCouponCode = coupon.code
    }

    const total = Math.max(0, subtotal + shipping - discount)

    // --- Customer upsert ---
    let customer
    if (data.customerId) {
      customer = await prisma.customer.findUnique({ where: { id: data.customerId } })
    }

    if (!customer) {
      customer = await prisma.customer.upsert({
        where: { email: data.customerEmail },
        update: {
          name: data.customerName,
          phone: data.customerPhone,
          whatsappOptIn: data.whatsappOptIn,
        },
        create: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          whatsappOptIn: data.whatsappOptIn,
        },
      })
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer error' }, { status: 500 })
    }

    // --- Address ---
    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        name: data.customerName,
        phone: data.customerPhone,
        line1: data.addressLine1,
        line2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
    })

    // --- Order number: use UUID suffix to prevent race conditions ---
    const now = new Date()
    const year = now.getFullYear()
    const suffix = crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase()
    const orderNumber = `NPG-${year}-${suffix}`

    // --- Razorpay order (online payments only) ---
    let razorpayOrderId: string | undefined
    if (data.paymentMethod !== 'COD') {
      const rzpOrder = await createRazorpayOrder(total, orderNumber)
      razorpayOrderId = rzpOrder.id as string
    }

    // --- Create order ---
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
        status: data.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        subtotal,
        shippingCharge: shipping,
        discount,
        total,
        razorpayOrderId,
        couponCode: validatedCouponCode,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        items: { create: orderItems },
        statusHistory: {
          create: {
            status: data.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          },
        },
      },
    })

    // --- COD: decrement stock immediately, send notifications, create Shiprocket order ---
    if (data.paymentMethod === 'COD') {
      await prisma.$transaction([
        ...data.items.map(item =>
          prisma.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
            lastOrderAt: new Date(),
          },
        }),
      ])

      // Increment coupon usage
      if (validatedCouponCode) {
        await prisma.coupon.updateMany({
          where: { code: validatedCouponCode },
          data: { usedCount: { increment: 1 } },
        }).catch(console.error)
      }

      // Notifications (fire and forget)
      if (customer.phone && data.whatsappOptIn) {
        sendOrderConfirmationWA(customer.phone, {
          customerName: customer.name,
          orderNumber,
          total,
          itemCount: orderItems.reduce((s, i) => s + i.quantity, 0),
        }).catch(console.error)
      }

      sendOrderConfirmationEmail(customer.email, {
        customerName: customer.name,
        orderNumber,
        items: orderItems.map(i => ({
          name: i.productName,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        shipping,
        total,
        address: `${data.addressLine1}, ${data.city} - ${data.pincode}`,
      }).catch(console.error)

      // Shiprocket (COD)
      const nameParts = data.customerName.split(' ')
      createShiprocketOrder({
        order_id: orderNumber,
        order_date: now.toISOString().split('T')[0],
        pickup_location: process.env.WAREHOUSE_NAME || 'Primary',
        billing_customer_name: nameParts[0],
        billing_last_name: nameParts.slice(1).join(' ') || '-',
        billing_address: data.addressLine1 + (data.addressLine2 ? `, ${data.addressLine2}` : ''),
        billing_city: data.city,
        billing_pincode: data.pincode,
        billing_state: data.state,
        billing_country: 'India',
        billing_email: data.customerEmail,
        billing_phone: data.customerPhone,
        shipping_is_billing: true,
        order_items: orderItems.map(i => ({
          name: i.productName,
          sku: i.sku,
          units: i.quantity,
          selling_price: i.price,
        })),
        payment_method: 'COD',
        sub_total: subtotal,
        length: 32,
        breadth: 25,
        height: 14,
        weight: 0.8,
      }).then(async (res) => {
        if (res?.order_id) {
          await prisma.order.update({
            where: { id: order.id },
            data: { shiprocketOrderId: String(res.order_id) },
          }).catch(console.error)
        }
      }).catch(console.error)
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      razorpayOrderId,
      total,
      discount,
      paymentMethod: data.paymentMethod,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error('[Order Creation] Error:', error)
    return NextResponse.json({ error: error.message || 'Order creation failed' }, { status: 500 })
  }
}
