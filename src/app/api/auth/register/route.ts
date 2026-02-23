import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { RegisterSchema } from '@/lib/schemas'
import { limiters, getClientIp } from '@/lib/rateLimit'
import { authLogger } from '@/lib/logger'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // Rate limit: 5 registrations per 15 minutes per IP
  const rl = limiters.register(ip)
  if (!rl.success) {
    authLogger.warn('Register rate limit hit', { ip })
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    const existing = await prisma.customer.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(data.password, 12)
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: hashed,
        whatsappOptIn: false,
      } as any,
      select: { id: true, name: true, email: true },
    })

    authLogger.info('Customer registered', { customerId: customer.id, email: customer.email })
    return NextResponse.json({ success: true, customer })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    authLogger.error('Register error', { ip, error: String(err) })
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
