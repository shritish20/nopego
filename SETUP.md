# 🚀 Nopego — Production Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL (Supabase recommended)
- Cloudinary account
- Razorpay account

---

## Step 1: Clone & Install

```bash
npm install
```

---

## Step 2: Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → **Transaction pooler** URL (port 6543) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL e.g. `https://nopego.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard |
| `RESEND_API_KEY` | resend.com |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

---

## Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma migrate deploy

# Seed initial data (admin + products + settings)
npx prisma db seed
```

**Default admin credentials (change immediately!):**
- Email: `admin@nopego.com`
- Password: `Nopego@2025!`

---

## Step 4: Build & Start

```bash
npm run build
npm start
```

---

## Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy `Cloud Name`, `API Key`, `API Secret`
3. Paste into `.env`
4. Upload works immediately from Admin → Inventory

---

## Supabase Connection Pooling

Use the **Transaction pooler** URL (port **6543**), NOT the direct connection.

Format:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

This prevents `MaxClientsInSessionMode` errors.

---

## Admin Panel

Access at: `https://yourdomain.com/admin`

---

## Important URLs

| URL | Description |
|-----|-------------|
| `/admin` | Admin dashboard |
| `/admin/inventory` | Manage products |
| `/admin/orders` | Manage orders |
| `/sneakers` | Sneakers collection |
| `/sports` | Sports collection |
| `/checkout` | Checkout |
| `/track` | Order tracking |
