import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendOrderConfirmed } from '@/lib/whatsapp'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { createShipment } from '@/lib/shiprocket'
import { sendLowStockAlert } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await req.json()

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        items: { include: { product: true, variant: true } },
        customer: true,
        address: true,
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        razorpayPaymentId,
        statusHistory: { create: { status: 'CONFIRMED', note: `Payment ${razorpayPaymentId}` } },
      },
    })

    // Decrement stock
    for (const item of order.items) {
      const variant = await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
        include: { product: true },
      })
      // Low stock alert
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
      paymentMethod: order.paymentMethod,
      subTotal: order.subtotal,
      total: order.total,
    }).catch(console.error)

    // WhatsApp & email notifications
    const itemsSummary = order.items.map((i) => `${i.productName} (${i.size}) x${i.quantity}`).join(', ')
    if (order.customer.phone && order.customer.whatsappOptIn) {
      sendOrderConfirmed(order.customer.phone, {
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        total: order.total,
        items: itemsSummary,
      }).catch(console.error)
    }

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

    return NextResponse.json({ success: true, orderNumber: order.orderNumber })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
