import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nopego.com'
return {
rules: [
{
userAgent: '*',
allow: '/',
disallow: [
'/admin/',
'/api/',
'/checkout',
'/order-confirmed/',
],
},
],
sitemap: `${baseUrl}/sitemap.xml`,
}
}