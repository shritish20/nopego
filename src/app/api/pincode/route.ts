import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pincode = searchParams.get('pincode')
  if (!pincode || pincode.length !== 6) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })
  }
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await res.json()
    if (!data[0] || data[0].Status !== 'Success') {
      return NextResponse.json({ error: 'Pincode not found' }, { status: 404 })
    }
    const postOffice = data[0].PostOffice[0]
    return NextResponse.json({ city: postOffice.District, state: postOffice.State })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pincode data' }, { status: 500 })
  }
}
