'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addIncome(formData: FormData) {
  const supabase = createClient()
  
  const amount = formData.get('amount') as string
  const category_id = formData.get('category_id') as string
  const description = formData.get('description') as string
  const date_received = formData.get('date_received') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Anda belum login' }
  if (!amount || !category_id || !date_received) return { error: 'Data wajib harus diisi' }

  // Generate transaction number
  const prefix = 'INC'
  const dateStr = new Date(date_received).toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString()
  const transaction_number = `${prefix}-${dateStr}-${randomStr}`

  const { error } = await supabase
    .from('incomes')
    .insert({
      transaction_number,
      amount: parseFloat(amount),
      category_id,
      description,
      date: date_received,
      created_by: user.id
    })

  if (error) {
    console.error('Error adding income:', error)
    return { error: error.message }
  }

  revalidatePath('/keuangan/pemasukan')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteIncome(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/keuangan/pemasukan')
  revalidatePath('/dashboard')
  return { success: true }
}
