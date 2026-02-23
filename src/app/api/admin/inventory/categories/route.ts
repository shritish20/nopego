import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function GET() {
const auth = await requireAdmin()
if (auth.response) return auth.response
const categories = await prisma.category.findMany({
where: { isActive: true },
orderBy: { sortOrder: 'asc' },
})
return NextResponse.json({ categories })
}
export async function POST(req: NextRequest) {
const auth = await requireAdmin()
if (auth.response) return auth.response
const { name, slug, description } = await req.json()
const category = await prisma.category.create({ data: { name, slug,
description } })
return NextResponse.json(category, { status: 201 })
}