import { createClient } from '@/utils/supabase/server'
import KategoriClient from './kategori-client'
import { requireAdmin } from '@/lib/auth-server'

export default async function KategoriPage() {
  await requireAdmin()
  const supabase = createClient()
  
  const [incomesRes, expensesRes] = await Promise.all([
    supabase.from('income_categories').select('*').order('created_at', { ascending: true }),
    supabase.from('expense_categories').select('*').order('created_at', { ascending: true })
  ])

  return (
    <KategoriClient 
      initialIncomeCategories={incomesRes.data || []} 
      initialExpenseCategories={expensesRes.data || []} 
    />
  )
}
