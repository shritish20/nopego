import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 1. Customer account pages - redirect to customer login
    if (pathname.startsWith('/account') && !token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // 2. Admin pages - must have admin role, redirect to admin login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }

    // 3. Admin API - must have admin role
    if (pathname.startsWith('/api/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // By returning true here, we bypass NextAuth's default global redirect trap 
      // and force it to use our custom middleware routing logic above.
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*'],
}