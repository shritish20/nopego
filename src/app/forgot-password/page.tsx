'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-5xl text-white tracking-widest hover:text-[#FF5A00] transition-colors">NOPEGO</span>
          </Link>
          <p className="text-brand-gray-text text-sm mt-2">Password Recovery</p>
        </div>

        <div className="card-brand p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-brand-gray-text text-sm leading-relaxed">
                If an account exists for <span className="text-white">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <p className="text-brand-subtle text-xs mt-4">Didn't get it? Check your spam folder or try again.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-[#FF5A00] text-sm hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF5A00]/10 rounded flex items-center justify-center">
                  <Mail size={18} className="text-[#FF5A00]" />
                </div>
                <div>
                  <h2 className="text-white font-semibold">Forgot password?</h2>
                  <p className="text-brand-gray-text text-xs">Enter your email to receive a reset link</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-brand"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-accent w-full mt-2" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-brand-gray-text text-sm mt-6">
          <Link href="/login" className="flex items-center justify-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
