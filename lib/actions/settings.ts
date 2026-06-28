'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppSetting(key: string, value: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value })

  if (error) {
    console.error('Error updating setting:', error)
    return { error: error.message }
  }

  revalidatePath('/pengaturan')
  return { success: true }
}

export async function updateMultipleSettings(formData: FormData) {
  const supabase = createClient()
  
  const entries = Array.from(formData.entries())
  const upsertData = entries.map(([key, value]) => ({
    key,
    value: value as string,
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('app_settings')
    .upsert(upsertData)

  if (error) {
    console.error('Error updating multiple settings:', error)
    return { error: error.message }
  }

  console.log('Successfully updated settings:', upsertData)
  revalidatePath('/pengaturan', 'layout')
  revalidatePath('/pengaturan/aplikasi')
  return { success: true }
}
