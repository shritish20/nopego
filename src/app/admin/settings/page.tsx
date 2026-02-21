'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Loader } from 'lucide-react'

const SETTING_KEYS = [
  { key: 'STORE_NAME', label: 'Store Name', type: 'text' },
  { key: 'STORE_EMAIL', label: 'Support Email', type: 'email' },
  { key: 'STORE_PHONE', label: 'Store Phone', type: 'text' },
  { key: 'FREE_SHIPPING_THRESHOLD', label: 'Free Shipping Above (₹)', type: 'number' },
  { key: 'SHIPPING_CHARGE', label: 'Standard Shipping Charge (₹)', type: 'number' },
  { key: 'COD_MIN_ORDER', label: 'COD Minimum Order (₹)', type: 'number' },
  { key: 'COD_ENABLED', label: 'COD Enabled', type: 'select', options: ['true', 'false'] },
  { key: 'WHATSAPP_NUMBER', label: 'WhatsApp Support Number', type: 'text' },
  { key: 'INSTAGRAM_HANDLE', label: 'Instagram Handle', type: 'text' },
  { key: 'LOW_STOCK_THRESHOLD', label: 'Low Stock Alert Threshold', type: 'number' },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings); setLoading(false) })
  }, [])

  async function saveSettings() {
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    if (res.ok) toast.success('Settings saved')
    else toast.error('Failed to save')
  }

  async function changePassword() {
    if (pwd.next !== pwd.confirm) { toast.error('Passwords do not match'); return }
    if (pwd.next.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setPwdLoading(true)
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
    })
    setPwdLoading(false)
    if (res.ok) {
      toast.success('Password changed successfully')
      setPwd({ current: '', next: '', confirm: '' })
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed to change password')
    }
  }

  if (loading) return <div className="p-8 text-brand-muted">Loading...</div>

  return (
    <div className="p-8 space-y-8">
      <h1 className="font-display text-4xl text-white">Settings</h1>

      <div className="card p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg">Store Configuration</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {SETTING_KEYS.map(({ key, label, type, options }) => (
            <div key={key}>
              <label className="block text-brand-muted text-sm mb-1">{label}</label>
              {type === 'select' ? (
                <select
                  className="input"
                  value={settings[key] ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                >
                  {options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  className="input"
                  type={type}
                  value={settings[key] ?? ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="card p-6 space-y-4 max-w-md">
        <h2 className="text-white font-semibold text-lg">Change Password</h2>
        <input
          className="input"
          type="password"
          placeholder="Current Password"
          value={pwd.current}
          onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
        />
        <input
          className="input"
          type="password"
          placeholder="New Password (min 8 characters)"
          value={pwd.next}
          onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
        />
        <input
          className="input"
          type="password"
          placeholder="Confirm New Password"
          value={pwd.confirm}
          onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
        />
        <button onClick={changePassword} disabled={pwdLoading} className="btn-primary flex items-center gap-2">
          {pwdLoading && <Loader className="w-4 h-4 animate-spin" />}
          {pwdLoading ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </div>
  )
}
