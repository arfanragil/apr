import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfilClient from './profil-client'

export const metadata = {
  title: 'Profil Saya | AlifPark Residence',
}

export default async function ProfilPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (!userData) {
    return <div className="p-8">Terjadi kesalahan, data profil tidak ditemukan.</div>
  }

  return <ProfilClient user={userData} />
}
