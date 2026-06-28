import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function KeuanganRedirect() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (userData?.roles as any)?.name?.toLowerCase() || 'warga'

  if (roleName === 'warga') {
    redirect('/keuangan/ipl-warga')
  } else {
    redirect('/keuangan/tagihan')
  }
}
