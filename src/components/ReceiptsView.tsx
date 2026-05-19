import { Camera, Store, Calendar, Tags, Save } from 'lucide-react';
import { useState } from 'react';

export default function ReceiptsView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setScanned(true);
      }, 1500);
  };

  return (
    <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">Input Struk Baru</h2>
          <p className="font-sans text-gray-500 mt-1 text-sm">Lacak pengeluaran renovasi Anda dengan presisi.</p>
        </div>

        {/* Camera / OCR section */}
        <section>
          <div 
              onClick={!scanned ? handleScan : undefined}
              className={`border-2 border-dashed border-primary/40 bg-surface rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] transition-all
              ${!scanned ? 'cursor-pointer hover:bg-orange-50 active:scale-[0.99]' : ''}`}
          >
              {!isAnalyzing && !scanned && (
                <div className="text-center">
                    <Camera className="text-primary mx-auto mb-4" size={48} />
                    <p className="font-mono text-sm text-primary font-bold uppercase">Foto Bon / Scan OCR</p>
                    <p className="font-mono text-xs text-gray-500 mt-2">Format: JPG, PNG, PDF (Maks. 5MB)</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="font-mono text-sm text-primary font-bold">Menganalisa Struk...</p>
                </div>
              )}
              {scanned && (
                <div className="w-full h-48 rounded-lg overflow-hidden border border-outline shadow-sm relative">
                    <img src="https://images.unsplash.com/photo-1554774853-719586f82d77?auto=format&fit=crop&q=80&w=800" alt="Receipt" className="w-full h-full object-cover" />
                    <button onClick={() => setScanned(false)} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Reset</button>
                </div>
              )}
          </div>
        </section>

        {/* Form */}
        <form className="space-y-4 bg-surface p-5 rounded-xl border border-outline shadow-sm">
          <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Nama Toko</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" defaultValue={scanned ? "Mitra10 Percetakan Negara" : ""} placeholder="Contoh: Depo Bangunan" className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Tanggal</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="date" defaultValue={scanned ? "2023-10-24" : ""} className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Kategori</label>
                <div className="relative">
                    <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select defaultValue={scanned ? "material" : ""} className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent">
                      <option value="">Pilih...</option>
                      <option value="material">Material</option>
                      <option value="tools">Peralatan</option>
                      <option value="labor">Tukang</option>
                      <option value="other">Lainnya</option>
                    </select>
                </div>
              </div>
          </div>

          <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Total Nilai</label>
              <div className="relative">
                <span className="font-mono text-sm font-bold text-primary absolute left-4 top-1/2 -translate-y-1/2">Rp</span>
                <input type="number" defaultValue={scanned ? "1250000" : ""} placeholder="0" className="w-full pl-12 pr-4 py-4 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-display text-xl text-primary font-bold" />
              </div>
          </div>

          <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Catatan (Opsional)</label>
              <textarea rows={2} placeholder="Detail barang atau keperluan khusus..." className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"></textarea>
          </div>

          <div className="pt-2">
              <button type="button" className="w-full bg-primary text-white font-bold py-4 rounded-xl chiseled-btn flex items-center justify-center gap-3">
                <Save size={20} />
                Simpan Transaksi
              </button>
          </div>
        </form>
    </div>
  )
}
