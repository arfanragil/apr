'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, DollarSign, BarChart3, Settings, X, ChevronRight } from 'lucide-react'

type NavItem = {
  href: string
  icon: React.ElementType
  label: string
  roles: string[]
  subItems?: { href: string; label: string; roles: string[] }[]
}

export default function MobileNav({ roles }: { roles: string[] }) {
  const pathname = usePathname()
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const navItems: NavItem[] = [
    { href: '/dashboard', icon: Home, label: 'Beranda', roles: ['superadmin', 'admin', 'pengurus', 'warga'] },
    { 
      href: '/keuangan', icon: DollarSign, label: 'Keuangan', roles: ['superadmin', 'admin', 'pengurus', 'warga'],
      subItems: [
        { href: '/keuangan/pemasukan', label: 'Pemasukan', roles: ['superadmin', 'admin', 'pengurus'] },
        { href: '/keuangan/pengeluaran', label: 'Pengeluaran', roles: ['superadmin', 'admin', 'pengurus'] },
        { href: '/keuangan/tagihan', label: 'Manajemen Tagihan', roles: ['superadmin', 'admin', 'pengurus'] },
        { href: '/keuangan/ipl-warga', label: 'Tagihan Saya', roles: ['pengurus', 'warga'] },
      ]
    },
    { href: '/laporan', icon: BarChart3, label: 'Laporan', roles: ['superadmin', 'admin', 'pengurus'] },
    { href: '/warga', icon: Users, label: 'Warga', roles: ['superadmin', 'admin', 'pengurus'] },
    { 
      href: '/pengaturan', icon: Settings, label: 'Setting', roles: ['superadmin', 'admin'],
      subItems: [
        { href: '/pengaturan/aplikasi', label: 'Aplikasi & Iuran', roles: ['superadmin', 'admin'] },
        { href: '/pengaturan/kategori', label: 'Kategori Keuangan', roles: ['superadmin', 'admin'] },
        { href: '/pengaturan/role', label: 'Manajemen Role', roles: ['superadmin'] }
      ]
    },
  ]

  const visibleItems = navItems.filter(item => item.roles.some(r => roles.includes(r)))

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.subItems && item.subItems.some(sub => sub.roles.some(r => roles.includes(r)))) {
      e.preventDefault()
      setActiveDrawer(activeDrawer === item.href ? null : item.href)
    } else {
      setActiveDrawer(null)
    }
  }

  const activeSubItems = navItems.find(i => i.href === activeDrawer)?.subItems?.filter(s => s.roles.some(r => roles.includes(r)))

  return (
    <>
      {/* Backdrop for Drawer */}
      {activeDrawer && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setActiveDrawer(null)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`md:hidden fixed bottom-[64px] left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out ${
          activeDrawer ? 'translate-y-0' : 'translate-y-[150%]'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Menu {navItems.find(i => i.href === activeDrawer)?.label}
            </h3>
            <button 
              onClick={() => setActiveDrawer(null)}
              className="p-1 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {activeSubItems?.map((sub) => {
              const isSubActive = pathname === sub.href
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setActiveDrawer(null)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isSubActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{sub.label}</span>
                  <ChevronRight size={18} className={isSubActive ? 'text-blue-500' : 'text-gray-400'} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {visibleItems.map((item) => {
            const hasSub = item.subItems && item.subItems.some(sub => sub.roles.some(r => roles.includes(r)))
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
            const isDrawerOpen = activeDrawer === item.href
            
            const content = (
              <>
                <div className={`p-1 rounded-full ${isActive || isDrawerOpen ? 'bg-blue-50' : ''}`}>
                  <item.icon size={22} strokeWidth={isActive || isDrawerOpen ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] mt-1 ${isActive || isDrawerOpen ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </>
            )

            const className = `flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              isActive || isDrawerOpen ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`

            if (hasSub) {
              return (
                <button 
                  key={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={className}
                >
                  {content}
                </button>
              )
            }
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={className}
                onClick={() => setActiveDrawer(null)}
              >
                {content}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
