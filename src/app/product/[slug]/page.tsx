import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductPageClient from './ProductPageClient'
interface Props { params: { slug: string } }
export async function generateMetadata({ params }: Props): Promise<Metadata>
{
const product = await prisma.product.findUnique({ where: { slug:
params.slug } })
if (!product) return { title: 'Product Not Found' }
return {
title: product.metaTitle || product.name,
description: product.metaDescription || product.description.substring(0,
160),
openGraph: { images: product.images[0] ? [{ url: product.images[0] }] :
[] },
}
}
export default async function ProductPage({ params }: Props) {
const product = await prisma.product.findUnique({
where: { slug: params.slug, isActive: true },
include: {
category: true,
variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
reviews: {
where: { isPublished: true },
include: { customer: { select: { name: true } } },
orderBy: { createdAt: 'desc' },
},
},
})
if (!product) notFound()
// Structured data for Google rich results
const structuredData = {
'@context': 'https://schema.org',
'@type': 'Product',
name: product.name,description: product.description,
image: product.images,
brand: { '@type': 'Brand', name: 'Nopego' },
offers: {
'@type': 'Offer',
priceCurrency: 'INR',
price: product.discountedPrice || product.basePrice,
availability: product.variants.some(v => v.stock > 0)
? 'https://schema.org/InStock'
: 'https://schema.org/OutOfStock',
},
aggregateRating: product.reviews.length > 0 ? {
'@type': 'AggregateRating',
ratingValue: (product.reviews.reduce((s, r) => s + r.rating, 0) /
product.reviews.length).toFixed(1),
reviewCount: product.reviews.length,
} : undefined,
}
// Related products
const related = await prisma.product.findMany({
where: { categoryId: product.categoryId, isActive: true, id: { not:
product.id } },
include: { variants: true, reviews: { select: { rating: true } } },
take: 4,
})
return (
<>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html:
JSON.stringify(structuredData) }} />
<ProductPageClient product={product as any} related={related as any}
/>
</>
)
}