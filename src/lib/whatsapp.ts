const WA_BASE = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`

async function sendMessage(to: string, text: string) {
  const res = await fetch(WA_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
  return res.json()
}

export async function sendOrderConfirmed(phone: string, data: {
  customerName: string
  orderNumber: string
  total: number
  items: string
}) {
  const msg = `Hi ${data.customerName}! 👟\n\nYour Nopego order *${data.orderNumber}* is confirmed!\n\nItems: ${data.items}\nTotal: ₹${data.total}\n\nWe'll notify you when it ships. Thank you! 🙏`
  return sendMessage(phone, msg)
}

export async function sendOrderShipped(phone: string, data: {
  customerName: string
  orderNumber: string
  courierName: string
  trackingNumber: string
  trackingUrl: string
}) {
  const msg = `Hi ${data.customerName}! 🚚\n\nYour order *${data.orderNumber}* has shipped!\n\nCourier: ${data.courierName}\nTracking: ${data.trackingNumber}\n\nTrack here: ${data.trackingUrl}`
  return sendMessage(phone, msg)
}

export async function sendLowStockAlert(phone: string, data: {
  productName: string
  sku: string
  stock: number
}) {
  const msg = `⚠️ Low Stock Alert\n\n${data.productName}\nSKU: ${data.sku}\nRemaining: ${data.stock} units\n\nRestock soon!`
  return sendMessage(phone, msg)
}

export async function sendAbandonedCartReminder(phone: string, data: {
  customerName: string
  cartUrl: string
  items: string
}) {
  const msg = `Hi ${data.customerName}! 👟\n\nYou left something in your cart:\n${data.items}\n\nComplete your order: ${data.cartUrl}`
  return sendMessage(phone, msg)
}

export async function sendAbandonedCartDiscount(phone: string, data: {
  customerName: string
  cartUrl: string
  couponCode: string
  discount: string
}) {
  const msg = `Hi ${data.customerName}! 🎁\n\nHere's ${data.discount} off your cart — use code *${data.couponCode}*\n\nComplete your order: ${data.cartUrl}\n\nCode expires in 24 hours!`
  return sendMessage(phone, msg)
}

export async function sendReviewRequest(phone: string, data: {
  customerName: string
  orderNumber: string
  reviewUrl: string
}) {
  const msg = `Hi ${data.customerName}! 😊\n\nYour Nopego order *${data.orderNumber}* was delivered!\n\nLoved your new kicks? Leave a review:\n${data.reviewUrl}\n\nThank you for choosing Nopego! 🙏`
  return sendMessage(phone, msg)
}

export async function sendBroadcast(phones: string[], message: string) {
  const results = await Promise.allSettled(phones.map((phone) => sendMessage(phone, message)))
  return results.map((r, i) => ({ phone: phones[i], success: r.status === 'fulfilled' }))
}
