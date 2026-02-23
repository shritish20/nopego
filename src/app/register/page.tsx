'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
      await signIn('customer-login', { email: form.email, password: form.password, redirect: false })
      router.push('/account')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
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
          <p className="text-brand-gray-text text-sm mt-2">Create your free account</p>
        </div>
        <div className="card-brand p-8">
          <h1 className="text-xl font-bold text-white mb-6">Join Nopego</h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded mb-5">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Rahul Sharma', required: true },
              { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
              { key: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '9876543210', required: false },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="input-brand" placeholder={f.placeholder} required={f.required} />
              </div>
            ))}
            <div>
              <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-brand pr-10" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-muted hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Confirm Password</label>
              <input type="password" value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                className="input-brand" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-accent w-full mt-2" disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-brand-gray-text text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#FF5A00] hover:text-[#FF7A30] transition-colors font-medium">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
