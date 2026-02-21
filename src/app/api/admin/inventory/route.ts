import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const products = await prisma.product.findMany({
    include: { category: true, variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ products })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const data = await req.json()
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      material: data.material,
      careInstructions: data.careInstructions,
      categoryId: data.categoryId,
      basePrice: parseFloat(data.basePrice),
      discountedPrice: data.discountedPrice ? parseFloat(data.discountedPrice) : null,
      images: data.images ?? [],
      tags: data.tags ?? [],
      isFeatured: data.isFeatured ?? false,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      variants: {
        create: (data.variants ?? []).map((v: { size: string; color: string; colorHex?: string; sku: string; stock: number; lowStockAt?: number }) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          sku: v.sku,
          stock: Number(v.stock) || 0,
          lowStockAt: Number(v.lowStockAt) || 3,
        })),
      },
    },
    include: { variants: true, category: true },
  })
  return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
