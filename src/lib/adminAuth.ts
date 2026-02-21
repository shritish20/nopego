import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }
  return { response: null, session }
}
