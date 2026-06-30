'use client'

import { useState } from 'react'
import { User, KeyRound, Save, Phone, Home, Mail } from 'lucide-react'
import { updateMyProfile } from '@/lib/actions/users'
import { updateUserPassword } from '@/lib/actions/auth'

export default function ProfilClient({ user }: { user: any }) {
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  
  const [passwordError, setPasswordError] = useState('')

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSavingProfile(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateMyProfile(formData)
    setIsSavingProfile(false)
    if (res.success) {
      alert('Profil berhasil diperbarui!')
    } else {
      alert(res.error || 'Gagal memperbarui profil.')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newPass = formData.get('password') as string
    const confirmPass = formData.get('confirm_password') as string

    if (newPass !== confirmPass) {
      setPasswordError('Password dan Konfirmasi Password tidak cocok.')
      return
    }
    if (newPass.length < 6) {
      setPasswordError('Password minimal 6 karakter.')
      return
    }

    setIsSavingPassword(true)
    setPasswordError('')
    const res = await updateUserPassword(formData)
    setIsSavingPassword(false)

    if (res.error) {
      setPasswordError(res.error)
    } else {
      alert('Password berhasil diubah!')
      e.currentTarget.reset()
    }
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kolom Informasi Pribadi */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            <h3 className="font-bold text-gray-900">Informasi Pribadi</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Mail size={14}/> Email (Login)</label>
              <input type="email" disabled defaultValue={user.email} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><User size={14}/> Nama Lengkap *</label>
              <input name="full_name" type="text" required defaultValue={user.full_name} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Phone size={14}/> No. HP / WhatsApp</label>
              <input name="phone_number" type="text" defaultValue={user.phone_number} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Home size={14}/> Nomor Rumah</label>
              <input name="house_number" type="text" defaultValue={user.house_number} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button type="submit" disabled={isSavingProfile} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 disabled:opacity-70 transition-colors">
              <Save size={18} /> {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>

        {/* Kolom Keamanan Akun */}
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <KeyRound size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-900">Ubah Password</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {passwordError}
              </div>
            )}
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs mb-2">
              Pastikan Anda menggunakan kombinasi angka dan huruf yang kuat serta mudah diingat.
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password Baru *</label>
              <input name="password" type="password" required placeholder="Minimal 6 karakter" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru *</label>
              <input name="confirm_password" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button type="submit" disabled={isSavingPassword} className="w-full py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 flex justify-center items-center gap-2 disabled:opacity-70 transition-colors">
              <KeyRound size={18} /> {isSavingPassword ? 'Menyimpan...' : 'Ganti Password'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
