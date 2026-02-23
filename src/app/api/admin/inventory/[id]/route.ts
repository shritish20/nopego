import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
import { sendLowStockAlert } from '@/lib/whatsapp'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      category: true,
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  try {
    const body = await req.json()

    // Stock-only update (inline inventory edit by variant ID)
    if ('stock' in body && Object.keys(body).length === 1) {
      const variant = await prisma.variant.update({
        where: { id: params.id },
        data: { stock: body.stock },
        include: { product: true },
      })

      // Alert admin on low stock
      if (variant.stock <= variant.lowStockAt && variant.stock > 0) {
        const adminPhone = process.env.ADMIN_WHATSAPP_PHONE
        if (adminPhone) {
          sendLowStockAlert(adminPhone, {
            productName: variant.product.name,
            sku: variant.sku,
            stock: variant.stock,
          }).catch(console.error)
        }
      }

      return NextResponse.json(variant)
    }

    // Full product update
    const { variants, ...productData } = body
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...productData,
        ...(variants && {
          variants: { deleteMany: {}, create: variants },
        }),
      },
      include: { variants: true, category: true },
    })

    return NextResponse.json(product)
  } catch (err: any) {
    console.error('[Inventory PATCH] Error:', err)
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (auth.response) return auth.response

  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
