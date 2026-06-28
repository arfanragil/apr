'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCategory(formData: FormData) {
  const supabase = createClient()
  const name = formData.get('name') as string
  const type = formData.get('type') as string // 'income' | 'expense'

  if (!name || !type) return { error: 'Nama dan tipe kategori wajib diisi' }

  const table = type === 'income' ? 'income_categories' : 'expense_categories'
  const { error } = await supabase.from(table).insert({ name, is_active: true })
  
  if (error) return { error: error.message }

  revalidatePath('/pengaturan/kategori')
  return { success: true }
}

export async function toggleCategoryStatus(id: string, type: 'income' | 'expense', currentStatus: boolean) {
  const supabase = createClient()
  const table = type === 'income' ? 'income_categories' : 'expense_categories'

  const { error } = await supabase.from(table).update({ is_active: !currentStatus }).eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/pengaturan/kategori')
  return { success: true }
}
