'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('customer-login', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password. Please try again.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-5xl text-white tracking-widest hover:text-[#FF5A00] transition-colors">NOPEGO</span>
          </Link>
          <p className="text-brand-gray-text text-sm mt-2">Sign in to your account</p>
        </div>
        <div className="card-brand p-8">
          <h1 className="text-xl font-bold text-white mb-6">Welcome back</h1>
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
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-brand"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="input-brand pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-muted hover:text-white"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs text-[#FF5A00] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button type="submit" className="btn-accent w-full mt-2" disabled={loading}>
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-brand-gray-text text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#FF5A00] hover:text-[#FF7A30] transition-colors font-medium">
              Create one free →
            </Link>
          </p>
        </div>
        <p className="text-center text-brand-gray-muted text-xs mt-5">
          Admin?{' '}
          <Link href="/admin/login" className="hover:text-white transition-colors">Admin login →</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
