import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'orders@nopego.com'
const BATCH_SIZE = 50

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    customerName: string
    orderNumber: string
    items: { name: string; size: string; color: string; quantity: number; price: number }[]
    subtotal: number
    shipping: number
    total: number
    address: string
  },
) {
  const itemRows = data.items
    .map((i) => `<tr><td style="padding:8px 0">${i.name} (${i.color}, ${i.size}) x${i.quantity}</td><td style="padding:8px 0;text-align:right">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td></tr>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed — ${data.orderNumber} | Nopego`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#FF5C00;font-size:28px;margin:0 0 8px">ORDER CONFIRMED ✅</h1>
        <p style="color:#a0a0a0;margin:0 0 24px">Hi ${data.customerName}, thank you for your order!</p>
        <p style="background:#161616;padding:12px 16px;border-radius:8px;margin:0 0 24px">
          Order: <strong style="color:#FF5C00">${data.orderNumber}</strong>
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          ${itemRows}
          <tr style="border-top:1px solid #222">
            <td style="padding:8px 0;color:#a0a0a0">Shipping</td>
            <td style="padding:8px 0;text-align:right;color:#a0a0a0">${data.shipping === 0 ? 'FREE 🎉' : '₹' + data.shipping}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:bold">Total</td>
            <td style="padding:8px 0;text-align:right;font-weight:bold;color:#FF5C00">₹${data.total.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        <p style="color:#a0a0a0;font-size:14px">Delivering to: ${data.address}</p>
        <p style="color:#a0a0a0;font-size:14px">We'll WhatsApp you when your order ships. 🚀</p>
      </div>
    `,
  })
}

export async function sendCampaignEmail(to: string[], subject: string, body: string) {
  const results: PromiseSettledResult<unknown>[] = []
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    const batch = to.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.allSettled(
      batch.map((email) => resend.emails.send({ from: FROM, to: email, subject, html: body })),
    )
    results.push(...batchResults)
    if (i + BATCH_SIZE < to.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  return results
}
