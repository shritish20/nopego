import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:     process.env.CLOUDINARY_API_KEY!,
  api_secret:  process.env.CLOUDINARY_API_SECRET!,
  secure: true,
})

export async function POST(req: NextRequest) {
  // Validate env vars are present
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error('Cloudinary env vars missing')
    return NextResponse.json(
      { error: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your .env' },
      { status: 500 }
    )
  }

  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: 'nopego/products',
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (err: any) {
    console.error('Cloudinary upload error:', err)
    return NextResponse.json(
      { error: err?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
