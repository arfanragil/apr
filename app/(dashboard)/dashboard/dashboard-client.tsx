'use client'

import { 
  Wallet, TrendingUp, TrendingDown, Users, FileText, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import Link from 'next/link'

type Stats = {
  saldoKas: number
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  tagihanBelumDibayar: number
  wargaCount: number
}

type ChartData = {
  name: string
  pemasukan: number
  pengeluaran: number
}[]

type Transaction = {
  type: string
  date: string
  desc: string
  amount: number
  trx: string
}

type UnpaidBill = {
  id: string
  warga: string
  rumah: string
  periode: string
  nominal: number
  status: string
}

export default function DashboardClient({ 
  stats, 
  chartData,
  recentTransactions,
  recentUnpaid,
  role
}: { 
  stats: Stats, 
  chartData: ChartData,
  recentTransactions: Transaction[],
  recentUnpaid: UnpaidBill[],
  role: string
}) {

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Utama</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan kondisi keuangan perumahan bulan ini.</p>
        </div>
        <div className="flex items-center gap-2">
          {role !== 'warga' && (
            <>
              <Link href="/keuangan/tagihan" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
                Kelola Tagihan
              </Link>
              <Link href="/laporan" className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                Laporan Lengkap
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Primary Stats (Saldo) */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 font-medium text-sm uppercase tracking-wider">Total Saldo Kas</p>
          <h2 className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
            Rp {stats.saldoKas.toLocaleString('id-ID')}
          </h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <TrendingUp size={16} className="text-green-300" />
              <span className="text-sm font-medium">Bulan Ini: +Rp {stats.pemasukanBulanIni.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <TrendingDown size={16} className="text-red-300" />
              <span className="text-sm font-medium">Bulan Ini: -Rp {stats.pengeluaranBulanIni.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Pemasukan Bulan Ini</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            Rp {stats.pemasukanBulanIni.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Pengeluaran Bulan Ini</p>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            Rp {stats.pengeluaranBulanIni.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Tagihan Tertunggak</p>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FileText size={20} className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {stats.tagihanBelumDibayar} <span className="text-sm font-normal text-gray-500">Tagihan</span>
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">Total Warga Aktif</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {stats.wargaCount} <span className="text-sm font-normal text-gray-500">Kepala Keluarga</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Arus Kas 6 Bulan Terakhir</h3>
              <p className="text-xs text-gray-500 mt-1">Perbandingan pemasukan dan pengeluaran per bulan.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => `Rp ${val/1000000}M`}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5 Transaksi Terbaru */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
            {role !== 'warga' && (
              <Link href="/laporan" className="text-xs text-blue-600 font-medium hover:underline">
                Lihat Semua
              </Link>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Belum ada transaksi dicatat.</div>
            ) : (
              recentTransactions.map((trx, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className={`p-2.5 rounded-full shrink-0 ${trx.type === 'masuk' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {trx.type === 'masuk' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate" title={trx.desc}>{trx.desc}</p>
                    <p className="text-xs text-gray-500">{trx.date} • {trx.trx}</p>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${trx.type === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                    {trx.type === 'masuk' ? '+' : '-'}Rp {trx.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5 Tagihan Tertunggak */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Perlu Perhatian (Tagihan Tertunggak / Menunggu Verifikasi)</h3>
            <p className="text-xs text-gray-500 mt-1">5 tagihan terbaru yang memerlukan tindak lanjut.</p>
          </div>
          {role !== 'warga' && (
            <Link href="/keuangan/tagihan" className="text-xs text-blue-600 font-medium hover:underline">
              Kelola Tagihan
            </Link>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium rounded-l-lg">Warga</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium rounded-r-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUnpaid.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada tagihan tertunggak. Luar biasa! 🎉
                  </td>
                </tr>
              ) : (
                recentUnpaid.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{bill.warga}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Rumah: {bill.rumah}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{bill.periode}</td>
                    <td className="px-4 py-3 text-gray-900 font-bold">
                      Rp {Number(bill.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {bill.status === 'Menunggu Verifikasi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-50 text-yellow-700">
                          <Clock size={12} /> Menunggu Verifikasi
                        </span>
                      )}
                      {bill.status === 'Belum Bayar' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700">
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {role === 'warga' ? (
                         <span className="text-xs text-gray-400 italic">Hanya Lihat</span>
                      ) : (
                        <Link href="/keuangan/tagihan" className="text-xs font-medium text-blue-600 hover:underline">
                          Lihat Detail
                        </Link>
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
