import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRazorpayOrder } from '@/lib/razorpay'
import { generateOrderNumber, calculateShipping, getShippingSettings } from '@/lib/utils'
import { sendOrderConfirmed, sendLowStockAlert } from '@/lib/whatsapp'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { createShipment } from '@/lib/shiprocket'
import { z } from 'zod'

const OrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  whatsappOptIn: z.boolean().default(false),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().min(1) })),
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

    // Validate stock
    const variants = await prisma.variant.findMany({
      where: { id: { in: data.items.map((i) => i.variantId) } },
      include: { product: true },
    })

    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 })
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant.product.name} - ${variant.size}` },
          { status: 400 },
        )
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = data.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!
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

    // Apply coupon
    let discount = 0
    let influencerCode: string | undefined
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode.toUpperCase(), isActive: true },
        include: { influencer: true },
      })
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (subtotal >= coupon.minOrderValue) {
            discount =
              coupon.discountType === 'PERCENTAGE'
                ? Math.round((subtotal * coupon.discountValue) / 100)
                : coupon.discountValue
            if (coupon.influencer) influencerCode = coupon.code
          }
        }
      }
    }

    const { freeShippingThreshold, shippingCharge } = await getShippingSettings()
    const shipping = calculateShipping(subtotal - discount, freeShippingThreshold, shippingCharge)
    const total = subtotal - discount + shipping

    // Get or create customer
    let customer = await prisma.customer.findFirst({ where: { email: data.customerEmail } })
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          whatsappOptIn: data.whatsappOptIn,
        },
      })
    } else if (!customer.phone && data.customerPhone) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { phone: data.customerPhone, whatsappOptIn: data.whatsappOptIn },
      })
    }

    // Create address
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

    const orderCount = await prisma.order.count()
    const orderNumber = generateOrderNumber(orderCount + 1)
    const isCOD = data.paymentMethod === 'COD'

    let razorpayOrderId: string | undefined
    if (!isCOD) {
      const rzpOrder = await createRazorpayOrder(total, orderNumber)
      razorpayOrderId = (rzpOrder as { id: string }).id
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        addressId: address.id,
        status: isCOD ? 'CONFIRMED' : 'PENDING',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'PENDING',
        razorpayOrderId,
        subtotal,
        shippingCharge: shipping,
        discount,
        total,
        couponCode: data.couponCode?.toUpperCase(),
        influencerCode,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        items: { create: orderItems },
        statusHistory: { create: { status: isCOD ? 'CONFIRMED' : 'PENDING' } },
      },
      include: {
        items: { include: { product: true, variant: true } },
        customer: true,
        address: true,
      },
    })

    // COD: decrement stock, send notifications, create shipment immediately
    if (isCOD) {
      // Decrement stock
      for (const item of order.items) {
        const variant = await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
          include: { product: true },
        })
        if (variant.stock <= variant.lowStockAt && process.env.ADMIN_WHATSAPP_PHONE) {
          sendLowStockAlert(process.env.ADMIN_WHATSAPP_PHONE!, {
            productName: `${variant.product.name} - ${variant.size} ${variant.color}`,
            sku: variant.sku,
            stock: variant.stock,
          }).catch(console.error)
        }
      }

      // Update customer stats
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.total },
          lastOrderAt: new Date(),
        },
      })

      // Increment coupon usage
      if (order.couponCode) {
        await prisma.coupon.updateMany({
          where: { code: order.couponCode },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Create Shiprocket shipment
      createShipment({
        orderNumber: order.orderNumber,
        orderDate: new Date().toISOString().split('T')[0],
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone ?? '',
        shippingAddress: {
          line1: order.address.line1,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
        },
        items: order.items.map((i) => ({
          name: i.product.name,
          sku: i.sku,
          units: i.quantity,
          sellingPrice: i.price,
        })),
        paymentMethod: 'COD',
        subTotal: order.subtotal,
        total: order.total,
      }).catch(console.error)

      // WhatsApp notification
      const itemsSummary = order.items
        .map((i) => `${i.productName} (${i.size}) x${i.quantity}`)
        .join(', ')

      if (order.customer.phone && order.customer.whatsappOptIn) {
        sendOrderConfirmed(order.customer.phone, {
          customerName: order.customer.name,
          orderNumber: order.orderNumber,
          total: order.total,
          items: itemsSummary,
        }).catch(console.error)
      }

      // Email notification
      sendOrderConfirmationEmail(order.customer.email, {
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        items: order.items.map((i) => ({
          name: i.productName,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: order.subtotal,
        shipping: order.shippingCharge,
        total: order.total,
        address: `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
      }).catch(console.error)
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      razorpayOrderId,
      total,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
