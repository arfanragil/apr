import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getAppSettings = cache(async () => {
  const supabase = createClient()
  const { data } = await supabase.from('app_settings').select('key, value')
  
  const settings: Record<string, string> = {}
  data?.forEach(s => {
    settings[s.key] = s.value
  })
  
  return settings
})
