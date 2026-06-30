'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
    >
      <Printer size={16} /> Cetak / PDF
    </button>
  )
}
