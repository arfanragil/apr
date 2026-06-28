'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRole(formData: FormData) {
  const supabase = createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Nama role wajib diisi' }

  const { error } = await supabase.from('roles').insert({ name })
  if (error) return { error: error.message }

  revalidatePath('/pengaturan/role')
  return { success: true }
}

export async function deleteRole(id: string) {
  const supabase = createClient()
  
  // Prevent deleting default roles
  const { data } = await supabase.from('roles').select('name').eq('id', id).single()
  const protectedRoles = ['Superadmin', 'Admin', 'Pengurus', 'Warga']
  if (data && protectedRoles.includes(data.name)) {
    return { error: 'Role sistem (Superadmin, Admin, Pengurus, Warga) tidak boleh dihapus.' }
  }

  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/pengaturan/role')
  return { success: true }
}
