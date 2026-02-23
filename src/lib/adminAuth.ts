import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

/**
 * Call this at the top of every admin API route handler.
 * Verifies both that a session exists AND that the role is 'admin'.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'admin') {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { session, response: null }
}
