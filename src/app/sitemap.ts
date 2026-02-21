import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nopego.com'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/sneakers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/sports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/sale`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
