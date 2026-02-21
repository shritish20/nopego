# Nopego — D2C Sneaker Store

Full-stack Next.js 14 e-commerce app for Indian sneaker brand.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **PostgreSQL** via Prisma ORM
- **Razorpay** — payments
- **Shiprocket** — shipping + returns
- **Resend** — transactional emails (batch 50/send)
- **WhatsApp Cloud API** — order updates + marketing
- **Cloudinary** — image uploads
- **Claude AI** — customer support chatbot
- **NextAuth** — admin authentication
- **Zustand** — cart state

## Quick Start

```bash
# 1. Install deps
npm install

# 2. Copy env and fill in all values
cp .env.example .env

# 3. Push schema to DB
npx prisma db push

# 4. Seed database (creates admin + sample products)
npm run db:seed

# 5. Run dev server
npm run dev
```

## Deployment

### Docker (EC2/VPS)
```bash
docker-compose up -d
```

### Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Add all env vars from `.env.example`
4. Deploy

> Note: For Vercel, remove `output: 'standalone'` from `next.config.js`

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string (Supabase recommended) |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` | Payment gateway |
| `SHIPROCKET_EMAIL` + `SHIPROCKET_PASSWORD` | Shipping |
| `WAREHOUSE_*` | Your warehouse address for return pickups |
| `RESEND_API_KEY` | Email (batch sends of 50 with 1s delay) |
| `ANTHROPIC_API_KEY` | AI chatbot |
| `CRON_SECRET` | Protects `/api/cron/*` endpoints |

## Cron Jobs

Set these up in Vercel Cron or any scheduler:

```
GET /api/cron/abandoned-cart    → every 30 min (x-cron-secret: YOUR_SECRET)
GET /api/cron/review-requests   → daily at 10am
```

## Admin Panel

Visit `/admin` — credentials set via `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars (seeded on first run).

**Change your password immediately after first login** via Settings → Change Password.
