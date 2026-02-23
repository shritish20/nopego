'use client'
import { useEffect, useState } from 'react'
import { Save, Loader, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const SETTINGS = [
  { key: 'STORE_NAME', label: 'Store Name', description: 'Displayed in emails and receipts', type: 'text' },
  { key: 'STORE_PHONE', label: 'WhatsApp Support Number', description: 'Customers will be directed here for support', type: 'text' },
  { key: 'STORE_EMAIL', label: 'Support Email', description: 'Reply-to address for automated emails', type: 'text' },
  { key: 'FREE_SHIPPING_THRESHOLD', label: 'Free Shipping Above (₹)', description: 'Orders above this amount get free shipping', type: 'number' },
  { key: 'SHIPPING_CHARGE', label: 'Standard Shipping Charge (₹)', description: 'Charged when below free shipping threshold', type: 'number' },
  { key: 'COD_MIN_ORDER', label: 'Minimum COD Order (₹)', description: 'COD not available below this amount', type: 'number' },
  { key: 'COD_ENABLED', label: 'Cash on Delivery', description: 'Allow customers to pay on delivery', type: 'boolean' },
  { key: 'INSTAGRAM_HANDLE', label: 'Instagram Handle', description: 'e.g. @nopego — shown in footer', type: 'text' },
  { key: 'WHATSAPP_NUMBER', label: 'WhatsApp Chat Number (with country code)', description: 'e.g. 919876543210 — for chat bubble', type: 'text' },
  { key: 'LOW_STOCK_THRESHOLD', label: 'Default Low Stock Alert', description: 'Alert when variant stock drops to or below this number', type: 'number' },
]

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => setValues(d.settings || {}))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveSettings() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: values }),
    })
    if (res.ok) toast.success('Settings saved!')
    else toast.error('Failed to save settings')
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setPwSaving(true)
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Password changed successfully!')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } else {
      toast.error(data.error || 'Failed to change password')
    }
    setPwSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Store settings */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-3xl text-white">SETTINGS</h1>
          <button onClick={handleSaveSettings} disabled={saving}
            className="flex items-center gap-2 bg-[#FF5A00] text-white px-5 py-2 text-sm font-medium hover:bg-[#FF7A30] transition-colors disabled:opacity-60">
            {saving ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
        <div className="space-y-3">
          {SETTINGS.map(s => (
            <div key={s.key} className="bg-brand-card border border-brand-border rounded p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{s.label}</p>
                  <p className="text-brand-muted text-xs mt-0.5">{s.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {s.type === 'boolean' ? (
                    <button type="button"
                      onClick={() => setValues(v => ({ ...v, [s.key]: v[s.key] === 'true' ? 'false' : 'true' }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${values[s.key] === 'true' ? 'bg-[#FF5A00]' : 'bg-brand-border'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${values[s.key] === 'true' ? 'translate-x-6' : ''}`} />
                    </button>
                  ) : (
                    <input
                      type={s.type === 'number' ? 'number' : 'text'}
                      value={values[s.key] || ''}
                      onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                      className="input-brand w-52 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div>
        <h2 className="font-display text-2xl text-white mb-5 flex items-center gap-2">
          <Lock size={20} className="text-[#FF5A00]" />
          CHANGE PASSWORD
        </h2>
        <form onSubmit={handleChangePassword} className="bg-brand-card border border-brand-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-brand-muted text-xs tracking-wider mb-1.5">CURRENT PASSWORD</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••" className="input-brand pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-brand-muted text-xs tracking-wider mb-1.5">NEW PASSWORD</label>
            <input type={showPw ? 'text' : 'password'} required minLength={8} value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 8 characters" className="input-brand" />
          </div>
          <div>
            <label className="block text-brand-muted text-xs tracking-wider mb-1.5">CONFIRM NEW PASSWORD</label>
            <input type={showPw ? 'text' : 'password'} required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`input-brand ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}`} />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
            )}
            {confirmPassword && newPassword === confirmPassword && newPassword && (
              <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> Passwords match
              </p>
            )}
          </div>
          <button type="submit"
            disabled={pwSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-[#FF5A00] text-brand-muted hover:text-white px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50">
            {pwSaving ? <Loader size={14} className="animate-spin" /> : <Lock size={14} />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
