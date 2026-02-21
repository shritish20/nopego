'use client'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

type Review = { id: string; rating: number; title?: string | null; body?: string | null; isPublished: boolean; isVerified: boolean; createdAt: string; product: { name: string }; customer: { name: string } }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [tab, setTab] = useState<'pending' | 'published'>('pending')

  useEffect(() => {
    fetch('/api/admin/reviews').then((r) => r.json()).then((d) => setReviews(d.reviews))
  }, [])

  async function toggle(id: string, isPublished: boolean) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished }),
    })
    if (res.ok) {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isPublished } : r))
      toast.success(isPublished ? 'Review published' : 'Review hidden')
    }
  }

  const filtered = reviews.filter((r) => tab === 'pending' ? !r.isPublished : r.isPublished)

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-display text-4xl text-white">Reviews</h1>
      <div className="flex gap-2">
        {[['pending', 'Pending'], ['published', 'Published']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v as 'pending' | 'published')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === v ? 'bg-brand-orange text-white' : 'border border-brand-border text-brand-muted hover:text-white'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-brand-border'}`} />)}
                  {r.isVerified && <span className="badge bg-green-900/30 text-green-400 text-xs">Verified</span>}
                </div>
                <p className="text-brand-orange text-sm font-medium">{r.product.name}</p>
                {r.title && <p className="text-white font-semibold mt-1">{r.title}</p>}
                {r.body && <p className="text-brand-muted text-sm mt-1">{r.body}</p>}
                <p className="text-brand-subtle text-xs mt-2">{r.customer.name} · {formatDate(r.createdAt)}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!r.isPublished ? (
                  <button onClick={() => toggle(r.id, true)} className="btn-primary px-3 py-1.5 text-xs">Publish</button>
                ) : (
                  <button onClick={() => toggle(r.id, false)} className="btn-secondary px-3 py-1.5 text-xs">Hide</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-brand-muted card p-12">No {tab} reviews</div>}
      </div>
    </div>
  )
}
