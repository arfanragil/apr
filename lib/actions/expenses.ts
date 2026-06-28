'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = createClient()
  
  const amount = formData.get('amount') as string
  const category_id = formData.get('category_id') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const proof_url = formData.get('proof_url') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Anda belum login' }
  if (!amount || !category_id || !date) return { error: 'Data wajib harus diisi' }

  // Generate transaction number
  const prefix = 'EXP'
  const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString()
  const transaction_number = `${prefix}-${dateStr}-${randomStr}`

  const { error } = await supabase
    .from('expenses')
    .insert({
      transaction_number,
      amount: parseFloat(amount),
      category_id,
      description,
      date,
      proof_url: proof_url || null,
      created_by: user.id
    })

  if (error) {
    console.error('Error adding expense:', error)
    return { error: error.message }
  }

  revalidatePath('/keuangan/pengeluaran')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/keuangan/pengeluaran')
  revalidatePath('/dashboard')
  return { success: true }
}
