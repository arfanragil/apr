'use client'

import { useState } from 'react'
import { Plus, Check, X, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { addCategory, toggleCategoryStatus } from '@/lib/actions/categories'

type Category = {
  id: string
  name: string
  is_active: boolean
}

export default function KategoriClient({ 
  initialIncomeCategories, 
  initialExpenseCategories 
}: { 
  initialIncomeCategories: Category[],
  initialExpenseCategories: Category[]
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')

  const handleAdd = async (formData: FormData) => {
    setIsSubmitting(true)
    formData.append('type', activeTab)
    const res = await addCategory(formData)
    setIsSubmitting(false)
    if (res.error) alert(res.error)
    else (document.getElementById('add-cat-form') as HTMLFormElement).reset()
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleCategoryStatus(id, activeTab, currentStatus)
    if (res.error) alert(res.error)
  }

  const currentCategories = activeTab === 'income' ? initialIncomeCategories : initialExpenseCategories

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Kategori</h1>
        <p className="text-gray-500 text-sm">Kelola kategori untuk pencatatan arus kas.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowDownRight size={16} /> Kategori Pemasukan
        </button>
        <button 
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowUpRight size={16} /> Kategori Pengeluaran
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Tambah Kategori</h3>
            <form id="add-cat-form" action={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder={activeTab === 'income' ? 'Cth: Parkir' : 'Cth: Konsumsi'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                <Plus size={18} /> {isSubmitting ? 'Menyimpan...' : 'Tambah'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nama Kategori</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cat.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggle(cat.id, cat.is_active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                            cat.is_active 
                              ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                              : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {cat.is_active ? 'Non-aktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentCategories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Belum ada data kategori.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
