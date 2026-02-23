import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { z } from 'zod'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.response) return auth.response
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ products })
}

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  categoryId: z.string().min(1),
  basePrice: z.number().positive(),
  discountedPrice: z.number().positive().optional().nullable(),
  images: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
    colorHex: z.string().optional(),
    sku: z.string(),
    stock: z.number().int().min(0),
    lowStockAt: z.number().int().min(0).default(3),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response
  try {
    const body = await req.json()
    const data = createProductSchema.parse(body)
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists — try a different product name' }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        material: data.material,
        careInstructions: data.careInstructions,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        discountedPrice: data.discountedPrice ?? null,
        images: data.images,
        tags: data.tags,
        isFeatured: data.isFeatured,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        variants: { create: data.variants },
      },
      include: { variants: true, category: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 })
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 })
  }
}
