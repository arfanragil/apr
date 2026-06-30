'use client'

import { useState } from 'react'
import { CheckCircle2, Save, Building2, Coins, AlertTriangle } from 'lucide-react'
import { updateMultipleSettings } from '@/lib/actions/settings'
import { resetBukuTahunan } from '@/lib/actions/bookkeeping'

export default function AplikasiClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleResetBuku = async () => {
    if (confirm('PERINGATAN KERAS: Apakah Anda yakin ingin melakukan Tutup Buku?\n\nSemua data tagihan Lunas, pengeluaran, pemasukan, dan foto bukti bayar akan DIHAPUS PERMANEN. Tindakan ini tidak dapat dibatalkan!')) {
      if (confirm('KONFIRMASI TERAKHIR: Anda benar-benar yakin ingin menghapus data lama?')) {
        setIsResetting(true)
        const res = await resetBukuTahunan()
        setIsResetting(false)
        if (res.success) {
          alert(res.message)
        } else {
          alert(res.message || 'Gagal melakukan Tutup Buku')
        }
      }
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateMultipleSettings(formData)
    setIsSaving(false)
    if (res.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      alert(res.error || 'Gagal menyimpan pengaturan')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Aplikasi & Iuran</h1>
        <p className="text-gray-500 text-sm">Atur informasi dasar aplikasi dan besaran komponen iuran.</p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">Pengaturan berhasil diperbarui.</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Info Aplikasi */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              <h3 className="font-bold text-gray-900">Informasi Aplikasi</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aplikasi</label>
                <input 
                  type="text" 
                  name="app_name"
                  defaultValue={initialSettings['app_name'] || 'AlifPark Residence'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  name="app_address"
                  rows={2}
                  defaultValue={initialSettings['app_address']}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp</label>
                  <input 
                    type="text" 
                    name="app_phone"
                    defaultValue={initialSettings['app_phone']}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="app_email"
                    defaultValue={initialSettings['app_email']}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Footer</label>
                <input 
                  type="text" 
                  name="app_footer"
                  defaultValue={initialSettings['app_footer']}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Master Iuran */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Coins size={18} className="text-orange-500" />
              <h3 className="font-bold text-gray-900">Master Iuran</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs mb-2">
                Nominal di bawah akan menjadi acuan dasar pembuatan Tagihan IPL (Iuran Pemeliharaan Lingkungan) bulanan secara otomatis.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Dasar (Rp)</label>
                <input 
                  type="number" 
                  name="iuran_dasar"
                  defaultValue={initialSettings['iuran_dasar'] || '100000'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kas (Rp)</label>
                <input 
                  type="number" 
                  name="iuran_kas"
                  defaultValue={initialSettings['iuran_kas'] || '30000'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sampah (Rp)</label>
                <input 
                  type="number" 
                  name="iuran_sampah"
                  defaultValue={initialSettings['iuran_sampah'] || '20000'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Jatuh Tempo (Setiap Bulan)</label>
                <input 
                  type="number" 
                  name="due_date_day"
                  min="1"
                  max="28"
                  defaultValue={initialSettings['due_date_day'] || '10'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-900"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
          >
            <Save size={20} /> {isSaving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan'}
          </button>
        </div>

      </form>

      {/* Kolom Bahaya (Danger Zone) */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} /> Danger Zone: Tutup Buku Tahunan
            </h3>
            <p className="text-red-600 text-sm mt-1 max-w-2xl leading-relaxed">
              Fungsi ini akan <strong>menghapus secara permanen</strong> seluruh histori pemasukan, pengeluaran, dan tagihan warga (yang berstatus Lunas), beserta semua foto buktinya dari server. Saldo kas saat ini akan dihitung otomatis dan dimasukkan sebagai "Saldo Awal Pembukuan Baru". 
              <br/><br/>
              <strong>Catatan:</strong> Tagihan yang statusnya "Belum Bayar" tidak akan ikut terhapus sehingga warga masih tetap wajib membayarnya.
            </p>
          </div>
          <button 
            type="button"
            onClick={handleResetBuku}
            disabled={isResetting}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-70 whitespace-nowrap shadow-sm"
          >
            {isResetting ? 'Memproses...' : 'Tutup Buku Sekarang'}
          </button>
        </div>
      </div>
    </div>
  )
}
