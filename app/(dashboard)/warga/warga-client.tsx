'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, X, ShieldAlert } from 'lucide-react'
import { adminCreateUser, adminDeleteUser } from '@/lib/actions/users-admin'
import { updateUser } from '@/lib/actions/users'

type Role = { id: string, name: string }
type User = {
  id: string
  email: string
  full_name: string
  phone_number: string
  house_number: string
  status: string
  roles: { name: string }
  role_id: string
}

export default function WargaClient({ initialUsers, roles }: { initialUsers: User[], roles: Role[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredUsers = initialUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.house_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleAdd(formData: FormData) {
    setIsSubmitting(true)
    setErrorMsg('')
    const res = await adminCreateUser(formData)
    setIsSubmitting(false)
    if (res.success) {
      setIsModalOpen(false)
    } else {
      setErrorMsg(res.error || 'Gagal menambahkan user')
    }
  }

  async function handleEditSubmit(formData: FormData) {
    setIsSubmitting(true)
    const res = await updateUser(formData)
    setIsSubmitting(false)
    if (res.success) {
      setEditUser(null)
    } else {
      alert(res.error || 'Gagal menyimpan perubahan')
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus pengguna ini beserta semua data tagihannya?')) {
      const res = await adminDeleteUser(id)
      if (res.error) alert(res.error)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola data warga, pengurus, dan admin.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atau no rumah..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
            <Filter size={16} /> Filter Role
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">No. Rumah</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.full_name}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{user.phone_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.house_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.roles?.name === 'Superadmin' ? 'bg-purple-100 text-purple-700' :
                        user.roles?.name === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                        user.roles?.name === 'Pengurus' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.roles?.name || 'Warga'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditUser(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Tambah Pengguna Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleAdd} className="p-4 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex gap-2 items-start">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" /> {errorMsg}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                <input name="full_name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email (Untuk Login) *</label>
                <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password Sementara *</label>
                <input name="password" type="text" required minLength={6} placeholder="Minimal 6 karakter" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">No. Rumah</label>
                  <input name="house_number" type="text" placeholder="Cth: Blok A1 No 05" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Role *</label>
                  <select name="role_id" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">No. HP / WhatsApp</label>
                <input name="phone_number" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg">Edit Pengguna</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleEditSubmit} className="p-4 space-y-4">
              <input type="hidden" name="id" value={editUser.id} />
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email (Tidak bisa diubah)</label>
                <input type="text" disabled defaultValue={editUser.email} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input name="full_name" type="text" defaultValue={editUser.full_name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">No. Rumah</label>
                  <input name="house_number" type="text" defaultValue={editUser.house_number} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select name="role_id" required defaultValue={editUser.role_id} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">No. HP / WhatsApp</label>
                  <input name="phone_number" type="text" defaultValue={editUser.phone_number} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Status Akun</label>
                  <select name="status" defaultValue={editUser.status || 'Aktif'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Aktif">Aktif</option>
                    <option value="Non Aktif">Non Aktif</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
