import { createClient } from '@/utils/supabase/server'
import RoleClient from './role-client'
import { requireAdmin } from '@/lib/auth-server'

export default async function RolePage() {
  await requireAdmin()
  const supabase = createClient()
  
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: true })

  return <RoleClient initialRoles={roles || []} />
}
