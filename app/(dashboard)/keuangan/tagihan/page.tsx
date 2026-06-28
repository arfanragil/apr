import { createClient } from '@/utils/supabase/server'
import TagihanClient from './tagihan-client'
import { requireAdminOrPengurus } from '@/lib/auth-server'

export default async function TagihanPage() {
  await requireAdminOrPengurus()
  const supabase = createClient()
  
  const { data: bills, error } = await supabase
    .from('bills')
    .select(`
      *,
      users (
        full_name,
        house_number,
        phone_number
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bills for admin:', error)
  }

  return <TagihanClient initialData={bills || []} />
}
