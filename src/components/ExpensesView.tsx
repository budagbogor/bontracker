import { Search, Paintbrush, HardHat, Wrench, ChevronRight, TrendingUp, Plus } from 'lucide-react';

export default function ExpensesView() {
  return (
    <div className="space-y-6">
      {/* Search section */}
      <section className="mb-2">
         <h2 className="font-display text-2xl font-bold text-on-surface mb-4">Riwayat Pengeluaran</h2>
         <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Cari transaksi atau toko..." className="w-full pl-12 pr-4 py-3 bg-surface border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans shadow-sm" />
         </div>
         <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 no-scrollbar">
            {['Semua', 'Material', 'Tukang', 'Peralatan', 'Lainnya'].map((filter, i) => (
              <button key={filter} className={`px-4 py-2 rounded-full font-mono text-sm font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {filter}
              </button>
            ))}
         </div>
      </section>

      {/* List grouped */}
      <section className="space-y-6">
        <div>
          <h3 className="font-mono text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">Hari Ini, 24 Mei 2024</h3>
          <div className="space-y-3">
             <div className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-primary-dark">
                      <Paintbrush size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-on-surface">Toko Cat Makmur</p>
                      <p className="font-mono text-xs text-gray-500">Material • 14:20</p>
                   </div>
                </div>
                <div className="text-right flex items-center gap-2">
                   <p className="font-mono text-sm font-bold text-primary">Rp 1.250.000</p>
                   <ChevronRight size={16} className="text-gray-400" />
                </div>
             </div>
             <div className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700">
                      <HardHat size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-on-surface">Upah Tukang Kayu</p>
                      <p className="font-mono text-xs text-gray-500">Jasa • 10:00</p>
                   </div>
                </div>
                <div className="text-right flex items-center gap-2">
                   <p className="font-mono text-sm font-bold text-primary">Rp 450.000</p>
                   <ChevronRight size={16} className="text-gray-400" />
                </div>
             </div>
          </div>
        </div>

        <div>
          <h3 className="font-mono text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">Kemarin, 23 Mei 2024</h3>
          <div className="space-y-3">
             <div className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700">
                      <Wrench size={24} />
                   </div>
                   <div>
                      <p className="font-bold text-on-surface">Depo Bangunan Jaya</p>
                      <p className="font-mono text-xs text-gray-500">Material • 16:45</p>
                   </div>
                </div>
                <div className="text-right flex items-center gap-2">
                   <p className="font-mono text-sm font-bold text-primary">Rp 3.780.000</p>
                   <ChevronRight size={16} className="text-gray-400" />
                </div>
             </div>
          </div>
        </div>

        {/* Bento Summary Visual */}
        <div className="grid grid-cols-2 gap-4 mt-8 pb-10">
           <div className="bg-primary p-4 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden">
              <TrendingUp className="text-white opacity-20 absolute -right-4 -bottom-4" size={100} />
              <p className="font-mono text-sm text-white/80 font-bold">Total Bulan Ini</p>
              <p className="font-display text-2xl text-white font-bold z-10">Rp 12.4M</p>
           </div>
           <div className="bg-gray-100 p-4 rounded-2xl flex flex-col justify-between aspect-square border border-outline">
              <p className="font-mono text-sm text-gray-600 font-bold">Transaksi Terbaik</p>
              <div>
                <p className="font-display text-2xl text-on-surface font-bold">Rp 5.2M</p>
                <p className="font-mono text-xs text-gray-500">Keramik Lantai</p>
              </div>
           </div>
        </div>
      </section>

      {/* FAB */}
      <button className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
         <Plus size={32} />
      </button>
    </div>
  )
}
