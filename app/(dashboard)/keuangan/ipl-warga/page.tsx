import { createClient } from '@/utils/supabase/server'
import IplWargaClient from './ipl-warga-client'

export default async function IplWargaPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Silakan login kembali.</div>
  }

  // Ambil tagihan khusus untuk user ini
  const { data: bills, error } = await supabase
    .from('bills')
    .select(`
      *,
      users (
        full_name,
        house_number
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bills:', error)
  }

  return <IplWargaClient bills={bills || []} />
}
