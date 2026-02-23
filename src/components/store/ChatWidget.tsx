'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey! 👋 Welcome to Nopego. Looking for the right shoes? Ask me anything about sizing, styles, or your order!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not process that. Please try again.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FF5A00] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF7A30] transition-colors"
        aria-label="Chat with us"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-brand-card border border-brand-border rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '420px' }}>
          {/* Header */}
          <div className="px-4 py-3 bg-[#FF5A00] flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Nopego Support</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#FF5A00] text-white rounded-br-none'
                    : 'bg-brand-bg text-brand-muted border border-brand-border rounded-bl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-brand-bg border border-brand-border px-3 py-2 rounded-lg rounded-bl-none">
                  <Loader size={14} className="text-[#FF5A00] animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-brand-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about shoes, sizes, orders..."
              className="flex-1 bg-brand-bg border border-brand-border text-white text-sm px-3 py-2 rounded outline-none focus:border-[#FF5A00] placeholder-brand-subtle"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-[#FF5A00] rounded flex items-center justify-center hover:bg-[#FF7A30] transition-colors disabled:opacity-50"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
