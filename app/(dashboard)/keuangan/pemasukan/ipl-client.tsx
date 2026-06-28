'use client'

import { useState } from 'react'
import { CheckCircle2, Search, Filter, AlertCircle } from 'lucide-react'
import { generateMonthlyBills } from '@/lib/actions/billing'

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

export default function IPLClient({ bills }: { bills: Bill[] }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsGenerating(true)
    
    const formData = new FormData(e.currentTarget)
    const res = await generateMonthlyBills(formData)
    
    setIsGenerating(false)
    if (res.success) {
      setSuccessMsg(res.message || 'Tagihan berhasil dibuat')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      alert(res.message || 'Terjadi kesalahan saat membuat tagihan')
    }
  }

  const filteredBills = bills.filter(b => 
    b.residents?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.residents?.address_block?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalBills = bills.length
  const lunasCount = bills.filter(b => b.status === 'lunas').length
  const belumLunasCount = totalBills - lunasCount

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Penagihan IPL</h1>
          <p className="text-gray-500 text-sm">Kelola tagihan, pembayaran, dan tunggakan warga.</p>
        </div>
        
        {/* Form Generate Tagihan Massal */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <select name="month" className="px-3 py-1.5 text-sm border-none bg-transparent focus:ring-0 outline-none text-gray-700 font-medium">
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
          <select name="year" className="px-3 py-1.5 text-sm border-none bg-transparent focus:ring-0 outline-none text-gray-700 font-medium border-l border-gray-200">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <button 
            type="submit" 
            disabled={isGenerating}
            className="ml-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-colors"
          >
            {isGenerating ? 'Memproses...' : 'Generate Tagihan'}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Tagihan (Periode Ini)</p>
          <p className="text-2xl font-bold mt-1">{totalBills} <span className="text-sm font-normal text-gray-400">tagihan</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Sudah Lunas</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{lunasCount} <span className="text-sm font-normal text-gray-400">tagihan</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Belum Bayar / Tunggakan</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{belumLunasCount} <span className="text-sm font-normal text-gray-400">tagihan</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atau blok..." 
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
                <th className="px-6 py-4 font-medium">Warga</th>
                <th className="px-6 py-4 font-medium">Blok/No</th>
                <th className="px-6 py-4 font-medium">Periode</th>
                <th className="px-6 py-4 font-medium">Jumlah</th>
                <th className="px-6 py-4 font-medium">Jatuh Tempo</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data tagihan.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{bill.residents?.name}</td>
                    <td className="px-6 py-4 text-gray-600">Blok {bill.residents?.address_block} No. {bill.residents?.house_number}</td>
                    <td className="px-6 py-4 text-gray-600">{bill.month}/{bill.year}</td>
                    <td className="px-6 py-4 font-medium">Rp {bill.amount?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-gray-600">{bill.due_date}</td>
                    <td className="px-6 py-4">
                      {bill.status === 'lunas' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 size={12} /> Lunas
                        </span>
                      )}
                      {bill.status === 'belum_lunas' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Belum Bayar
                        </span>
                      )}
                      {bill.status === 'terlambat' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle size={12} /> Terlambat
                        </span>
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
