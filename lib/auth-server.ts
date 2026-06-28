import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserRole() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()

  const role = (userData?.roles as any)?.name?.toLowerCase() || 'warga'
  return { user, role }
}

export async function requireAdminOrPengurus() {
  const { user, role } = await getUserRole()
  if (!['superadmin', 'admin', 'pengurus'].includes(role)) {
    redirect('/dashboard') // Warga tidak boleh masuk
  }
  return { user, role }
}

export async function requireAdmin() {
  const { user, role } = await getUserRole()
  if (!['superadmin', 'admin'].includes(role)) {
    redirect('/dashboard')
  }
  return { user, role }
}
