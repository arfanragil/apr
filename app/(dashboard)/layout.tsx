import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './sidebar'
import MobileNav from './mobile-nav'
import { getAppSettings } from '@/lib/settings'

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (iPhone-like) */}
      <MobileNav roles={userRoles} />
    </div>
  )
}
