import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createExpense } from '../lib/api';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Material', 'Tukang', 'Alat', 'Lainnya'];

export default function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Material');
  const [store, setStore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !amount.trim()) {
      setError('Judul dan jumlah wajib diisi');
      return;
    }

    const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus berupa angka positif');
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        title: title.trim(),
        amount: numAmount.toString(),
        category,
        store: store.trim() || undefined,
        date: new Date(date).toISOString(),
        description: description.trim() || undefined,
      });
      // Reset form
      setTitle('');
      setAmount('');
      setCategory('Material');
      setStore('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-on-surface">Tambah Pengeluaran</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Tutup"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Judul *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cat Dinding Jotun"
              className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Jumlah (Rp) *
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 1250000"
              inputMode="numeric"
              className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
            />
          </div>

          {/* Category */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full font-mono text-sm font-bold transition-colors ${
                    category === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Store */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Toko / Sumber
            </label>
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Contoh: Toko Cat Makmur"
              className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans"
            />
          </div>

          {/* Date */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">
              Catatan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              rows={2}
              className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 font-mono text-xs bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Pengeluaran</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
