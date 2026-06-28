import { createClient } from '@/utils/supabase/server'
import TagihanClient from './tagihan-client'

export default async function TagihanPage() {
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
