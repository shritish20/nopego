import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ categories })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const { name, description, image } = await req.json()
  const category = await prisma.category.create({
    data: { name, slug: slugify(name), description, image },
  })
  return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
