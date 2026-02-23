'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package, MapPin, Heart, User, LogOut, ChevronRight,
  Clock, Truck, CheckCircle, XCircle, RotateCcw, AlertCircle,
  ShoppingBag, Plus, Trash2, Edit2, Save, X
} from 'lucide-react'

function formatPrice(n: number) { return `₹${n.toLocaleString('en-IN')}` }

type Tab = 'orders' | 'wishlist' | 'addresses' | 'profile'

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:          { label: 'Pending',          color: 'text-yellow-400', icon: Clock },
  CONFIRMED:        { label: 'Confirmed',         color: 'text-[#FF7A30]',   icon: CheckCircle },
  PROCESSING:       { label: 'Processing',        color: 'text-orange-400', icon: Package },
  SHIPPED:          { label: 'Shipped',           color: 'text-purple-400', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  color: 'text-cyan-400',   icon: Truck },
  DELIVERED:        { label: 'Delivered',         color: 'text-green-400',  icon: CheckCircle },
  CANCELLED:        { label: 'Cancelled',         color: 'text-red-400',    icon: XCircle },
  RETURN_REQUESTED: { label: 'Return Requested',  color: 'text-orange-400', icon: RotateCcw },
  RETURN_APPROVED:  { label: 'Return Approved',   color: 'text-orange-300', icon: RotateCcw },
  REFUNDED:         { label: 'Refunded',          color: 'text-teal-400',   icon: CheckCircle },
}

function AccountContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(tabParam || 'orders')
  const [data, setData] = useState<any>(null)
  const [wishlist, setWishlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })

  useEffect(() => { if (tabParam) setTab(tabParam) }, [tabParam])

  useEffect(() => {
    if (status === 'unauthenticated') { window.location.href = '/login'; return }
    if (status !== 'authenticated') return
    fetch('/api/account')
      .then(r => r.json())
      .then(res => {
        if (res.success) { setData(res.data); setProfileForm({ name: res.data.name, phone: res.data.phone || '' }) }
      })
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => {
    if (tab === 'wishlist' && session) {
      fetch('/api/account/wishlist').then(r => r.json()).then(res => { if (res.success) setWishlist(res.data) })
    }
  }, [tab, session])

  if (loading || status === 'loading') {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>
  }

  async function saveProfile() {
    setSavingProfile(true)
    const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) })
    const d = await res.json()
    if (d.success) { setData((p: any) => ({ ...p, ...d.data })); setEditProfile(false) }
    setSavingProfile(false)
  }

  async function addAddress() {
    const res = await fetch('/api/account/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(addrForm) })
    const d = await res.json()
    if (d.success) {
      setData((p: any) => ({ ...p, addresses: [...(p.addresses || []), d.data] }))
      setShowAddAddress(false)
      setAddrForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
    }
  }

  async function deleteAddress(id: string) {
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' })
    setData((p: any) => ({ ...p, addresses: p.addresses.filter((a: any) => a.id !== id) }))
  }

  async function toggleWishlist(productId: string) {
    await fetch('/api/account/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) })
    setWishlist(w => w.filter(i => i.productId !== productId))
  }

  const TABS = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: data?.totalOrders || 0 },
            { label: 'Total Spent', value: formatPrice(data?.totalSpent || 0) },
            { label: 'Wishlist', value: wishlist.length || data?.wishlistCount || 0 },
          ].map(s => (
            <div key={s.label} className="card-brand p-5 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-brand-gray-text mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0 hidden md:block">
            <div className="card-brand p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF5A00] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{data?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{data?.name}</p>
                  <p className="text-xs text-brand-gray-text truncate">{data?.email}</p>
                </div>
              </div>
            </div>
            <nav className="space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as Tab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all ${
                    tab === t.id ? 'bg-[#FF5A00]/10 text-[#FF5A00] border-l-2 border-[#FF5A00] pl-[14px]' : 'text-brand-gray-text hover:text-white hover:bg-brand-border'
                  }`}>
                  <t.icon size={15} />{t.label}
                </button>
              ))}
              <hr className="border-brand-border my-2" />
              <Link href="/" className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm text-brand-gray-text hover:text-white hover:bg-brand-border transition-all">
                <ShoppingBag size={15} /> Continue Shopping
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={15} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Mobile tab bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-border z-40 flex">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as Tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${tab === t.id ? 'text-[#FF5A00]' : 'text-brand-gray-text'}`}>
                <t.icon size={18} />{t.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Main */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">

            {/* ORDERS */}
            {tab === 'orders' && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white mb-4">Order History</h2>
                {!data?.orders?.length ? (
                  <div className="card-brand p-12 text-center">
                    <ShoppingBag size={40} className="text-brand-border mx-auto mb-3" />
                    <p className="text-brand-gray-text mb-4">No orders yet</p>
                    <Link href="/" className="btn-accent">Start Shopping</Link>
                  </div>
                ) : data.orders.map((order: any) => {
                  const cfg = STATUS_MAP[order.status] || { label: order.status, color: 'text-gray-400', icon: AlertCircle }
                  const Icon = cfg.icon
                  const open = expandedOrder === order.id
                  return (
                    <div key={order.id} className="card-brand overflow-hidden">
                      <button className="w-full text-left p-5 hover:bg-brand-border/10 transition-colors"
                        onClick={() => setExpandedOrder(open ? null : order.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-semibold text-white text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-brand-gray-text mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <span className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                              <Icon size={12} />{cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">{formatPrice(order.total)}</span>
                            <ChevronRight size={16} className={`text-brand-gray-muted transition-transform ${open ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                      </button>
                      {open && (
                        <div className="border-t border-brand-border p-5 space-y-4">
                          <div className="space-y-3">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3">
                                {item.productImage && (
                                  <div className="w-14 h-14 rounded overflow-hidden bg-brand-border flex-shrink-0">
                                    <Image src={item.productImage} alt={item.productName} width={56} height={56} className="object-cover w-full h-full" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{item.productName}</p>
                                  <p className="text-xs text-brand-gray-text">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-white flex-shrink-0">{formatPrice(item.total)}</p>
                              </div>
                            ))}
                          </div>
                          {order.trackingNumber && (
                            <div className="bg-[#FF5A00]/5 border border-[#FF5A00]/20 rounded p-3 flex items-center gap-2">
                              <Truck size={14} className="text-[#FF5A00] flex-shrink-0" />
                              <span className="text-xs text-brand-gray-text">
                                {order.courierName} · Tracking: <span className="text-white font-mono">{order.trackingNumber}</span>
                              </span>
                              <Link href={`/track?order=${order.orderNumber}`} className="ml-auto text-xs text-[#FF5A00] hover:underline">
                                Track →
                              </Link>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-brand-gray-text pt-2 border-t border-brand-border">
                            <span>{order.paymentMethod} · {order.paymentStatus}</span>
                            <span className="font-semibold text-white">Total: {formatPrice(order.total)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* WISHLIST */}
            {tab === 'wishlist' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Saved Items</h2>
                {!wishlist.length ? (
                  <div className="card-brand p-12 text-center">
                    <Heart size={40} className="text-brand-border mx-auto mb-3" />
                    <p className="text-brand-gray-text mb-4">No saved items yet</p>
                    <Link href="/" className="btn-accent">Browse Products</Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlist.map((item: any) => (
                      <div key={item.id} className="card-brand p-4 flex gap-4">
                        {item.product?.images?.[0] && (
                          <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-brand-border">
                            <Image src={item.product.images[0]} alt={item.product.name} width={80} height={80} className="object-cover w-full h-full" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{item.product?.name}</p>
                          <p className="text-xs text-brand-gray-text">{item.product?.category?.name}</p>
                          <p className="text-sm font-bold text-[#FF5A00] mt-1">
                            {formatPrice(item.product?.discountedPrice || item.product?.basePrice || 0)}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Link href={`/product/${item.product?.slug}`} className="btn-accent text-xs px-3 py-1.5">View</Link>
                            <button onClick={() => toggleWishlist(item.productId)}
                              className="p-1.5 text-brand-gray-muted hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES */}
            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Saved Addresses</h2>
                  <button onClick={() => setShowAddAddress(v => !v)} className="btn-accent text-xs px-4 py-2 gap-1.5">
                    <Plus size={14} /> Add Address
                  </button>
                </div>
                {showAddAddress && (
                  <div className="card-brand p-5 space-y-3 mb-4">
                    <h3 className="text-sm font-semibold text-white">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { k: 'name', l: 'Full Name', p: 'Rahul Sharma', cols: 1 },
                        { k: 'phone', l: 'Phone', p: '9876543210', cols: 1 },
                        { k: 'line1', l: 'Address Line 1', p: 'Flat 12, Building Name', cols: 2 },
                        { k: 'line2', l: 'Line 2 (optional)', p: 'Area / Landmark', cols: 2 },
                        { k: 'city', l: 'City', p: 'Mumbai', cols: 1 },
                        { k: 'state', l: 'State', p: 'Maharashtra', cols: 1 },
                        { k: 'pincode', l: 'Pincode', p: '400001', cols: 1 },
                      ].map(f => (
                        <div key={f.k} className={f.cols === 2 ? 'col-span-2' : ''}>
                          <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1 block">{f.l}</label>
                          <input type="text" value={(addrForm as any)[f.k]}
                            onChange={e => setAddrForm(p => ({ ...p, [f.k]: e.target.value }))}
                            className="input-brand" placeholder={f.p} />
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault}
                        onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                        className="accent-[#FF5A00]" />
                      <span className="text-sm text-brand-gray-text">Set as default address</span>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={addAddress} className="btn-accent text-xs px-4 py-2">Save</button>
                      <button onClick={() => setShowAddAddress(false)} className="btn-secondary text-xs px-4 py-2">Cancel</button>
                    </div>
                  </div>
                )}
                {!data?.addresses?.length && !showAddAddress ? (
                  <div className="card-brand p-12 text-center">
                    <MapPin size={40} className="text-brand-border mx-auto mb-3" />
                    <p className="text-brand-gray-text">No saved addresses yet</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(data?.addresses || []).map((a: any) => (
                      <div key={a.id} className={`card-brand p-4 relative ${a.isDefault ? 'border-[#FF5A00]' : ''}`}>
                        {a.isDefault && <span className="absolute top-3 right-3 text-xs text-[#FF5A00] bg-[#FF5A00]/10 border border-[#FF5A00]/20 px-2 py-0.5 rounded">Default</span>}
                        <p className="font-medium text-white text-sm">{a.name}</p>
                        <p className="text-xs text-brand-gray-text mt-1">{a.phone}</p>
                        <p className="text-xs text-brand-gray-text mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} — {a.pincode}</p>
                        <button onClick={() => deleteAddress(a.id)} className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROFILE */}
            {tab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">My Profile</h2>
                  {!editProfile
                    ? <button onClick={() => setEditProfile(true)} className="btn-secondary text-xs px-4 py-2 gap-1.5"><Edit2 size={13} /> Edit</button>
                    : <div className="flex gap-2">
                        <button onClick={saveProfile} disabled={savingProfile} className="btn-accent text-xs px-4 py-2 gap-1.5"><Save size={13} />{savingProfile ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => setEditProfile(false)} className="btn-secondary text-xs px-3 py-2"><X size={13} /></button>
                      </div>
                  }
                </div>
                <div className="card-brand p-6 space-y-5">
                  {editProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Full Name</label>
                        <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="input-brand" />
                      </div>
                      <div>
                        <label className="text-xs text-brand-gray-text uppercase tracking-wider mb-1.5 block">Phone</label>
                        <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input-brand" />
                      </div>
                    </div>
                  ) : (
                    [
                      { label: 'Full Name', value: data?.name },
                      { label: 'Email', value: data?.email },
                      { label: 'Phone', value: data?.phone || '—' },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-brand-gray-text uppercase tracking-wider">{f.label}</p>
                        <p className="text-sm text-white mt-0.5">{f.value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#FF5A00] border-t-transparent rounded-full animate-spin" /></div>}>
      <AccountContent />
    </Suspense>
  )
}
