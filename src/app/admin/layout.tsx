'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Megaphone,
  Star, RotateCcw, Tag, UserCheck, Settings, LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/influencers', label: 'Influencers', icon: UserCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-card border-r border-brand-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-brand-border">
          <h1 className="font-display text-2xl text-white">NOPEGO</h1>
          <p className="text-brand-muted text-xs mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className={`admin-sidebar-link ${active ? 'active' : ''}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-brand-border">
          <p className="text-brand-muted text-xs mb-3 truncate">{session?.user?.email}</p>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="admin-sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  )
}
