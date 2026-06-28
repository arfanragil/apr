'use client'

import { useState } from 'react'
import { Plus, Search, Filter, CheckCircle2, AlertCircle, Clock, Paperclip, Check } from 'lucide-react'
import { generateMonthlyBills, approveBill } from '@/lib/actions/billing'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

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
                      {item.status === 'Menunggu Verifikasi' && (
                        <button 
                          onClick={() => handleApprove(item.id)} 
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check size={14} /> Approve
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
    </div>
  )
}
