import Razorpay from 'razorpay'
import crypto from 'crypto'
export const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID!,
key_secret: process.env.RAZORPAY_KEY_SECRET!,
})
// Create a Razorpay order
export async function createRazorpayOrder(amount: number, orderNumber:
string) {
const order = await razorpay.orders.create({
amount: Math.round(amount * 100), // Convert to paise
currency: 'INR',
receipt: orderNumber,
notes: { orderNumber },
})
return order
}
// Verify payment signature (critical for security)
export function verifyRazorpaySignature(
orderId: string,
paymentId: string,
signature: string
): boolean {
const body = orderId + '|' + paymentId
const expectedSignature = crypto
.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
.update(body.toString())
.digest('hex')
return expectedSignature === signature
}
// Initiate refund
export async function initiateRefund(paymentId: string, amount: number,
reason: string) {
const refund = await razorpay.payments.refund(paymentId, {
amount: Math.round(amount * 100),
notes: { reason },
})
return refund}