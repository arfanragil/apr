'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, FileText, CreditCard, Settings, LogOut, BarChart3, ChevronDown, ChevronRight, DollarSign } from 'lucide-react'
import { logout } from '@/lib/actions/auth'

export type Role = 'superadmin' | 'admin' | 'pengurus' | 'warga' | string

type NavItem = {
  href: string
  icon: React.ElementType
  label: string
  roles: string[]
  subItems?: { href: string; label: string; roles: string[] }[]
}

export default function Sidebar({ roles, appName = 'AlifPark' }: { roles: string[], appName?: string }) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/keuangan': pathname.startsWith('/keuangan')
  })

  const toggleMenu = (href: string) => {
    setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }))
  }

  // Menu Definition based on Role
  const navItems: NavItem[] = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', roles: ['superadmin', 'admin', 'pengurus', 'warga'] },
    { href: '/warga', icon: Users, label: 'Warga', roles: ['superadmin', 'admin', 'pengurus'] },
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
    { 
      href: '/pengaturan', icon: Settings, label: 'Pengaturan', roles: ['superadmin', 'admin'],
      subItems: [
        { href: '/pengaturan/aplikasi', label: 'Aplikasi & Iuran', roles: ['superadmin', 'admin'] },
        { href: '/pengaturan/kategori', label: 'Kategori Keuangan', roles: ['superadmin', 'admin'] },
        { href: '/pengaturan/role', label: 'Manajemen Role', roles: ['superadmin'] }
      ]
    },
  ]

  const visibleNavItems = navItems.filter(item => item.roles.some(r => roles.includes(r)))

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-600 tracking-tight truncate" title={appName}>{appName}</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">Sistem Manajemen IPL</p>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Akses:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            roles.includes('superadmin') ? 'bg-purple-100 text-purple-700' :
            roles.includes('admin') ? 'bg-indigo-100 text-indigo-700' :
            roles.includes('pengurus') ? 'bg-blue-100 text-blue-700' :
            'bg-gray-200 text-gray-700'
          }`}>
            {roles.join(', ').toUpperCase()}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0
            const isActive = pathname === item.href || (hasSub && pathname.startsWith(item.href))
            const isOpen = openMenus[item.href]

            return (
              <div key={item.href}>
                {hasSub ? (
                  <button 
                    onClick={() => toggleMenu(item.href)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} /> {item.label}
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <Link 
                    href={item.href} 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon size={20} /> {item.label}
                  </Link>
                )}

                {hasSub && isOpen && (
                  <div className="mt-1 ml-9 space-y-1">
                    {item.subItems!.filter(s => s.roles.some(r => roles.includes(r))).map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === sub.href
                            ? 'text-blue-700 font-bold bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
              <LogOut size={20} /> Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
