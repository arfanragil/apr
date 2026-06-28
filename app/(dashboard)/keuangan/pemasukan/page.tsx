import { createClient } from '@/utils/supabase/server'
import PemasukanClient from './pemasukan-client'
import { requireAdminOrPengurus } from '@/lib/auth-server'

export default async function PemasukanPage() {
  await requireAdminOrPengurus()
  const supabase = createClient()
  
  const [incomesRes, categoriesRes] = await Promise.all([
    supabase
      .from('incomes')
      .select(`
        *,
        income_categories(name),
        users!incomes_created_by_fkey(full_name)
      `)
      .order('date', { ascending: false }),
    supabase
      .from('income_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
  ])

  return <PemasukanClient 
    initialData={incomesRes.data || []} 
    categories={categoriesRes.data || []} 
  />
}
