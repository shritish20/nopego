import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'
export async function GET() {
const auth = await requireAdmin()
if (auth.response) return auth.response
const settings = await prisma.systemSetting.findMany()
return NextResponse.json({ settings: Object.fromEntries(settings.map(s =>
[s.key, s.value])) })
}
export async function POST(req: NextRequest) {
const auth = await requireAdmin()
if (auth.response) return auth.response
const { settings } = await req.json()
await Promise.all(
Object.entries(settings).map(([key, value]) =>
prisma.systemSetting.upsert({
where: { key },
update: { value: value as string },
create: { key, value: value as string },
})
)
)
return NextResponse.json({ success: true })
}