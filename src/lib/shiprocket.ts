const BASE = 'https://apiv2.shiprocket.in/v1/external'

let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
  })
  const data = await res.json()
  if (!data.token) throw new Error('Shiprocket auth failed')
  cachedToken = data.token
  tokenExpiry = Date.now() + 9 * 60 * 60 * 1000 // 9 hours
  return cachedToken as string
}

export async function createShiprocketOrder(orderData: {
  order_id: string
  order_date: string
  pickup_location: string
  billing_customer_name: string
  billing_last_name: string
  billing_address: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  order_items: Array<{ name: string; sku: string; units: number; selling_price: number }>
  payment_method: string
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}) {
  const token = await getToken()
  const res = await fetch(`${BASE}/orders/create/adhoc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(orderData),
  })
  return res.json()
}

export async function trackShiprocketOrder(shiprocketOrderId: string) {
  const token = await getToken()
  const res = await fetch(`${BASE}/orders/show/${shiprocketOrderId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return res.json()
}

export async function trackByAwb(awb: string) {
  const token = await getToken()
  const res = await fetch(`${BASE}/courier/track/awb/${awb}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  return res.json()
}

export async function cancelShiprocketOrder(ids: number[]) {
  const token = await getToken()
  const res = await fetch(`${BASE}/orders/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ ids }),
  })
  return res.json()
}

export async function scheduleReturnPickup(data: {
  orderId: string
  customerName: string
  customerPhone: string
  address: string
  city: string
  state: string
  pincode: string
}) {
  try {
    const token = await getToken()
    const res = await fetch(`${BASE}/orders/create/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        order_id: data.orderId,
        order_date: new Date().toISOString(),
        channel_id: '',
        pickup_customer_name: data.customerName,
        pickup_phone: data.customerPhone,
        pickup_address: data.address,
        pickup_city: data.city,
        pickup_state: data.state,
        pickup_country: 'India',
        pickup_pincode: data.pincode,
        shipping_customer_name: process.env.WAREHOUSE_NAME || 'Nopego Warehouse',
        shipping_phone: process.env.WAREHOUSE_PHONE || '',
        shipping_address: process.env.WAREHOUSE_ADDRESS || '',
        shipping_city: process.env.WAREHOUSE_CITY || '',
        shipping_state: process.env.WAREHOUSE_STATE || '',
        shipping_country: 'India',
        shipping_pincode: process.env.WAREHOUSE_PINCODE || '',
        order_items: [{ name: 'Return Item', sku: 'RETURN', units: 1, selling_price: 0 }],
        payment_method: 'Prepaid',
        sub_total: 0,
        length: 32,
        breadth: 25,
        height: 14,
        weight: 0.8,
      }),
    })
    return res.json()
  } catch (err) {
    console.error('[Shiprocket] scheduleReturnPickup failed:', err)
    throw err
  }
}
