import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function buildSystemPrompt(): Promise<string> {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, category: true },
      take: 20,
    }),
    prisma.systemSetting.findMany(),
  ])
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const productSummary = products
    .map((p) => {
      const availableSizes = [...new Set(p.variants.filter((v) => v.stock > 0).map((v) => v.size))].join(', ')
      return `- ${p.name}: ₹${p.discountedPrice ?? p.basePrice} (${p.category.name}). Sizes: ${availableSizes || 'Out of stock'}`
    })
    .join('\n')

  return `You are the Nopego customer support bot. Nopego is an Indian D2C sneaker brand.

Store info:
- Free shipping above ₹${settingsMap.FREE_SHIPPING_THRESHOLD ?? '999'}
- Shipping charge: ₹${settingsMap.SHIPPING_CHARGE ?? '49'}
- COD available for orders above ₹${settingsMap.COD_MIN_ORDER ?? '299'}
- WhatsApp support: ${settingsMap.STORE_PHONE ?? '+919999999999'}

Current products:
${productSummary}

Guidelines:
- Answer questions about sizing, products, shipping, returns, and orders
- Be friendly, brief, and helpful
- For complex issues, offer WhatsApp support
- Never make up product details or prices not listed above
- Respond in the language the customer uses (English or Hindi)`
}

export async function chatWithBot(
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ message: string; shouldEscalate: boolean }> {
  const systemPrompt = await buildSystemPrompt()
  const response = await client.messages.create({
    model: 'claude-haiku-20240307',
    max_tokens: 500,
    system: systemPrompt,
    messages,
  })
  const message = response.content[0].type === 'text' ? response.content[0].text : ''
  const shouldEscalate = message.toLowerCase().includes('whatsapp') || message.toLowerCase().includes('human')
  return { message, shouldEscalate }
}
