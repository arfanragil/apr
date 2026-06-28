import { createClient } from '@/utils/supabase/server'
import WargaClient from './warga-client'

export default async function WargaPage() {
  const supabase = createClient()
  
  const [usersRes, rolesRes] = await Promise.all([
    supabase.from('users').select('*, roles(name)').order('created_at', { ascending: false }),
    supabase.from('roles').select('*').order('created_at', { ascending: true })
  ])

  return (
    <WargaClient 
      initialUsers={usersRes.data || []} 
      roles={rolesRes.data || []} 
    />
  )
}
