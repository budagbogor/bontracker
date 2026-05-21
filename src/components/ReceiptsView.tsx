import { Camera, Store, Calendar, Tags, Save, Upload, X, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { scanReceipt, createExpense, getSettings, type OcrResult } from '../lib/api';
import { formatRupiah } from '../lib/utils';

export default function ReceiptsView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null); // null = loading
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [total, setTotal] = useState('');
  const [notes, setNotes] = useState('');

  // Check if API key is configured
  useEffect(() => {
    getSettings()
      .then((data) => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);

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
          const itemDetails = result.items.map(i => {
            const priceStr = i.price ? ` - Rp ${i.price.toLocaleString('id-ID')}` : '';
            const qtyStr = i.qty > 1 ? ` x${i.qty}` : '';
            return `${i.name}${qtyStr}${priceStr}`;
          }).join('\n');
          setNotes(itemDetails);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memproses struk. Pastikan API Key sudah dikonfigurasi di Pengaturan.');
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
        <h2 className="font-display text-2xl font-bold text-on-surface">Scan Struk (OCR)</h2>
        <p className="font-sans text-gray-500 mt-1 text-sm">Upload foto struk, AI akan membaca dan mengisi form otomatis.</p>
      </div>

      {/* API Key Warning */}
      {hasApiKey === false && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-sans text-sm text-yellow-800 font-bold">API Key belum dikonfigurasi</p>
            <p className="font-sans text-xs text-yellow-700 mt-1">
              Fitur OCR membutuhkan API Key dari Sumopod. Buka menu <strong>Pengaturan (⚙️)</strong> → masukkan API Key → klik Simpan.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      {!imagePreview && !ocrResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-blue-600" />
            <p className="font-mono text-xs text-blue-700 font-bold">Cara Kerja</p>
          </div>
          <ol className="font-sans text-xs text-blue-600 space-y-1 list-decimal list-inside">
            <li>Upload foto struk/bon belanja (JPG/PNG, maks 5MB)</li>
            <li>AI akan membaca teks dan mengenali: toko, tanggal, item, total</li>
            <li>Form terisi otomatis — periksa & koreksi jika perlu</li>
            <li>Klik "Simpan Transaksi" untuk menyimpan ke database</li>
          </ol>
        </div>
      )}

      {/* Camera / OCR section */}
      <section>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          onClick={!imagePreview && !isAnalyzing ? () => fileInputRef.current?.click() : undefined}
          className={`border-2 border-dashed border-primary/40 bg-surface rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] transition-all
            ${!imagePreview && !isAnalyzing ? 'cursor-pointer hover:bg-orange-50 active:scale-[0.99]' : ''}`}
        >
          {!isAnalyzing && !imagePreview && (
            <div className="text-center">
              <Camera className="text-primary mx-auto mb-4" size={48} />
              <p className="font-mono text-sm text-primary font-bold uppercase">Foto Bon / Upload Gambar</p>
              <p className="font-mono text-xs text-gray-500 mt-2">Tap area ini atau klik tombol di bawah</p>
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-mono text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <Upload size={14} />
                  Pilih Gambar
                </button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
              <p className="font-mono text-sm text-primary font-bold">Menganalisa Struk dengan AI...</p>
              <p className="font-mono text-xs text-gray-500 mt-1">Proses ini membutuhkan 3-10 detik</p>
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
              {!ocrResult && !error && (
                <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-white text-xs px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1 backdrop-blur-sm">
                  <AlertTriangle size={12} />
                  OCR tidak mengembalikan data
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-sans text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-xs">Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
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
                <span className="font-mono text-blue-700 font-bold">{item.price ? formatRupiah(item.price) : '-'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 bg-surface p-5 rounded-xl border border-outline shadow-sm">
        <p className="font-mono text-xs text-gray-400 uppercase tracking-wider font-bold">Data Transaksi</p>
        
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
          <label className="font-mono text-xs text-gray-500 font-bold uppercase px-1">Rincian Item / Catatan</label>
          <textarea
            rows={4}
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
            className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
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
