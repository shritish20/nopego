import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function PATCH(req: NextRequest, { params }: { params: { id:
string } }) {
const auth = await requireAdmin()
if (auth.response) return auth.response
const { isPublished } = await req.json()
const review = await prisma.review.update({ where: { id: params.id },
data: { isPublished } })
return NextResponse.json(review)
}