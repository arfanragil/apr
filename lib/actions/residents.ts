'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addResident(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const block = formData.get('block') as string
  const houseNumber = formData.get('houseNumber') as string
  const phone = formData.get('phone') as string
  
  if (!name || !block || !houseNumber) {
    return { error: 'Semua field wajib diisi' }
  }

  const { error } = await supabase
    .from('residents')
    .insert({
      name,
      address_block: block,
      house_number: houseNumber,
      phone_number: phone,
      status: 'aktif'
    })

  if (error) {
    console.error('Error adding resident:', error)
    return { error: error.message }
  }

  revalidatePath('/warga')
  return { success: true }
}

export async function updateResident(formData: FormData) {
  const supabase = createClient()
  
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const block = formData.get('block') as string
  const houseNumber = formData.get('houseNumber') as string
  const phone = formData.get('phone') as string
  const status = formData.get('status') as string
  
  if (!id || !name || !block || !houseNumber) {
    return { error: 'Data tidak lengkap' }
  }

  const { error } = await supabase
    .from('residents')
    .update({
      name,
      address_block: block,
      house_number: houseNumber,
      phone_number: phone,
      status: status || 'aktif',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating resident:', error)
    return { error: error.message }
  }

  revalidatePath('/warga')
  return { success: true }
}

export async function deleteResident(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('residents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting resident:', error)
    return { error: error.message }
  }

  revalidatePath('/warga')
  return { success: true }
}
