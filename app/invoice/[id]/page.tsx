import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './print-button'

export const dynamic = 'force-dynamic'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Ambil data bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .select('*, users(full_name, house_number, phone_number)')
    .eq('id', params.id)
    .single()

  if (billError || !bill) {
    return notFound()
  }

  // Ambil setting IPL
  const { data: settings } = await supabase.from('app_settings').select('*')

  const iuranDasar = parseInt(settings?.find(s => s.key === 'iuran_dasar')?.value || '100000')
  const iuranKas = parseInt(settings?.find(s => s.key === 'iuran_kas')?.value || '30000')
  const iuranSampah = parseInt(settings?.find(s => s.key === 'iuran_sampah')?.value || '20000')

  const appName = settings?.find(s => s.key === 'app_name')?.value || 'ALIF PARK RESIDENCE'
  const appAddress = settings?.find(s => s.key === 'app_address')?.value || 'Jl. Raya Alif Park No. 1, Kecamatan Maju Jaya, Kota Sejahtera 12345'

  // Deteksi apakah warga aktif bayar sampah (jika total tagihan kurang dari total standar)
  const isOccupied = bill.amount >= (iuranDasar + iuranKas + iuranSampah)
  const finalIuranSampah = isOccupied ? iuranSampah : 0

  const isLunas = bill.status === 'Lunas'

  // Format Date Function
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date)
  }

  const invoiceNumber = `INV-${bill.year}${String(bill.month).padStart(2, '0')}-${(bill.users as any)?.house_number}`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

        {/* ACTION BAR (Hidden in print) */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
          <div className="text-sm font-medium flex items-center gap-4">
            <Link
              href="/keuangan/tagihan"
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              &larr; Kembali
            </Link>
            <span>Invoice #{invoiceNumber}</span>
          </div>
          <PrintButton />
        </div>

        {/* INVOICE CONTENT */}
        <div className="p-8 sm:p-12 print:p-0">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-100 pb-8 gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">{appName}</h1>
              <div className="mt-4 text-sm text-gray-500 max-w-xs leading-relaxed whitespace-pre-wrap">
                {appAddress}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-4xl font-black text-gray-200 uppercase tracking-wider mb-2">Invoice</h2>
              <p className="text-sm font-semibold text-gray-900">{invoiceNumber}</p>
              <p className="text-sm text-gray-500 mt-1">Tgl Cetak: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col sm:flex-row justify-between mt-8 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ditagihkan Kepada:</h3>
              <div className="text-gray-900">
                <p className="font-bold text-lg">{(bill.users as any)?.full_name}</p>
                <p className="text-gray-600 mt-1">Blok / No. Rumah: <span className="font-semibold text-gray-900">{(bill.users as any)?.house_number}</span></p>
                <p className="text-gray-600 mt-1">No. HP: {(bill.users as any)?.phone_number || '-'}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detail Tagihan:</h3>
              <div className="text-gray-900">
                <p className="text-gray-600 mt-1">Periode: <span className="font-semibold text-gray-900">{bill.month} / {bill.year}</span></p>
                <p className="text-gray-600 mt-1">Jatuh Tempo: <span className="font-semibold text-red-600">{formatDate(bill.due_date)}</span></p>
                <div className="mt-4 inline-block">
                  {isLunas ? (
                    <div className="px-4 py-2 border-2 border-green-500 text-green-600 font-black text-xl uppercase tracking-widest rounded-lg transform -rotate-2">
                      LUNAS
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-2 border-red-500 text-red-600 font-black text-xl uppercase tracking-widest rounded-lg transform -rotate-2">
                      BELUM BAYAR
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="mt-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 font-bold text-gray-900 uppercase text-sm">Deskripsi</th>
                  <th className="py-3 font-bold text-gray-900 uppercase text-sm text-right">Jumlah (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 text-gray-800">Iuran Dasar (Pemeliharaan Lingkungan)</td>
                  <td className="py-4 text-gray-800 text-right font-medium">{iuranDasar.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-4 text-gray-800">Iuran Kas Warga</td>
                  <td className="py-4 text-gray-800 text-right font-medium">{iuranKas.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-4 text-gray-800">Iuran Sampah {!isOccupied && <span className="text-gray-400 text-xs ml-1">(Rumah Kosong)</span>}</td>
                  <td className="py-4 text-gray-800 text-right font-medium">{finalIuranSampah.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-800">
                  <td className="py-4 font-bold text-gray-900 text-right pr-6 uppercase tracking-wider text-sm">Total Tagihan</td>
                  <td className="py-4 font-black text-2xl text-blue-600 text-right">
                    Rp {bill.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* FOOTER */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-end">
            <div>
              <p className="font-bold text-gray-700 mb-1">Catatan:</p>
              <p>1. Pembayaran sah apabila sudah diverifikasi oleh Pengurus/Bendahara.</p>
              <p>2. Mohon simpan invoice ini sebagai bukti tagihan/pembayaran yang sah.</p>
            </div>
            <div className="text-center pb-2">
              <p className="mb-12">Hormat Kami,</p>
              <p className="font-bold text-gray-900">Pengurus</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
