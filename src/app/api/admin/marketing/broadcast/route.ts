import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { broadcastWA } from '@/lib/whatsapp'
import { sendCampaignEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const { type, message, subject, body, segment } = await req.json()

    if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })
    if (type === 'whatsapp' && !message) return NextResponse.json({ error: 'message is required' }, { status: 400 })
    if (type === 'email' && (!subject || !body)) return NextResponse.json({ error: 'subject and body are required' }, { status: 400 })

    const customers = await prisma.customer.findMany({
      where: {
        ...(type === 'whatsapp' && { whatsappOptIn: true, phone: { not: null } }),
        ...(segment === 'BUYERS' && { totalOrders: { gt: 0 } }),
        ...(segment === 'NON_BUYERS' && { totalOrders: 0 }),
        ...(segment === 'REPEAT' && { totalOrders: { gt: 1 } }),
      },
    })

    let sent = 0

    if (type === 'whatsapp') {
      const phones = customers.map(c => c.phone!).filter(Boolean)
      const results = await broadcastWA(phones, message)
      sent = results.sent

      await prisma.whatsAppBroadcast.create({
        data: {
          message,
          segment: segment || 'ALL',
          sentCount: sent,
          failedCount: results.failed,
        },
      })
    } else if (type === 'email') {
      const emails = customers.map(c => c.email)
      const results = await sendCampaignEmail(emails, subject, body)
      sent = results.sent

      await prisma.emailCampaign.create({
        data: {
          subject,
          body,
          segment: segment || 'ALL',
          sentCount: sent,
        },
      })
    }

    return NextResponse.json({ success: true, sent })
  } catch (err: any) {
    console.error('[Broadcast] Error:', err)
    return NextResponse.json({ error: err.message || 'Broadcast failed' }, { status: 500 })
  }
}
