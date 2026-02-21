import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { sendBroadcast } from '@/lib/whatsapp'
import { sendCampaignEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { type, segment, message, subject, body } = await req.json()

  const customers = await prisma.customer.findMany({
    where: {
      ...(segment === 'buyers' && { totalOrders: { gt: 0 } }),
      ...(segment === 'non-buyers' && { totalOrders: 0 }),
      ...(segment === 'repeat' && { totalOrders: { gte: 2 } }),
      ...(type === 'whatsapp' && { whatsappOptIn: true, phone: { not: null } }),
    },
  })

  if (type === 'whatsapp') {
    const phones = customers.map((c) => c.phone!).filter(Boolean)
    const results = await sendBroadcast(phones, message)
    const sent = results.filter((r) => r.success).length
    return NextResponse.json({ sent, failed: phones.length - sent, total: phones.length })
  }

  if (type === 'email') {
    const emails = customers.map((c) => c.email)
    await sendCampaignEmail(emails, subject, body)
    return NextResponse.json({ sent: emails.length })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
