import { NextRequest, NextResponse } from 'next/server'
import { getChatReply } from '@/lib/claude'
import { ChatSchema } from '@/lib/schemas'
import { limiters, getClientIp } from '@/lib/rateLimit'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  const rl = limiters.chat(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = await req.json()
    const { messages } = ChatSchema.parse(body)
    const reply = await getChatReply(messages)
    return NextResponse.json({ reply })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[Chat API] Error:', err)
    return NextResponse.json({
      reply: 'Sorry, I am having trouble right now. Please try again in a moment.',
    })
  }
}
