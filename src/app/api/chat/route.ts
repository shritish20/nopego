import { NextRequest, NextResponse } from 'next/server'
import { chatWithBot } from '@/lib/claude'

// Rate limiter: max 20 requests per IP per 60 seconds
const rateMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }
  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }
    const result = await chatWithBot(messages)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat service unavailable' }, { status: 500 })
  }
}
