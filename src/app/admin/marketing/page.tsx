'use client'
import { useState } from 'react'
import { Send, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const SEGMENTS = [
  { value: 'all', label: 'All Subscribers' },
  { value: 'buyers', label: 'All Buyers' },
  { value: 'non-buyers', label: 'Non-Buyers' },
  { value: 'repeat', label: 'Repeat Buyers (2+ orders)' },
]

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<'whatsapp' | 'email'>('whatsapp')
  const [segment, setSegment] = useState('all')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed?: number } | null>(null)

  async function send() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/marketing/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: tab, segment, message, subject, body }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setResult(data)
      toast.success(`Sent to ${data.sent} recipients!`)
      setMessage('')
      setSubject('')
      setBody('')
    } else {
      toast.error('Failed to send broadcast')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-4xl text-white">Marketing</h1>

      <div className="flex gap-2">
        {(['whatsapp', 'email'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === v ? 'bg-brand-orange text-white' : 'border border-brand-border text-brand-muted hover:text-white'}`}
          >
            {v === 'whatsapp' ? 'WhatsApp' : 'Email'}
          </button>
        ))}
      </div>

      <div className="card p-6 space-y-5 max-w-2xl">
        <div>
          <label className="block text-brand-muted text-sm mb-2">Audience Segment</label>
          <select className="input" value={segment} onChange={(e) => setSegment(e.target.value)}>
            {SEGMENTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {tab === 'whatsapp' ? (
          <div>
            <label className="block text-brand-muted text-sm mb-2">Message</label>
            <textarea
              className="input h-36 resize-none"
              placeholder="Type your WhatsApp message... Use *bold* for emphasis."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-brand-muted text-xs mt-1">{message.length} chars · Only sent to customers with WhatsApp opt-in</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-brand-muted text-sm mb-2">Subject</label>
              <input className="input" placeholder="Email subject line" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="block text-brand-muted text-sm mb-2">Body (HTML)</label>
              <textarea
                className="input h-48 resize-none font-mono text-xs"
                placeholder="<p>Your email HTML here...</p>"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </>
        )}

        {result && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-sm">
            <p className="text-green-400 font-semibold">Broadcast sent!</p>
            <p className="text-brand-muted mt-1">Sent: {result.sent} · Failed: {result.failed ?? 0}</p>
          </div>
        )}

        <button
          onClick={send}
          disabled={loading || (tab === 'whatsapp' ? !message : !subject || !body)}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Sending...' : 'Send Broadcast'}
        </button>
      </div>
    </div>
  )
}
