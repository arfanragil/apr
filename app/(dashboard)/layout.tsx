import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './sidebar'
import MobileNav from './mobile-nav'
import { getAppSettings } from '@/lib/settings'
import { logout } from '@/lib/actions/auth'
import { LogOut } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    redirect('/login')
  }

  // Ambil role dari relasi users -> roles
  const { data: userData } = await supabase
    .from('users')
    .select(`
      roles (
        name
      )
    `)
    .eq('id', user.id)
    .single()

  const settings = await getAppSettings()
  const appName = settings['app_name'] || 'AlifPark'

  // Normalisasi string role ('Admin' -> 'admin')
  const userRoleStr = (userData?.roles as any)?.name?.toLowerCase() || 'warga'
  // Kita jadikan array untuk kompatibilitas menu
  const userRoles = [userRoleStr]

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar roles={userRoles} appName={appName} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
          <div className="font-bold text-blue-600 truncate text-lg">{appName}</div>
          <form action={logout}>
            <button className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors" title="Keluar">
              <LogOut size={18} />
            </button>
          </form>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (iPhone-like) */}
      <MobileNav roles={userRoles} />
    </div>
  )
}
