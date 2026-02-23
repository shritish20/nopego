'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Megaphone,
  RotateCcw, Settings, Menu, Star, Tag, UserCheck,
  ExternalLink, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/admin' },
  { icon: ShoppingBag,     label: 'Orders',       href: '/admin/orders' },
  { icon: Package,         label: 'Inventory',    href: '/admin/inventory' },
  { icon: Users,           label: 'Customers',    href: '/admin/customers' },
  { icon: Megaphone,       label: 'Marketing',    href: '/admin/marketing' },
  { icon: Star,            label: 'Reviews',      href: '/admin/reviews' },
  { icon: RotateCcw,       label: 'Returns',      href: '/admin/returns' },
  { icon: Tag,             label: 'Coupons',      href: '/admin/coupons' },
  { icon: UserCheck,       label: 'Influencers',  href: '/admin/influencers' },
  { icon: Settings,        label: 'Settings',     href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col transition-transform duration-300',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-5 border-b border-[#1A1A1A]">
          <Link
            href="/admin"
            className="font-display text-2xl tracking-widest text-white hover:text-[#FF5A00] transition-colors"
          >
            NOPEGO
          </Link>
          <p className="text-xs text-[#555] mt-0.5 tracking-[0.2em]">ADMIN</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn('admin-nav-item', isActive && 'active')}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#1A1A1A] space-y-1">
          <Link href="/" target="_blank" className="admin-nav-item text-xs">
            <ExternalLink size={14} /> View Store
          </Link>
          {session?.user && (
            <div className="px-3 py-3 bg-[#FF5A00]/5 border border-[#FF5A00]/10 mt-1">
              <p className="text-white text-xs font-medium truncate">{session.user.name}</p>
              <p className="text-[#555] text-xs truncate">{session.user.email}</p>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs mt-2 transition-colors disabled:opacity-50"
              >
                <LogOut size={12} />
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#1A1A1A] bg-[#0D0D0D] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-[#666] hover:text-white p-1"
          >
            <Menu size={20} />
          </button>
          <p className="hidden md:block text-[#555] text-sm">
            {navItems.find(
              (n) => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href))
            )?.label || 'Admin'}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#FF5A00] rounded-full animate-pulse" />
            <span className="text-xs text-[#555] hidden sm:block">Live</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
