import { paymentLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendOrderConfirmationWA } from '@/lib/whatsapp'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { createShiprocketOrder } from '@/lib/shiprocket'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
    }

    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        address: true,
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paymentStatus === 'PAID') {
      // Already processed (duplicate callback) — return success
      return NextResponse.json({ success: true, orderNumber: order.orderNumber })
    }

    // Update order, customer stats, and decrement stock atomically
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
        },
      }),
      prisma.orderStatusHistory.create({
        data: { orderId, status: 'CONFIRMED' },
      }),
      prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.total },
          lastOrderAt: new Date(),
        },
      }),
      ...order.items.map(item =>
        prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
    ])

    // Increment coupon usage if applicable
    if (order.couponCode) {
      await prisma.coupon.updateMany({
        where: { code: order.couponCode },
        data: { usedCount: { increment: 1 } },
      }).catch(console.error)
    }

    // Fire-and-forget notifications
    if (order.customer.phone && order.customer.whatsappOptIn) {
      sendOrderConfirmationWA(order.customer.phone, {
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
      }).catch(console.error)
    }

    sendOrderConfirmationEmail(order.customer.email, {
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      items: order.items.map(i => ({
        name: i.productName,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: order.subtotal,
      shipping: order.shippingCharge,
      total: order.total,
      address: order.address
        ? `${order.address.line1}, ${order.address.city} - ${order.address.pincode}`
        : '',
    }).catch(console.error)

    // Create Shiprocket order (fire and forget)
    if (order.address) {
      const nameParts = order.customer.name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || '-'

      createShiprocketOrder({
        order_id: order.orderNumber,
        order_date: order.createdAt.toISOString().split('T')[0],
        pickup_location: process.env.WAREHOUSE_NAME || 'Primary',
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: order.address.line1 + (order.address.line2 ? `, ${order.address.line2}` : ''),
        billing_city: order.address.city,
        billing_pincode: order.address.pincode,
        billing_state: order.address.state,
        billing_country: 'India',
        billing_email: order.customer.email,
        billing_phone: order.address.phone,
        shipping_is_billing: true,
        order_items: order.items.map(i => ({
          name: i.productName,
          sku: i.sku,
          units: i.quantity,
          selling_price: i.price,
        })),
        payment_method: 'Prepaid',
        sub_total: order.subtotal,
        length: 32,
        breadth: 25,
        height: 14,
        weight: 0.8,
      }).then(async (shiprocketRes) => {
        if (shiprocketRes?.order_id) {
          await prisma.order.update({
            where: { id: orderId },
            data: { shiprocketOrderId: String(shiprocketRes.order_id) },
          }).catch(console.error)
        }
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber })
  } catch (err: any) {
    console.error('[Payment Verify] Error:', err)
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 })
  }
}
