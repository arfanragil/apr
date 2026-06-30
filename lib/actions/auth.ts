'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in a real app, you should validate with zod
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Gagal login. Email atau password salah.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        phone_number: formData.get('phone_number') as string,
        house_number: formData.get('house_number') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?message=Gagal mendaftar: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateUserPassword(formData: FormData) {
  const supabase = createClient()
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  
  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
