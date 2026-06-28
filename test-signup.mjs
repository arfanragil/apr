import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignup() {
  console.log('Mencoba mendaftar dengan test_admin@alifpark.com...')
  
  const { data, error } = await supabase.auth.signUp({
    email: 'test_admin@alifpark.com',
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test Admin'
      }
    }
  })

  if (error) {
    console.error('ERROR dari Supabase Auth:', error)
  } else {
    console.log('Pendaftaran BERHASIL!', data)
  }
}

testSignup()
