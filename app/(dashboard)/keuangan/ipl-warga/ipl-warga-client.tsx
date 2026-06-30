'use client'

import { useState } from 'react'
import { CheckCircle2, Search, Filter, AlertCircle, CreditCard, UploadCloud, X, Clock, Printer } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { uploadProof } from '@/lib/actions/billing'
import imageCompression from 'browser-image-compression'

type Bill = {
  id: string
  month: number
  year: number
  amount: number
  due_date: string
  status: string
  residents: {
    name: string
    address_block: string
    house_number: string
  }
}

export default function IplWargaClient({ bills }: { bills: Bill[] }) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const filteredBills = bills.filter(b => 
    b.month.toString().includes(searchTerm) ||
    b.year.toString().includes(searchTerm)
  )

  const totalBills = bills.length
  const lunasCount = bills.filter(b => b.status === 'Lunas').length
  const belumLunasCount = totalBills - lunasCount

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBill || !file) return

    setIsSubmitting(true)
    setUploadError('')

    try {
      let fileToUpload = file
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        }
        fileToUpload = await imageCompression(file, options)
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `bill_${selectedBill.id}_${Math.random()}.${fileExt}`
      const filePath = `proofs/${fileName}`

      const { error: uploadErr } = await supabase.storage
        .from('finance')
        .upload(filePath, fileToUpload)
        
      if (uploadErr) {
        throw new Error('Gagal upload bukti bayar: ' + uploadErr.message + '. Pastikan bucket "finance" sudah dibuat di Supabase.')
      }

      const { data: { publicUrl } } = supabase.storage
        .from('finance')
        .getPublicUrl(filePath)
        
      const res = await uploadProof(selectedBill.id, publicUrl)
      if (res.error) throw new Error(res.error)

      setIsModalOpen(false)
      setSelectedBill(null)
      setFile(null)
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tagihan Saya</h1>
          <p className="text-gray-500 text-sm">Lihat rincian dan riwayat tagihan IPL Anda.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Tagihan Saya</p>
          <p className="text-2xl font-bold mt-1">{totalBills} <span className="text-sm font-normal text-gray-400">bulan</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Sudah Lunas</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{lunasCount} <span className="text-sm font-normal text-gray-400">bulan</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Belum Bayar / Tunggakan</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{belumLunasCount} <span className="text-sm font-normal text-gray-400">bulan</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari bulan/tahun..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
            <Filter size={16} /> Filter Status
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium">Periode</th>
                <th className="px-6 py-4 font-medium">Jumlah</th>
                <th className="px-6 py-4 font-medium">Jatuh Tempo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data tagihan untuk Anda.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{bill.month}/{bill.year}</td>
                    <td className="px-6 py-4 font-medium">Rp {bill.amount?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-gray-600">{bill.due_date}</td>
                    <td className="px-6 py-4">
                      {bill.status === 'Lunas' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 size={12} /> Lunas
                        </span>
                      )}
                      {bill.status === 'Menunggu Verifikasi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <Clock size={12} /> Proses Verifikasi
                        </span>
                      )}
                      {bill.status === 'Belum Bayar' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle size={12} /> Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                      <a 
                        href={`/invoice/${bill.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 transition-colors"
                        title="Lihat Invoice"
                      >
                        <Printer size={14} /> Invoice
                      </a>

                      {bill.status === 'Belum Bayar' ? (
                        <button 
                          onClick={() => {
                            setSelectedBill(bill)
                            setIsModalOpen(true)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <UploadCloud size={14} /> Upload Bukti
                        </button>
                      ) : bill.status === 'Menunggu Verifikasi' ? (
                        <span className="text-xs text-yellow-600 font-medium italic px-2">Menunggu...</span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium italic px-2">Lunas</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Bukti */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Upload Bukti Transfer</h3>
              <button onClick={() => { setIsModalOpen(false); setSelectedBill(null); setFile(null); setUploadError(''); }} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-4 space-y-4">
              {uploadError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                  {uploadError}
                </div>
              )}
              
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                <p>Tagihan <strong>Bulan {selectedBill.month} Tahun {selectedBill.year}</strong></p>
                <p className="font-bold mt-1 text-base">Rp {selectedBill.amount.toLocaleString('id-ID')}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Pilih File Bukti Transfer (Gambar/PDF) *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none" 
                />
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setSelectedBill(null); setFile(null); setUploadError(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting || !file} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? 'Mengupload...' : <><UploadCloud size={16}/> Kirim Bukti</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
