import { TrendingUp, Wallet, Calendar, ChevronRight, Download } from 'lucide-react';

export default function AnalyticsView() {
  return (
    <div className="space-y-6">
        <section>
          <h2 className="font-display text-2xl font-bold text-on-surface">Analisis Pengeluaran</h2>
          <p className="font-sans text-gray-500 mt-1 text-sm">Pantau distribusi biaya renovasi dan efisiensi anggaran Anda secara real-time.</p>
        </section>

        <div className="grid grid-cols-1 gap-4">
          {/* Summary Card Total*/}
          <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="font-mono text-xs text-gray-500 font-bold uppercase">Total Terpakai</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-display text-3xl font-bold text-on-surface">Rp 142.5M</span>
                      <span className="font-mono text-sm text-red-600 font-bold flex items-center">
                          <TrendingUp size={14} className="mr-1" /> 12%
                      </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="font-mono text-xs text-gray-500 font-bold uppercase">Estimasi Awal</span>
                    <span className="font-sans text-lg font-bold text-gray-700 block mt-1">Rp 125.0M</span>
                </div>
              </div>

              <div className="space-y-1 mb-2">
                <div className="flex justify-between font-mono text-xs font-bold text-on-surface">
                    <span>Progress Anggaran</span>
                    <span>114%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="font-mono text-xs text-red-600 font-bold mt-2">Over budget: Rp 17.5M</p>
              </div>
          </div>

          {/* Sisa Dana */}
          <div className="bg-orange-100 border border-orange-200 p-5 rounded-xl flex flex-col justify-between">
              <Wallet className="text-primary-dark mb-2" size={32} />
              <div>
                <span className="font-mono text-xs text-primary-dark font-bold uppercase">Sisa Dana Proyek</span>
                <span className="font-display text-2xl text-primary-dark font-bold block mt-1">Rp 7.5M</span>
              </div>
          </div>

          {/* Distribusi Chart */}
          <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-lg font-bold">Distribusi Kategori</h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-100 rounded-full font-mono text-xs font-bold text-on-surface">Bulan Ini</button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-full font-mono text-xs font-bold text-gray-500 transition-colors">Semua</button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                    { name: 'Keramik & Lantai', percent: 30, color: 'bg-primary-dark' },
                    { name: 'Kelistrikan', percent: 15, color: 'bg-primary' },
                    { name: 'Tukang & Jasa', percent: 25, color: 'bg-yellow-500' },
                    { name: 'Plafon & Cat', percent: 20, color: 'bg-gray-400' },
                    { name: 'Lain-lain', percent: 10, color: 'bg-gray-200' },
                ].map(item => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between font-mono text-xs font-bold text-gray-700">
                          <span>{item.name}</span>
                          <span>{item.percent}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-sm overflow-hidden border border-outline/50">
                          <div className={`h-full ${item.color} rounded-sm`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                    </div>
                ))}
              </div>
          </div>

          {/* Ringkasan Bulanan */}
          <div className="bg-surface border border-outline rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline">
                <h3 className="font-display text-lg font-bold">Ringkasan Bulanan</h3>
              </div>
              <div className="divide-y divide-outline">
                {/* Okt */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                          <Calendar className="text-primary" size={20} />
                      </div>
                      <div>
                          <span className="font-sans font-bold block">Oktober 2023</span>
                          <span className="font-mono text-xs text-gray-500">32 Transaksi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold block text-on-surface">Rp 42.800.000</span>
                      <span className="font-mono text-xs text-red-600 font-bold">+5.2% vs Sept</span>
                    </div>
                    <ChevronRight className="text-gray-400 ml-2" size={20} />
                </div>
                {/* Sep */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                          <Calendar className="text-primary" size={20} />
                      </div>
                      <div>
                          <span className="font-sans font-bold block">September 2023</span>
                          <span className="font-mono text-xs text-gray-500">45 Transaksi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold block text-on-surface">Rp 38.450.000</span>
                      <span className="font-mono text-xs text-gray-500 font-bold">-1.2% vs Agst</span>
                    </div>
                    <ChevronRight className="text-gray-400 ml-2" size={20} />
                </div>
              </div>
          </div>

          <div className="mt-4 flex justify-center pb-6">
              <button className="bg-white border border-outline text-on-surface px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-gray-50 shadow-sm active:scale-95">
                <Download size={20} />
                Ekspor Laporan PDF
              </button>
          </div>
        </div>
    </div>
  )
}
