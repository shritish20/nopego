import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, category: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  const data = await req.json()

  // Handle stock-only update (inline editing)
  if (data.variantId && data.stock !== undefined) {
    const variant = await prisma.variant.update({
      where: { id: data.variantId },
      data: { stock: parseInt(data.stock) },
    })
    return NextResponse.json({ variant })
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      material: data.material,
      careInstructions: data.careInstructions,
      categoryId: data.categoryId,
      basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
      discountedPrice: data.discountedPrice ? parseFloat(data.discountedPrice) : null,
      images: data.images,
      tags: data.tags,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
    },
    include: { variants: true, category: true },
  })
  return NextResponse.json({ product })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
  const { response } = await requireAdmin()
  if (response) return response

  await prisma.product.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
