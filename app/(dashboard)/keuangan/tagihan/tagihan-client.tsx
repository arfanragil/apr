'use client'

import { useState } from 'react'
import { Plus, Search, Filter, CheckCircle2, AlertCircle, Clock, Paperclip, Check, UploadCloud, X, Printer } from 'lucide-react'
import { generateMonthlyBills, approveBill, uploadProof } from '@/lib/actions/billing'
import { createClient } from '@/utils/supabase/client'
import * as XLSX from 'xlsx'

type Bill = {
  id: string
  month: number
  year: number
  amount: number
  due_date: string
  status: string
  proof_url: string
  users: {
    full_name: string
    house_number: string
    phone_number: string
  }
}

export default function TagihanClient({ initialData }: { initialData: Bill[] }) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // State for Upload Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Filter logic
  const filteredData = initialData.filter(item => {
    const matchesSearch = item.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.users?.house_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus ? item.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  const handleGenerate = async () => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    if (confirm(`Buat tagihan massal untuk bulan ${currentMonth}/${currentYear} kepada seluruh warga aktif (Kecuali Admin)?`)) {
      setIsGenerating(true)
      const formData = new FormData()
      formData.append('month', currentMonth.toString())
      formData.append('year', currentYear.toString())
      
      const res = await generateMonthlyBills(formData)
      setIsGenerating(false)
      
      if (res.success) {
        alert(res.message)
      } else {
        alert(res.message || 'Gagal membuat tagihan')
      }
    }
  }

  const handleApprove = async (id: string) => {
    if (confirm('Konfirmasi pembayaran ini valid dan Lunas?')) {
      const res = await approveBill(id)
      if (res.error) alert(res.error)
    }
  }

  // Export Excel
  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      'Periode': `${item.month}/${item.year}`,
      'Warga': item.users?.full_name || '-',
      'No. Rumah': item.users?.house_number || '-',
      'Nominal (Rp)': item.amount,
      'Status': item.status,
      'Bukti Transfer': item.proof_url || '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Tagihan")
    XLSX.writeFile(wb, `Laporan_Tagihan_${new Date().getTime()}.xlsx`)
  }

  const stats = {
    total: filteredData.length,
    menunggu: filteredData.filter(b => b.status === 'Menunggu Verifikasi').length,
    belum: filteredData.filter(b => b.status === 'Belum Bayar').length,
    lunas: filteredData.filter(b => b.status === 'Lunas').length,
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBill || !file) return

    setIsSubmitting(true)
    setUploadError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `bill_${selectedBill.id}_${Math.random()}.${fileExt}`
      const filePath = `proofs/${fileName}`

      const { error: uploadErr } = await supabase.storage
        .from('finance')
        .upload(filePath, file)
        
      if (uploadErr) {
        throw new Error('Gagal upload bukti bayar: ' + uploadErr.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('finance')
        .getPublicUrl(filePath)
        
      const res = await uploadProof(selectedBill.id, publicUrl)
      if (res.error) throw new Error(res.error)
      
      // Langsung approve otomatis karena yang upload admin/pengurus
      await approveBill(selectedBill.id)

      setIsModalOpen(false)
      setSelectedBill(null)
      setFile(null)
      alert("Bukti pembayaran berhasil diupload dan tagihan dinyatakan Lunas!")
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
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Tagihan</h1>
          <p className="text-gray-500 text-sm">Kelola iuran bulanan, verifikasi pembayaran warga.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm"
          >
            Export
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
          >
            {isGenerating ? 'Memproses...' : <><Plus size={16} /> Generate Bulan Ini</>}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Tagihan</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-yellow-100 bg-yellow-50/30 shadow-sm">
          <p className="text-sm text-yellow-700 font-medium">Menunggu Verifikasi</p>
          <h3 className="text-2xl font-bold text-yellow-700 mt-1">{stats.menunggu}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/30 shadow-sm">
          <p className="text-sm text-red-700 font-medium">Belum Bayar</p>
          <h3 className="text-2xl font-bold text-red-700 mt-1">{stats.belum}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 bg-green-50/30 shadow-sm">
          <p className="text-sm text-green-700 font-medium">Lunas</p>
          <h3 className="text-2xl font-bold text-green-700 mt-1">{stats.lunas}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atau no rumah..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Belum Bayar">Belum Bayar</option>
            <option value="Lunas">Lunas</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium">Periode</th>
                <th className="px-6 py-4 font-medium">Warga</th>
                <th className="px-6 py-4 font-medium">Nominal</th>
                <th className="px-6 py-4 font-medium">Bukti</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data tagihan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {item.month}/{item.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.users?.full_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Rumah: {item.users?.house_number}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      Rp {Number(item.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {item.proof_url ? (
                        <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <Paperclip size={14} /> Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'Lunas' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700">
                          Lunas
                        </span>
                      )}
                      {item.status === 'Menunggu Verifikasi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700">
                          Menunggu
                        </span>
                      )}
                      {item.status === 'Belum Bayar' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700">
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`/invoice/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 transition-colors mr-2"
                        title="Cetak Invoice"
                      >
                        <Printer size={14} /> Cetak
                      </a>
                      
                      {item.status === 'Menunggu Verifikasi' && (
                        <button 
                          onClick={() => handleApprove(item.id)} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {item.status === 'Belum Bayar' && (
                        <button 
                          onClick={() => {
                            setSelectedBill(item)
                            setIsModalOpen(true)
                          }} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <UploadCloud size={14} /> Upload / Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Bukti Admin */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Upload Bukti / Terima Tunai</h3>
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
                <p>Warga: <strong>{selectedBill.users?.full_name} ({selectedBill.users?.house_number})</strong></p>
                <p>Tagihan IPL: <strong>Bulan {selectedBill.month} Tahun {selectedBill.year}</strong></p>
                <p className="font-bold mt-1 text-base">Rp {selectedBill.amount.toLocaleString('id-ID')}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Pilih File Bukti Transfer / Kwitansi *</label>
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
                  {isSubmitting ? 'Memproses...' : <><Check size={16}/> Upload & Lunaskan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
