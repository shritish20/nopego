import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: NextRequest) {
const { searchParams } = new URL(req.url)
const category = searchParams.get('category')
const featured = searchParams.get('featured')
const limit = parseInt(searchParams.get('limit') || '20')
const page = parseInt(searchParams.get('page') || '1')
const where: any = { isActive: true }
if (category) where.category = { slug: category }
if (featured === 'true') where.isFeatured = true
const [products, total] = await Promise.all([
prisma.product.findMany({
where, include: { category: true, variants: true, reviews: { select: {
rating: true } } },
take: limit, skip: (page - 1) * limit, orderBy: { createdAt: 'desc' }
}),
prisma.product.count({ where })
])
return NextResponse.json({ products, total, pages: Math.ceil(total /
limit), page })
}