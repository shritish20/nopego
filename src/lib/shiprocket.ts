import axios from 'axios'

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external'
let authToken: string | null = null
let tokenExpiry: Date | null = null

async function getToken(): Promise<string> {
  if (authToken && tokenExpiry && new Date() < tokenExpiry) return authToken
  const res = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  })
  authToken = res.data.token
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
  return authToken!
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function createShipment(order: {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: { line1: string; city: string; state: string; pincode: string }
  items: { name: string; sku: string; units: number; sellingPrice: number }[]
  paymentMethod: string
  subTotal: number
  total: number
}) {
  const token = await getToken()
  const res = await axios.post(
    `${SHIPROCKET_BASE}/orders/create/adhoc`,
    {
      order_id: order.orderNumber,
      order_date: order.orderDate,
      pickup_location: 'Primary',
      billing_customer_name: order.customerName,
      billing_last_name: '',
      billing_address: order.shippingAddress.line1,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.customerEmail,
      billing_phone: order.customerPhone,
      shipping_is_billing: true,
      order_items: order.items.map((i) => ({
        name: i.name,
        sku: i.sku,
        units: i.units,
        selling_price: i.sellingPrice,
      })),
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.subTotal,
      length: 30,
      breadth: 20,
      height: 12,
      weight: 0.8,
    },
    { headers: authHeaders(token) },
  )
  return res.data
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
  const { WAREHOUSE_NAME, WAREHOUSE_PHONE, WAREHOUSE_ADDRESS, WAREHOUSE_CITY, WAREHOUSE_STATE, WAREHOUSE_PINCODE } = process.env
  if (!WAREHOUSE_NAME || !WAREHOUSE_PHONE || !WAREHOUSE_ADDRESS || !WAREHOUSE_CITY || !WAREHOUSE_STATE || !WAREHOUSE_PINCODE) {
    throw new Error('Missing WAREHOUSE_* environment variables. Set them in .env before approving returns.')
  }
  const token = await getToken()
  const res = await axios.post(
    `${SHIPROCKET_BASE}/orders/create/return`,
    {
      order_id: data.orderId,
      pickup_customer_name: data.customerName,
      pickup_phone: data.customerPhone,
      pickup_address: data.address,
      pickup_city: data.city,
      pickup_state: data.state,
      pickup_country: 'India',
      pickup_pincode: data.pincode,
      shipping_customer_name: WAREHOUSE_NAME,
      shipping_phone: WAREHOUSE_PHONE,
      shipping_address: WAREHOUSE_ADDRESS,
      shipping_city: WAREHOUSE_CITY,
      shipping_state: WAREHOUSE_STATE,
      shipping_country: 'India',
      shipping_pincode: WAREHOUSE_PINCODE,
    },
    { headers: authHeaders(token) },
  )
  return res.data
}
