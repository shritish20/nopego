import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
  const { response, session } = await requireAdmin()
  if (response || !session) return response

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const admin = await prisma.admin.findUnique({ where: { email: session.user.email! } })
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

  const isValid = await bcrypt.compare(currentPassword, admin.password)
  if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } })
  return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
