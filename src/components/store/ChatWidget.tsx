'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = { role: 'user' | 'assistant'; content: string }

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! 👟 I\'m Nopego\'s assistant. Ask me about sizes, products, shipping, or anything else!' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.message || 'Sorry, I could not process that.' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-brand-card border border-brand-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-orange/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center">
                  <span className="text-sm">👟</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Nopego Support</p>
                  <p className="text-green-400 text-xs">Online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-orange text-white rounded-br-sm' : 'bg-brand-bg text-brand-muted rounded-bl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-brand-bg px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <Loader className="w-4 h-4 animate-spin text-brand-muted" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-brand-border flex gap-2">
              <input
                className="input text-sm py-2 flex-1"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3 py-2">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/30 z-50 text-white"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  )
}
