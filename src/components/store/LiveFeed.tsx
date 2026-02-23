'use client'
import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

/**
 * SoldNotification — auto-popup REMOVED per handoff rule:
 * "No popup on page load / after 3 seconds. Search and remove setTimeout."
 * Component kept as a named export so existing imports don't break.
 * Can be wired to a manual trigger in future if needed.
 */
export function SoldNotification() {
  return null
}

export function ViewingCount({ productId }: { productId?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const base = Math.floor(Math.random() * 12) + 4
    setCount(base)
    const interval = setInterval(() => {
      setCount((c) => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(2, Math.min(25, c + delta))
      })
    }, 8000 + Math.random() * 7000)
    return () => clearInterval(interval)
  }, [productId])

  if (count === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-xs text-brand-muted">
      <Eye size={13} className="text-[#FF5A00]" />
      <span>
        <span className="text-white font-medium">{count} people</span> viewing this right now
      </span>
    </div>
  )
}

export function CountdownTimer({ endsAt, label = 'Sale ends in' }: { endsAt?: Date; label?: string }) {
  const target = endsAt || (() => {
    const d = new Date()
    d.setHours(23, 59, 59, 0)
    return d
  })()

  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const calc = () => {
      const diff = Math.max(0, target.getTime() - Date.now())
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ h, m, s })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [target])

  if (!mounted) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-brand-muted">{label}:</span>
      <div className="flex items-center gap-1">
        {[
          { val: pad(timeLeft.h), label: 'H' },
          { val: pad(timeLeft.m), label: 'M' },
          { val: pad(timeLeft.s), label: 'S' },
        ].map(({ val, label: l }, i) => (
          <span key={l} className="flex items-center gap-1">
            <span className="bg-[#FF5A00] text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded min-w-[26px] text-center">
              {val}
            </span>
            <span className="text-brand-subtle text-xs">{l}</span>
            {i < 2 && <span className="text-[#FF5A00] font-bold text-sm">:</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
