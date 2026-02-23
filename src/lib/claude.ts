import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a helpful customer support assistant for Nopego, an Indian sneakers and sports shoes brand. 

You help customers with:
- Finding the right shoe size (we use UK sizing, refer to our size guide)
- Product recommendations based on their needs
- Order tracking and status questions
- Return and refund policy information
- Shipping information (free above ₹999, 48-hour dispatch)

Key policies:
- Free shipping on orders above ₹999
- Standard delivery 3-5 business days
- 7-day easy returns on unworn products in original packaging
- COD available on orders above ₹299
- Secure payments via UPI, Cards, Wallets, EMI

Size Guide: UK 6 = EU 39 | UK 7 = EU 40 | UK 8 = EU 41 | UK 9 = EU 42 | UK 10 = EU 43 | UK 11 = EU 44

Always be friendly, helpful, and concise. If you cannot answer a question, suggest the customer contact us on WhatsApp for personal assistance.`

export async function getChatReply(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const block = response.content[0]
  if (block.type === 'text') return block.text
  return 'I could not process your request. Please try again.'
}
