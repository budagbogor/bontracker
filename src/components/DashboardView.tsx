import { Wallet, Ruler, HardHat, Wrench, PlusCircle, Paintbrush, Banknote, Hammer } from 'lucide-react';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <section className="bg-surface border border-outline p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute -top-4 -right-4 p-4 opacity-5 text-primary-dark">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">Total Pengeluaran</p>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-4">Rp 48.250.000</h2>
          
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-xs text-gray-500">Progres Anggaran (65%)</span>
            <span className="font-mono text-sm text-primary font-bold">Sisa: Rp 26.750.000</span>
          </div>
          
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-outline p-4 rounded-xl flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform shadow-sm">
          <Ruler className="text-primary" size={28} />
          <div>
            <p className="font-mono text-xs text-gray-500 mb-1">Material</p>
            <p className="font-mono text-sm font-bold text-on-surface">Rp 28.5M</p>
          </div>
        </div>
        
        <div className="bg-surface border border-outline p-4 rounded-xl flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform shadow-sm">
          <HardHat className="text-gray-600" size={28} />
          <div>
            <p className="font-mono text-xs text-gray-500 mb-1">Tukang</p>
            <p className="font-mono text-sm font-bold text-on-surface">Rp 15.2M</p>
          </div>
        </div>
        
        <div className="bg-surface border border-outline p-4 rounded-xl flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform shadow-sm">
          <Wrench className="text-gray-500" size={28} />
          <div>
            <p className="font-mono text-xs text-gray-500 mb-1">Alat</p>
            <p className="font-mono text-sm font-bold text-on-surface">Rp 4.55M</p>
          </div>
        </div>
        
        <button className="bg-primary text-white p-4 items-center justify-center rounded-xl flex flex-col h-32 chiseled-btn hover:-translate-y-1 transition-transform shadow-md">
          <PlusCircle size={32} className="mb-2" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Tambah</span>
        </button>
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-lg font-bold text-on-surface">Transaksi Terbaru</h3>
          <button className="font-mono text-xs text-primary font-bold hover:underline">Lihat Semua</button>
        </div>
        
        <div className="space-y-3">
          {[
            { id: 1, title: 'Cat Dinding Jotun', date: '24 Okt 2023', category: 'Material', amount: '1.250.000', icon: Paintbrush },
            { id: 2, title: 'Upah Tukang Mingguan', date: '22 Okt 2023', category: 'Tukang', amount: '3.500.000', icon: Banknote },
            { id: 3, title: 'Sewa Drill Beton', date: '20 Okt 2023', category: 'Alat', amount: '450.000', icon: Hammer },
          ].map((trx) => (
            <div key={trx.id} className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-primary">
                  <trx.icon size={24} />
                </div>
                <div>
                  <p className="font-bold text-on-surface mb-0.5">{trx.title}</p>
                  <p className="font-mono text-xs text-gray-500">{trx.date} • {trx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-on-surface mb-1">Rp {trx.amount}</p>
                <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Berhasil</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Visualization */}
      <section className="bg-surface border border-outline rounded-xl overflow-hidden shadow-sm">
        <div className="h-48 relative">
          <img 
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800&h=400" 
            alt="Project Floor" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
            <p className="text-white/80 font-mono text-xs uppercase tracking-widest mb-1">Tahap Saat Ini</p>
            <h4 className="text-white font-display text-xl font-bold">Finishing Lantai 1</h4>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between bg-surface">
          <div className="flex -space-x-3">
            {[1, 2].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=64&h=64&auto=format" alt="worker" className="opacity-50 object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-white flex items-center justify-center text-[10px] font-bold">
              +3
            </div>
          </div>
          <p className="font-mono text-xs text-gray-500">Estimasi Selesai: 15 Nov</p>
        </div>
      </section>
    </div>
  );
}
