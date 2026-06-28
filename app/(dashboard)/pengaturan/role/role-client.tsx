'use client'

import { useState } from 'react'
import { Plus, Trash2, Shield } from 'lucide-react'
import { addRole, deleteRole } from '@/lib/actions/roles'

type Role = {
  id: string
  name: string
  created_at: string
}

export default function RoleClient({ initialRoles }: { initialRoles: Role[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (formData: FormData) => {
    setIsSubmitting(true)
    const res = await addRole(formData)
    setIsSubmitting(false)
    if (res.error) alert(res.error)
    else (document.getElementById('add-role-form') as HTMLFormElement).reset()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus role ini?')) {
      const res = await deleteRole(id)
      if (res.error) alert(res.error)
    }
  }

  const protectedRoles = ['Superadmin', 'Admin', 'Pengurus', 'Warga']

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Master Role</h1>
        <p className="text-gray-500 text-sm">Kelola tipe peran dan hak akses pengguna aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" size={18} />
              Tambah Role Baru
            </h3>
            <form id="add-role-form" action={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Cth: Bendahara"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                <Plus size={18} /> {isSubmitting ? 'Menyimpan...' : 'Tambah Role'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Daftar Role</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nama Role</th>
                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialRoles.map((role) => {
                    const isProtected = protectedRoles.includes(role.name)
                    return (
                      <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                          {role.name}
                          {isProtected && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase">Sistem</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(role.id)}
                            disabled={isProtected}
                            className={`p-1.5 rounded-md transition-colors ${
                              isProtected 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
