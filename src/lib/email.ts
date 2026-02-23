import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'orders@nopego.com'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  return resend.emails.send({ from: FROM, to, subject, html })
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    customerName: string
    orderNumber: string
    items: Array<{ name: string; size: string; color: string; quantity: number; price: number }>
    subtotal: number
    shipping: number
    total: number
    address: string
  }
) {
  const itemsHtml = data.items
    .map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #1E293B;color:#94A3B8">${item.name} (${item.color}, ${item.size}) x${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #1E293B;color:#fff;text-align:right">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `)
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0B1120;color:#fff;padding:32px;border-radius:8px;">
      <h1 style="font-size:32px;letter-spacing:4px;margin-bottom:4px;">NOPEGO</h1>
      <p style="color:#94A3B8;font-size:13px;margin-bottom:24px;">Order Confirmation</p>
      <h2 style="font-size:18px;margin-bottom:8px;">Thank you, ${data.customerName}! 👟</h2>
      <p style="color:#94A3B8;margin-bottom:4px;">Order: <strong style="color:#fff">${data.orderNumber}</strong></p>
      <p style="color:#94A3B8;margin-bottom:24px;">We'll start preparing your order right away.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        ${itemsHtml}
        <tr><td style="padding:8px;color:#94A3B8">Subtotal</td><td style="padding:8px;text-align:right;color:#fff">₹${data.subtotal.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:8px;color:#94A3B8">Shipping</td><td style="padding:8px;text-align:right;color:${data.shipping === 0 ? '#22c55e' : '#fff'}">${data.shipping === 0 ? 'FREE' : '₹' + data.shipping}</td></tr>
        <tr style="border-top:2px solid #FF5A00"><td style="padding:8px;font-weight:bold;color:#fff">Total</td><td style="padding:8px;text-align:right;font-weight:bold;color:#FF5A00;font-size:18px;">₹${data.total.toLocaleString('en-IN')}</td></tr>
      </table>
      <p style="color:#94A3B8;font-size:13px;margin-bottom:4px;">Delivering to:</p>
      <p style="color:#fff;font-size:13px;margin-bottom:24px;">${data.address}</p>
      <p style="color:#64748B;font-size:12px;">Questions? WhatsApp us or reply to this email. We're here to help.</p>
      <p style="color:#64748B;font-size:11px;margin-top:16px;">© 2025 Nopego. All rights reserved.</p>
    </div>
  `

  return sendEmail({ to, subject: `Order Confirmed — ${data.orderNumber} | Nopego`, html })
}

export async function sendAbandonedCartEmail(to: string, customerName: string, cartItems: string) {
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0B1120;color:#fff;padding:32px;border-radius:8px;">
      <h1 style="font-size:28px;letter-spacing:4px;margin-bottom:8px;">NOPEGO</h1>
      <p style="color:#94A3B8;font-size:13px;margin-bottom:24px;">You left something behind!</p>
      <h2 style="font-size:18px;margin-bottom:12px;">Hey ${customerName}, your cart misses you 👟</h2>
      <p style="color:#94A3B8;margin-bottom:24px;">You left ${cartItems} in your cart. Complete your order before it sells out!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout" style="display:inline-block;background:#FF5A00;color:#fff;padding:14px 28px;font-size:14px;font-weight:600;text-decoration:none;border-radius:4px;">
        Complete Purchase
      </a>
      <p style="color:#64748B;font-size:12px;margin-top:24px;">Free shipping on orders above ₹999 · 7-day easy returns</p>
    </div>
  `
  return sendEmail({ to, subject: 'You left something in your cart | Nopego', html })
}

export async function sendCampaignEmail(emails: string[], subject: string, body: string) {
  // Send in batches of 50 to avoid rate limits
  const batchSize = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    await Promise.allSettled(
      batch.map(email =>
        sendEmail({
          to: email,
          subject,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0B1120;color:#fff;padding:32px;border-radius:8px;">
              <h1 style="font-size:28px;letter-spacing:4px;margin-bottom:8px;">NOPEGO</h1>
              <div style="color:#E2E8F0;line-height:1.7;white-space:pre-wrap;">${body}</div>
              <hr style="border-color:#1E293B;margin:24px 0;" />
              <p style="color:#64748B;font-size:11px;">You're receiving this because you're a Nopego customer. To unsubscribe, reply with STOP.</p>
            </div>
          `,
        })
      )
    )
    sent += batch.length
  }
  return { sent }
}
