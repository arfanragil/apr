import Link from 'next/link'
import { signup } from '@/lib/actions/auth'
import { getAppSettings } from '@/lib/settings'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const settings = await getAppSettings()
  const appName = settings['app_name'] || 'Alief Park Residence'

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{appName}</h1>
        <p className="text-sm text-gray-500 mt-2">Daftar Akun Baru</p>
      </div>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-700" htmlFor="full_name">
          Nama Lengkap
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="full_name"
          placeholder="Nama Lengkap Anda"
          required
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="phone_number">
              No. HP / WA
            </label>
            <input
              className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="phone_number"
              placeholder="Cth: 0812..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700" htmlFor="house_number">
              No. Rumah
            </label>
            <input
              className="mt-1 w-full rounded-md px-4 py-2 bg-inherit border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="house_number"
              placeholder="Cth: Blok A1 No 05"
              required
            />
          </div>
        </div>

        <label className="text-sm font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="email"
          placeholder="anda@email.com"
          required
        />

        <label className="text-sm font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <button
          formAction={signup}
          className="bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 text-white text-sm font-medium transition-colors mb-2"
        >
          Daftar Sekarang
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-50 text-red-600 text-center text-sm rounded-md border border-red-200">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
