'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader, Lock, AlertCircle } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in as admin, redirect
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      router.replace('/admin')
    }
  }, [session, status, router])

  // Show error from URL (NextAuth redirects here with ?error=...)
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError === 'CredentialsSignin') {
      setError('Invalid email or password')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    // FIX: use 'admin-login' provider id, not 'credentials'
    const result = await signIn('admin-login', {
      email,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.replace('/admin')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#FF5C00 1px, transparent 1px), linear-gradient(90deg, #FF5C00 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5A00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl tracking-widest text-white">NOPEGO</h1>
          <p className="text-brand-muted text-xs tracking-[0.3em] mt-2">ADMIN PANEL</p>
        </div>

        {/* Card */}
        <div className="bg-brand-card border border-brand-border rounded-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FF5A00]/10 rounded flex items-center justify-center">
              <Lock size={18} className="text-[#FF5A00]" />
            </div>
            <div>
              <h2 className="text-white font-medium">Sign In</h2>
              <p className="text-brand-muted text-xs">Restricted access</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded mb-5">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nopego.com"
                className="input-brand"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-brand-muted text-xs tracking-wider mb-1.5">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-brand pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#FF5A00] text-white py-3 font-display text-lg tracking-widest hover:bg-[#FF7A30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" /> SIGNING IN...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-brand-subtle text-xs mt-6">🔒 Secure admin access only</p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  )
}
