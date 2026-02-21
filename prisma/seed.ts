import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Nopego database...')

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@nopego.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@nopego.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log('✅ Admin created')

  const sneakers = await prisma.category.upsert({
    where: { slug: 'sneakers' },
    update: {},
    create: { name: 'Sneakers & Casual', slug: 'sneakers', description: 'Street-ready casual shoes', sortOrder: 1 },
  })
  const sports = await prisma.category.upsert({
    where: { slug: 'sports' },
    update: {},
    create: { name: 'Sports & Running', slug: 'sports', description: 'Performance sports footwear', sortOrder: 2 },
  })
  console.log('✅ Categories created')

  await prisma.product.upsert({
    where: { slug: 'nopego-street-runner-white' },
    update: {},
    create: {
      name: 'Street Runner White',
      slug: 'nopego-street-runner-white',
      description: 'Our most popular everyday sneaker. Lightweight mesh upper with cushioned sole — perfect for college, work, or weekend adventures. Designed with Indian foot width in mind.',
      material: 'Mesh upper, Rubber sole, EVA midsole',
      careInstructions: 'Wipe clean with damp cloth. Air dry. Do not machine wash.',
      categoryId: sneakers.id,
      basePrice: 1999,
      discountedPrice: 1499,
      images: [],
      tags: ['bestseller', 'everyday', 'lightweight'],
      isFeatured: true,
      metaTitle: 'Street Runner White Sneakers India | Nopego',
      metaDescription: 'Lightweight white sneakers made for India. Shop Nopego Street Runner. Free shipping above ₹999.',
      variants: {
        create: [
          { size: 'UK6',  color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK6',  stock: 10 },
          { size: 'UK7',  color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK7',  stock: 15 },
          { size: 'UK8',  color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK8',  stock: 20 },
          { size: 'UK9',  color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK9',  stock: 12 },
          { size: 'UK10', color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK10', stock: 8  },
          { size: 'UK11', color: 'White', colorHex: '#FFFFFF', sku: 'NPG-SR-WHT-UK11', stock: 5  },
          { size: 'UK6',  color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK6',  stock: 8  },
          { size: 'UK7',  color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK7',  stock: 12 },
          { size: 'UK8',  color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK8',  stock: 18 },
          { size: 'UK9',  color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK9',  stock: 10 },
          { size: 'UK10', color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK10', stock: 6  },
          { size: 'UK11', color: 'Black', colorHex: '#1A1A1A', sku: 'NPG-SR-BLK-UK11', stock: 3  },
        ],
      },
    },
  })

  await prisma.product.upsert({
    where: { slug: 'nopego-pace-runner-black' },
    update: {},
    create: {
      name: 'Pace Runner',
      slug: 'nopego-pace-runner-black',
      description: 'Built for the track and the street. High-grip rubber sole with breathable knit upper. Handles Indian summer heat like a champ.',
      material: 'Knit upper, High-grip rubber sole, Memory foam insole',
      careInstructions: 'Remove insoles and wash separately. Air dry only.',
      categoryId: sports.id,
      basePrice: 2499,
      discountedPrice: 1999,
      images: [],
      tags: ['running', 'sports', 'performance'],
      isFeatured: true,
      variants: {
        create: [
          { size: 'UK6',  color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK6',  stock: 10 },
          { size: 'UK7',  color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK7',  stock: 14 },
          { size: 'UK8',  color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK8',  stock: 18 },
          { size: 'UK9',  color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK9',  stock: 12 },
          { size: 'UK10', color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK10', stock: 8  },
          { size: 'UK11', color: 'Black/Orange', colorHex: '#1A1A1A', sku: 'NPG-PR-BO-UK11', stock: 5  },
          { size: 'UK6',  color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK6',  stock: 8  },
          { size: 'UK7',  color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK7',  stock: 10 },
          { size: 'UK8',  color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK8',  stock: 13 },
          { size: 'UK9',  color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK9',  stock: 9  },
          { size: 'UK10', color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK10', stock: 6  },
          { size: 'UK11', color: 'Navy/White',   colorHex: '#1B3A6B', sku: 'NPG-PR-NW-UK11', stock: 3  },
        ],
      },
    },
  })
  console.log('✅ Products created')

  const defaults: Record<string, string> = {
    STORE_NAME: 'Nopego',
    STORE_PHONE: '+919999999999',
    STORE_EMAIL: 'support@nopego.com',
    FREE_SHIPPING_THRESHOLD: '999',
    SHIPPING_CHARGE: '49',
    COD_MIN_ORDER: '299',
    COD_ENABLED: 'true',
    INSTAGRAM_HANDLE: '@nopego',
    WHATSAPP_NUMBER: '919999999999',
    LOW_STOCK_THRESHOLD: '3',
  }
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } })
  }
  console.log('✅ Settings seeded')
  console.log('\n🎉 Nopego database seeded!')
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@nopego.com'}`)
  console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'} (CHANGE THIS!)`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
