import { Camera, Store, Calendar, Tags, Save, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { scanReceipt, createExpense, type OcrResult } from '../lib/api';

export default function ReceiptsView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError(null);
    setSaved(false);
    setOcrResult(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);

      // Run OCR
      setIsAnalyzing(true);
      try {
        const result = await scanReceipt(base64);
        setOcrResult(result);

        // Auto-fill form
        if (result.store) setStoreName(result.store);
        if (result.date) setDate(result.date);
        if (result.category) setCategory(result.category);
        if (result.total) setTotal(result.total.toString());
        if (result.items && result.items.length > 0) {
          const itemNames = result.items.map(i => `${i.name}${i.qty > 1 ? ` x${i.qty}` : ''}`).join(', ');
          setNotes(itemNames);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memproses struk');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImagePreview(null);
    setOcrResult(null);
    setError(null);
    setSaved(false);
    setStoreName('');
    setDate('');
    setCategory('');
    setTotal('');
    setNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!total || parseFloat(total) <= 0) {
      setError('Total nilai harus diisi');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const title = notes
        ? notes.split(',')[0].trim()
        : storeName || 'Pengeluaran dari struk';

      await createExpense({
        title,
        amount: total,
        category: category || 'Lainnya',
        store: storeName || undefined,
        date: date ? new Date(date).toISOString() : undefined,
        description: notes || undefined,
      });

      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">Input Struk Baru</h2>
        <p className="font-sans text-gray-500 mt-1 text-sm">Foto struk belanja, AI akan membaca datanya otomatis.</p>
      </div>

      {/* Camera / OCR section */}
      <section>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onClick={!imagePreview ? () => fileInputRef.current?.click() : undefined}
          className={`border-2 border-dashed border-primary/40 bg-surface rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] transition-all
            ${!imagePreview ? 'cursor-pointer hover:bg-orange-50 active:scale-[0.99]' : ''}`}
        >
          {!isAnalyzing && !imagePreview && (
            <div className="text-center">
              <Camera className="text-primary mx-auto mb-4" size={48} />
              <p className="font-mono text-sm text-primary font-bold uppercase">Foto Bon / Upload Gambar</p>
              <p className="font-mono text-xs text-gray-500 mt-2">Format: JPG, PNG (Maks. 5MB)</p>
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-mono text-xs font-bold flex items-center gap-2"
                >
                  <Upload size={14} />
                  Pilih File
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
              <p className="font-mono text-sm text-primary font-bold">Menganalisa Struk dengan AI...</p>
              <p className="font-mono text-xs text-gray-500 mt-1">Membaca teks dan mengenali data</p>
            </div>
          )}

          {imagePreview && !isAnalyzing && (
            <div className="w-full relative">
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="w-full max-h-56 object-contain rounded-lg border border-outline"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors"
                aria-label="Reset"
              >
                <X size={16} />
              </button>
              {ocrResult && (
                <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1 backdrop-blur-sm">
                  <CheckCircle2 size={12} />
                  OCR Berhasil
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-mono text-xs">
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          Transaksi berhasil disimpan ke database!
          <button onClick={handleReset} className="ml-auto text-green-600 underline font-bold">Input Baru</button>
        </div>
      )}

      {/* OCR Items Preview */}
      {ocrResult && ocrResult.items && ocrResult.items.length > 0 && (
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="font-mono text-xs text-blue-700 font-bold uppercase mb-2">Item Terdeteksi ({ocrResult.items.length})</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {ocrResult.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-blue-900">{item.name} {item.qty > 1 && <span className="text-blue-500">x{item.qty}</span>}</span>
                <span className="font-mono text-blue-700 font-bold">Rp {item.price?.toLocaleString('id-ID') || '-'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 bg-surface p-5 rounded-xl border border-outline shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Nama Toko</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Depo Bangunan"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Tanggal</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Kategori</label>
            <div className="relative">
              <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none bg-transparent"
              >
                <option value="">Pilih...</option>
                <option value="Material">Material</option>
                <option value="Alat">Peralatan</option>
                <option value="Tukang">Tukang</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Total Nilai</label>
          <div className="relative">
            <span className="font-mono text-sm font-bold text-primary absolute left-4 top-1/2 -translate-y-1/2">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-display text-xl text-primary font-bold"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Catatan (Opsional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detail barang atau keperluan khusus..."
            className="w-full px-4 py-3 rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || saved}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl chiseled-btn flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Menyimpan...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={20} />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Transaksi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
