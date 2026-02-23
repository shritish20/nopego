'use client'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to Sentry if available — dynamically imported so it doesn't break if Sentry isn't installed
    import('@sentry/nextjs')
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {})
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#0B1120',
          color: '#fff',
          fontFamily: 'sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#FF5A00',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
