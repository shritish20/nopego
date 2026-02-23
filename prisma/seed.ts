import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Nopego database...')

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nopego.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Nopego@2025!'
  
  // Dynamically hash the password so it works with NextAuth
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { 
      password: hashedPassword // Ensures password updates if you change it in the future
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
    },
  })
  console.log('✅ Admin created:', adminEmail)

  // ─── Categories ───────────────────────────────────────────────────────────
  const sneakers = await prisma.category.upsert({
    where: { slug: 'sneakers' },
    update: {},
    create: {
      name: 'Sneakers & Casual',
      slug: 'sneakers',
      description: 'Street-ready casual shoes for everyday use',
      isActive: true,
      sortOrder: 1,
    },
  })

  const sports = await prisma.category.upsert({
    where: { slug: 'sports' },
    update: {},
    create: {
      name: 'Sports & Running',
      slug: 'sports',
      description: 'Performance sports footwear built for Indian conditions',
      isActive: true,
      sortOrder: 2,
    },
  })

  console.log('✅ Categories created')

  // ─── Products ─────────────────────────────────────────────────────────────

  // Product 1: Street Runner White
  const streetRunnerWhiteImages = [
    '/products/ng1-white/sole.png',
    '/products/ng1-white/side.png',
    '/products/ng1-white/collar.png',
    '/products/ng1-white/strap.png'
  ]

  const streetRunnerWhite = await prisma.product.upsert({
    where: { slug: 'nopego-street-runner-white' },
    update: {
      images: streetRunnerWhiteImages // Ensures empty arrays get overwritten
    },
    create: {
      name: 'Street Runner White',
      slug: 'nopego-street-runner-white',
      description:
        'Our most popular everyday sneaker. Lightweight mesh upper with cushioned sole — perfect for college, work, or weekend adventures. Designed with Indian foot width in mind.',
      material: 'Mesh upper, Rubber sole, EVA midsole',
      careInstructions: 'Wipe clean with damp cloth. Air dry. Do not machine wash.',
      categoryId: sneakers.id,
      basePrice: 1999,
      discountedPrice: 1499,
      images: streetRunnerWhiteImages,
      tags: ['bestseller', 'everyday', 'lightweight'],
      isFeatured: true,
      isActive: true,
      metaTitle: 'Street Runner White Sneakers India | Nopego',
      metaDescription: 'Lightweight white sneakers made for India. Shop Nopego Street Runner. Free shipping above ₹999.',
    },
  })

  const srWhiteVariants = [
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
  ]

  for (const v of srWhiteVariants) {
    await prisma.variant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: streetRunnerWhite.id, ...v, lowStockAt: 3 },
    })
  }

  // Product 2: Pace Runner
  const paceRunnerImages = [
    '/products/ng1-black/sole.png',
    '/products/ng1-black/side.png',
    '/products/ng1-black/collar.png',
    '/products/ng1-black/strap.png'
  ]

  const paceRunner = await prisma.product.upsert({
    where: { slug: 'nopego-pace-runner-black' },
    update: {
      images: paceRunnerImages
    },
    create: {
      name: 'Pace Runner',
      slug: 'nopego-pace-runner-black',
      description:
        'Built for the track and the street. High-grip rubber sole with breathable knit upper. Handles Indian summer heat like a champ.',
      material: 'Knit upper, High-grip rubber sole, Memory foam insole',
      careInstructions: 'Remove insoles and wash separately. Air dry only.',
      categoryId: sports.id,
      basePrice: 2499,
      discountedPrice: 1999,
      images: paceRunnerImages,
      tags: ['running', 'sports', 'performance'],
      isFeatured: true,
      isActive: true,
      metaTitle: 'Pace Runner Sports Shoes India | Nopego',
      metaDescription: 'High performance sports shoes built for Indian conditions. Shop Nopego Pace Runner.',
    },
  })

  const prVariants = [
    { size: 'UK6',  color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK6',  stock: 10 },
    { size: 'UK7',  color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK7',  stock: 14 },
    { size: 'UK8',  color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK8',  stock: 18 },
    { size: 'UK9',  color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK9',  stock: 12 },
    { size: 'UK10', color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK10', stock: 8  },
    { size: 'UK11', color: 'Black/Orange', colorHex: '#FF5A00', sku: 'NPG-PR-BO-UK11', stock: 5  },
    { size: 'UK6',  color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK6',  stock: 8  },
    { size: 'UK7',  color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK7',  stock: 10 },
    { size: 'UK8',  color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK8',  stock: 13 },
    { size: 'UK9',  color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK9',  stock: 9  },
    { size: 'UK10', color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK10', stock: 6  },
    { size: 'UK11', color: 'All Black',    colorHex: '#1A1A1A', sku: 'NPG-PR-AB-UK11', stock: 3  },
  ]

  for (const v of prVariants) {
    await prisma.variant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: paceRunner.id, ...v, lowStockAt: 3 },
    })
  }

  // Product 3: Urban Edge
  const urbanEdgeImages = [
    '/products/ng1-grey/sole.png',
    '/products/ng1-grey/side.png',
    '/products/ng1-grey/collar.png',
    '/products/ng1-grey/strap.png'
  ]

  const urbanEdge = await prisma.product.upsert({
    where: { slug: 'nopego-urban-edge-grey' },
    update: {
      images: urbanEdgeImages
    },
    create: {
      name: 'Urban Edge',
      slug: 'nopego-urban-edge-grey',
      description:
        'The everyday sneaker reimagined. Premium suede-look upper with ortho-friendly insole. From office to evening, one shoe does it all.',
      material: 'Synthetic suede upper, Ortho insole, Flex rubber sole',
      careInstructions: 'Wipe with dry cloth only. Do not soak.',
      categoryId: sneakers.id,
      basePrice: 2299,
      discountedPrice: 1799,
      images: urbanEdgeImages,
      tags: ['premium', 'casual', 'office'],
      isFeatured: true,
      isActive: true,
      metaTitle: 'Urban Edge Premium Sneakers India | Nopego',
      metaDescription: 'Premium everyday sneakers at honest Indian prices. Shop Nopego Urban Edge.',
    },
  })

  const ueVariants = [
    { size: 'UK6',  color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK6',  stock: 8  },
    { size: 'UK7',  color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK7',  stock: 12 },
    { size: 'UK8',  color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK8',  stock: 15 },
    { size: 'UK9',  color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK9',  stock: 10 },
    { size: 'UK10', color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK10', stock: 7  },
    { size: 'UK11', color: 'Stone Grey',    colorHex: '#8B8B8B', sku: 'NPG-UE-GRY-UK11', stock: 4  },
    { size: 'UK6',  color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK6',  stock: 6  },
    { size: 'UK7',  color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK7',  stock: 9  },
    { size: 'UK8',  color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK8',  stock: 12 },
    { size: 'UK9',  color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK9',  stock: 8  },
    { size: 'UK10', color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK10', stock: 5  },
    { size: 'UK11', color: 'Midnight Black', colorHex: '#1A1A1A', sku: 'NPG-UE-BLK-UK11', stock: 2  },
  ]

  for (const v of ueVariants) {
    await prisma.variant.upsert({
      where: { sku: v.sku },
      update: {},
      create: { productId: urbanEdge.id, ...v, lowStockAt: 3 },
    })
  }

  console.log('✅ Products and variants created')

  // ─── Coupons ──────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderValue: 999,
      maxUses: 1000,
      usedCount: 0,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'SPORT40' },
    update: {},
    create: {
      code: 'SPORT40',
      discountType: 'PERCENT',
      discountValue: 40,
      minOrderValue: 1500,
      maxUses: 500,
      usedCount: 0,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: 'FLAT200' },
    update: {},
    create: {
      code: 'FLAT200',
      discountType: 'FLAT',
      discountValue: 200,
      minOrderValue: 1499,
      maxUses: 300,
      usedCount: 0,
      isActive: true,
    },
  })

  console.log('✅ Coupons created')

  // ─── System Settings ──────────────────────────────────────────────────────
  const settingsMap: Record<string, string> = {
    STORE_NAME:                'Nopego',
    STORE_PHONE:               '+919999999999',
    STORE_EMAIL:               'support@nopego.com',
    FREE_SHIPPING_THRESHOLD:   '999',
    SHIPPING_CHARGE:           '49',
    COD_MIN_ORDER:             '299',
    COD_ENABLED:               'true',
    INSTAGRAM_HANDLE:          '@nopego',
    WHATSAPP_NUMBER:           '919999999999',
    LOW_STOCK_THRESHOLD:       '3',
    RETURN_WINDOW_DAYS:        '7',
    ANNOUNCEMENT_TEXT:         'FREE SHIPPING above ₹999 · 7-Day Easy Returns · COD Available',
  }

  for (const [key, value] of Object.entries(settingsMap)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    })
  }

  console.log('✅ System settings seeded')

  console.log('\n🎉 Nopego database seeded successfully!')
  console.log(`   Admin Email    : ${adminEmail}`)
  console.log(`   Admin Password : ${adminPassword}`)
  console.log(`   ⚠️  Change the password immediately after first login!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
