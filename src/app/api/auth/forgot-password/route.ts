import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const customer = await prisma.customer.findUnique({ where: { email } })
    // Always return success even if email not found (security best practice)
    if (!customer) {
      return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
    }

    // Generate a secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in SystemSetting as key-value (quick approach without new migration)
    await prisma.systemSetting.upsert({
      where: { key: 'reset_' + token },
      update: { value: JSON.stringify({ email, expiresAt: expiresAt.toISOString() }) },
      create: { key: 'reset_' + token, value: JSON.stringify({ email, expiresAt: expiresAt.toISOString() }) },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    // Send email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendEmail } = await import('@/lib/email')
        await sendEmail({
          to: email,
          subject: 'Reset your Nopego password',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0B1120;color:#fff;padding:32px;border-radius:8px;">
              <h2 style="font-size:28px;letter-spacing:4px;margin-bottom:8px;">NOPEGO</h2>
              <p style="color:#94A3B8;font-size:13px;margin-bottom:24px;">Password Reset Request</p>
              <p style="font-size:15px;margin-bottom:24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}" style="display:inline-block;background:#FF5A00;color:#fff;padding:14px 28px;font-size:14px;font-weight:600;text-decoration:none;border-radius:4px;">
                Reset Password
              </a>
              <p style="color:#64748B;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
              <p style="color:#64748B;font-size:11px;">Or copy this link: ${resetUrl}</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Email send error:', emailErr)
      }
    }

    console.log('[Password Reset] Token for', email, ':', resetUrl)

    return NextResponse.json({ success: true, message: 'If this email exists, a reset link has been sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
