import { createClient } from '@/utils/supabase/server'
import PengeluaranClient from './pengeluaran-client'
import { requireAdminOrPengurus } from '@/lib/auth-server'

export default async function PengeluaranPage() {
  await requireAdminOrPengurus()
  const supabase = createClient()
  
  const [expensesRes, categoriesRes] = await Promise.all([
    supabase
      .from('expenses')
      .select(`
        *,
        expense_categories(name),
        users!expenses_created_by_fkey(full_name)
      `)
      .order('date', { ascending: false }),
    supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
  ])

  return <PengeluaranClient 
    initialData={expensesRes.data || []} 
    categories={categoriesRes.data || []} 
  />
}
