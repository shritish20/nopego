import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest) {
const code = req.nextUrl.searchParams.get('code')
if (!code || code.length !== 6) return NextResponse.json({ valid: false })
try {
const res = await fetch(`https://api.postalpincode.in/pincode/${code}`)
const data = await res.json()
if (data[0]?.Status === 'Success') {
const post = data[0].PostOffice[0]
return NextResponse.json({ valid: true, city: post.District, state:
post.State })
}
return NextResponse.json({ valid: false })
} catch {
return NextResponse.json({ valid: false })
}
}