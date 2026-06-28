'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUser(formData: FormData) {
  const supabase = createClient()
  
  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string
  const phone_number = formData.get('phone_number') as string
  const house_number = formData.get('house_number') as string
  const role_id = formData.get('role_id') as string
  const status = formData.get('status') as string

  if (!id || !full_name || !role_id) {
    return { error: 'Data wajib harus diisi' }
  }

  const { error } = await supabase
    .from('users')
    .update({
      full_name,
      phone_number,
      house_number,
      role_id,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating user:', error)
    return { error: error.message }
  }

  revalidatePath('/warga')
  return { success: true }
}
