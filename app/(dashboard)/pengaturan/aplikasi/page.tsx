import { createClient } from '@/utils/supabase/server'
import AplikasiClient from './aplikasi-client'
import { requireAdmin } from '@/lib/auth-server'

export default async function AplikasiPage() {
  await requireAdmin()
  const supabase = createClient()
  
  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')
    
  let settingsMap: Record<string, string> = {}
  settings?.forEach(s => {
    settingsMap[s.key] = s.value
  })

  return <AplikasiClient initialSettings={settingsMap} />
}
