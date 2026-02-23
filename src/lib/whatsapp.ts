const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

async function sendWhatsApp(to: string, message: string) {
  if (!PHONE_ID || !TOKEN) {
    console.warn('[WhatsApp] Missing credentials, skipping send')
    return
  }
  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''),
      type: 'text',
      text: { body: message },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp] Send failed:', err)
  }
  return res.json()
}

export async function sendOrderConfirmationWA(phone: string, data: {
  customerName: string
  orderNumber: string
  total: number
  itemCount: number
}) {
  const msg = `Hi ${data.customerName}! 👟 Your Nopego order *${data.orderNumber}* is confirmed!\n\n*${data.itemCount} item(s)* · Total: *₹${data.total.toLocaleString('en-IN')}*\n\nWe'll ship it within 48 hours. Track your order at ${process.env.NEXT_PUBLIC_APP_URL}/track\n\n_Questions? Just reply to this message!_`
  return sendWhatsApp(phone, msg)
}

export async function sendShippingUpdateWA(phone: string, data: {
  customerName: string
  orderNumber: string
  trackingNumber: string
  courierName: string
}) {
  const msg = `Hi ${data.customerName}! 🚚 Your Nopego order *${data.orderNumber}* has been shipped!\n\nCourier: *${data.courierName}*\nTracking: *${data.trackingNumber}*\n\nTrack at: ${process.env.NEXT_PUBLIC_APP_URL}/track?order=${data.orderNumber}`
  return sendWhatsApp(phone, msg)
}

export async function sendAbandonedCartWA(phone: string, customerName: string) {
  const msg = `Hi ${customerName}! 👟 You left some great shoes in your Nopego cart.\n\nComplete your order now and get FREE shipping above ₹999!\n\n${process.env.NEXT_PUBLIC_APP_URL}/checkout\n\n_Reply STOP to unsubscribe_`
  return sendWhatsApp(phone, msg)
}

export async function sendAbandonedCartDiscountWA(phone: string, data: {
  customerName: string
  couponCode: string
  discount: string
}) {
  const msg = `Hi ${data.customerName}! 🎁 Here's an exclusive offer just for you!\n\nUse code *${data.couponCode}* for *${data.discount} OFF* your cart.\n\nOffer expires in 24 hours. Shop now:\n${process.env.NEXT_PUBLIC_APP_URL}/checkout\n\n_Reply STOP to unsubscribe_`
  return sendWhatsApp(phone, msg)
}

export async function sendReviewRequestWA(phone: string, data: {
  customerName: string
  orderNumber: string
  reviewUrl: string
}) {
  const msg = `Hi ${data.customerName}! 🌟 How are you loving your Nopego shoes?\n\nYour order *${data.orderNumber}* was delivered a week ago. We'd love your feedback!\n\nLeave a review (takes 2 minutes): ${data.reviewUrl}\n\n_Your review helps other shoppers find the right fit!_`
  return sendWhatsApp(phone, msg)
}

export async function sendLowStockAlert(phone: string, data: {
  productName: string
  sku: string
  stock: number
}) {
  const msg = `⚠️ *Low Stock Alert — Nopego*\n\nProduct: *${data.productName}*\nSKU: ${data.sku}\nStock remaining: *${data.stock} units*\n\nTime to restock!`
  return sendWhatsApp(phone, msg)
}

export async function broadcastWA(phones: string[], message: string) {
  const results = await Promise.allSettled(phones.map(p => sendWhatsApp(p, message)))
  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return { sent, failed }
}
