import { createClient } from '@/utils/supabase/server'
import PengeluaranClient from './pengeluaran-client'

export default async function PengeluaranPage() {
  const supabase = createClient()
  
  const [expensesRes, categoriesRes] = await Promise.all([
    supabase
      .from('expenses')
      .select(`
        *,
        expense_categories(name),
        users!expenses_created_by_fkey(full_name)
      `)
      .order('date_spent', { ascending: false }),
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
