import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    // Look up token
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'reset_' + token } })
    if (!setting) return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })

    const { email, expiresAt } = JSON.parse(setting.value)
    if (new Date(expiresAt) < new Date()) {
      await prisma.systemSetting.delete({ where: { key: 'reset_' + token } })
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({ where: { email } })
    if (!customer) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

    const hashed = await bcrypt.hash(password, 10)
    await prisma.customer.update({
      where: { email },
      data: { password: hashed } as any,
    })

    // Delete the token so it can't be reused
    await prisma.systemSetting.delete({ where: { key: 'reset_' + token } })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
