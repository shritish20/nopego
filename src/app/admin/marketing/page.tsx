'use client'
import { useState, useEffect } from 'react'
import { MessageCircle, Mail, Send, Loader } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

type Tab = 'whatsapp' | 'email'

const SEGMENTS = [
  { value: 'ALL', label: 'All opted-in customers' },
  { value: 'BUYERS', label: 'Customers who have bought' },
  { value: 'NON_BUYERS', label: 'Customers who have never bought' },
  { value: 'REPEAT', label: 'Repeat buyers (2+ orders)' },
]

export default function MarketingPage() {
  const [tab, setTab] = useState<Tab>('whatsapp')
  const [waMessage, setWaMessage] = useState('')
  const [waSegment, setWaSegment] = useState('ALL')
  const [waSending, setWaSending] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSegment, setEmailSegment] = useState('ALL')
  const [emailSending, setEmailSending] = useState(false)
  const [lastResult, setLastResult] = useState<{ type: string; sent: number } | null>(null)

  async function sendWhatsApp() {
    if (!waMessage.trim()) { toast.error('Enter a message'); return }
    setWaSending(true)
    try {
      const res = await fetch('/api/admin/marketing/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp', message: waMessage, segment: waSegment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLastResult({ type: 'WhatsApp', sent: data.sent })
      setWaMessage('')
      toast.success(`Sent to ${data.sent} customers!`)
    } catch (err: any) {
      toast.error(err.message || 'Broadcast failed')
    }
    setWaSending(false)
  }

  async function sendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) { toast.error('Subject and body required'); return }
    setEmailSending(true)
    try {
      const res = await fetch('/api/admin/marketing/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', subject: emailSubject, body: emailBody, segment: emailSegment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLastResult({ type: 'Email', sent: data.sent })
      setEmailSubject('')
      setEmailBody('')
      toast.success(`Sent to ${data.sent} customers!`)
    } catch (err: any) {
      toast.error(err.message || 'Email campaign failed')
    }
    setEmailSending(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">MARKETING</h1>
        <p className="text-brand-gray-muted text-sm mt-0.5">Send broadcasts to your customer segments</p>
      </div>

      {lastResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Send size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-medium text-sm">{lastResult.type} broadcast sent!</p>
            <p className="text-green-400/70 text-xs">Delivered to {lastResult.sent} customers</p>
          </div>
          <button onClick={() => setLastResult(null)} className="ml-auto text-green-400/60 hover:text-green-400 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 bg-brand-black-card border border-brand-black-border rounded p-1 mb-6 w-fit">
        <button onClick={() => setTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors ${tab === 'whatsapp' ? 'bg-green-500 text-white' : 'text-brand-gray-muted hover:text-white'}`}>
          <MessageCircle size={15} /> WhatsApp
        </button>
        <button onClick={() => setTab('email')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded transition-colors ${tab === 'email' ? 'bg-[#FF5A00] text-white' : 'text-brand-gray-muted hover:text-white'}`}>
          <Mail size={15} /> Email
        </button>
      </div>

      {/* WhatsApp */}
      {tab === 'whatsapp' && (
        <div className="bg-brand-black-card border border-brand-black-border rounded-lg p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">WhatsApp Broadcast</h2>
              <p className="text-brand-gray-muted text-xs">Only customers who opted in will receive this</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">AUDIENCE SEGMENT</label>
              <select value={waSegment} onChange={e => setWaSegment(e.target.value)} className="input-brand">
                {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">MESSAGE</label>
              <textarea value={waMessage} onChange={e => setWaMessage(e.target.value)}
                rows={5} placeholder="Hey! Check out our latest drop..."
                className="input-brand resize-none" maxLength={1000} />
              <p className="text-brand-gray-muted text-xs mt-1">{waMessage.length}/1000 characters</p>
            </div>
            <button onClick={sendWhatsApp} disabled={waSending || !waMessage.trim()}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50">
              {waSending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              {waSending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      )}

      {/* Email */}
      {tab === 'email' && (
        <div className="bg-brand-black-card border border-brand-black-border rounded-lg p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FF5A00]/10 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-[#FF5A00]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Email Campaign</h2>
              <p className="text-brand-gray-muted text-xs">Sent via your configured email service</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">AUDIENCE SEGMENT</label>
              <select value={emailSegment} onChange={e => setEmailSegment(e.target.value)} className="input-brand">
                {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">SUBJECT LINE</label>
              <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                placeholder="New Collection Just Dropped 🔥" className="input-brand" maxLength={100} />
            </div>
            <div>
              <label className="block text-brand-gray-muted text-xs tracking-wider mb-1.5">EMAIL BODY</label>
              <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
                rows={8} placeholder="Write your email content here..."
                className="input-brand resize-none" />
            </div>
            <button onClick={sendEmail} disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
              className="flex items-center gap-2 bg-[#FF5A00] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#FF7A30] transition-colors disabled:opacity-50">
              {emailSending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              {emailSending ? 'Sending...' : 'Send Campaign'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
