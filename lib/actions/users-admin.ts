'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function adminCreateUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone_number') as string
    const house = formData.get('house_number') as string
    const roleId = formData.get('role_id') as string
    const isOccupied = formData.get('is_occupied') === 'true'

    if (!email || !password || !fullName || !roleId) {
      return { error: 'Data wajib (Email, Password, Nama, Role) harus diisi' }
    }

    const adminAuthClient = createAdminClient().auth

    const { data, error } = await adminAuthClient.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_number: phone,
        house_number: house,
        role_id: roleId
      }
    })

    if (error) {
      console.error('Error creating user via admin:', error)
      return { error: error.message }
    }

    if (data?.user?.id) {
      const supabase = createAdminClient()
      await supabase.from('users').update({ is_occupied: isOccupied }).eq('id', data.user.id)
    }

    revalidatePath('/warga')
    revalidatePath('/pengaturan/user')
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function adminDeleteUser(userId: string) {
  try {
    const adminAuthClient = createAdminClient().auth
    const { error } = await adminAuthClient.admin.deleteUser(userId)
    
    if (error) return { error: error.message }
    
    revalidatePath('/warga')
    revalidatePath('/pengaturan/user')
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
