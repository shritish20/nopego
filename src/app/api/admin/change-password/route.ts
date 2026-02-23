import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both passwords required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    const admin = await prisma.admin.findUnique({ where: { id: session.user.id } })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, admin.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
