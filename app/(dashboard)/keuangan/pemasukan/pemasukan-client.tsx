'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Trash2, X, Download, FileSpreadsheet } from 'lucide-react'
import { addIncome, deleteIncome } from '@/lib/actions/incomes'
import * as XLSX from 'xlsx'

type Category = { id: string, name: string }
type Income = {
  id: string
  transaction_number: string
  amount: number
  description: string
  date: string
  income_categories: { name: string }
  users: { full_name: string }
}

export default function PemasukanClient({ initialData, categories }: { initialData: Income[], categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter logic
  const filteredData = initialData.filter(item => {
    const matchesSearch = item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.transaction_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = filterMonth ? item.date.startsWith(filterMonth) : true
    const matchesCategory = filterCategory ? item.income_categories?.name === filterCategory : true
    return matchesSearch && matchesMonth && matchesCategory
  })

  // Export Excel
  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      'No. Transaksi': item.transaction_number,
      'Tanggal': item.date,
      'Kategori': item.income_categories?.name || '-',
      'Keterangan': item.description || '-',
      'Nominal (Rp)': item.amount,
      'Dibuat Oleh': item.users?.full_name || '-'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Pemasukan")
    XLSX.writeFile(wb, `Laporan_Pemasukan_${new Date().getTime()}.xlsx`)
  }

  const handleAdd = async (formData: FormData) => {
    setIsSubmitting(true)
    const res = await addIncome(formData)
    setIsSubmitting(false)
    if (res.success) {
      setIsModalOpen(false)
    } else {
      alert(res.error || 'Gagal menambahkan pemasukan')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus data pemasukan ini?')) {
      const res = await deleteIncome(id)
      if (res.error) alert(res.error)
    }
  }

  // Calculate totals
  const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pemasukan Kas</h1>
          <p className="text-gray-500 text-sm">Pencatatan uang masuk operasional perumahan.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <FileSpreadsheet size={16} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pemasukan (Sesuai Filter)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              Rp {totalAmount.toLocaleString('id-ID')}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Jumlah Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {filteredData.length} <span className="text-base font-normal text-gray-500">transaksi</span>
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium">No. Transaksi & Tanggal</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
                <th className="px-6 py-4 font-medium text-right">Nominal</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data pemasukan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.transaction_number}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase">
                        {item.income_categories?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={item.description}>
                      {item.description || '-'}
                      <div className="text-xs text-gray-400 mt-0.5">Oleh: {item.users?.full_name}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      Rp {Number(item.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!item.transaction_number.startsWith('IPL-') ? (
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Otomatis</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Catat Pemasukan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleAdd} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nominal (Rp) *</label>
                <input name="amount" type="number" required placeholder="Contoh: 150000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Tanggal *</label>
                  <input name="date_received" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Kategori *</label>
                  <select name="category_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Keterangan</label>
                <textarea name="description" rows={3} placeholder="Catatan tambahan (opsional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pemasukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
