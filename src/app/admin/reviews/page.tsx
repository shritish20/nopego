'use client'
import { useEffect, useState } from 'react'
import { Star, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type FilterType = 'PENDING' | 'PUBLISHED' | 'ALL'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-brand-black-border'} />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('PENDING')

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .finally(() => setLoading(false))
  }, [])

  async function updateReview(reviewId: string, isPublished: boolean) {
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished }),
    })
    if (res.ok) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isPublished } : r))
      toast.success(isPublished ? 'Review published' : 'Review hidden')
    } else {
      toast.error('Failed to update review')
    }
  }

  const filtered = reviews.filter(r =>
    filter === 'ALL' ||
    (filter === 'PENDING' ? !r.isPublished : r.isPublished)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-white">REVIEWS</h1>
          <p className="text-brand-gray-muted text-sm mt-0.5">{reviews.length} total reviews</p>
        </div>
        <div className="flex gap-1 bg-brand-black-card border border-brand-black-border rounded p-1">
          {(['PENDING', 'PUBLISHED', 'ALL'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${filter === f ? 'bg-[#FF5A00] text-white' : 'text-brand-gray-muted hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-brand-gray-muted">No reviews in this category</div>
        ) : filtered.map(review => (
          <div key={review.id}
            className={`bg-brand-black-card border rounded p-4 ${!review.isPublished ? 'border-yellow-500/30' : 'border-brand-black-border'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-brand-gray-muted">
                    {review.customer?.name} · {review.product?.name}
                  </span>
                  <span className="text-xs text-brand-gray-muted">
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {review.title && (
                  <p className="text-white text-sm font-medium mb-1">{review.title}</p>
                )}
                <p className="text-brand-gray-text text-sm leading-relaxed">{review.body}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!review.isPublished ? (
                  <button onClick={() => updateReview(review.id, true)}
                    className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-3 py-1.5 text-xs font-medium rounded transition-colors">
                    <CheckCircle size={13} /> Publish
                  </button>
                ) : (
                  <button onClick={() => updateReview(review.id, false)}
                    className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 text-xs font-medium rounded transition-colors">
                    <XCircle size={13} /> Hide
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
