import { useState, useEffect } from 'react';
import { X, Loader2, Trash2, Save, Pencil } from 'lucide-react';
import { updateExpense, deleteExpense, type Expense } from '../lib/api';
import { formatRupiah } from '../lib/utils';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Material', 'Tukang', 'Alat', 'Lainnya'];

export default function ExpenseDetailModal({ expense, onClose, onSuccess }: ExpenseDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Material');
  const [store, setStore] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when expense changes
  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      // Remove trailing .00 from decimal amount
      const cleanAmount = expense.amount ? parseFloat(expense.amount).toString() : '';
      setAmount(cleanAmount);
      setCategory(expense.category || 'Material');
      setStore(expense.store || '');
      setDate(expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
      setDescription(expense.description || '');
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError(null);
    }
  }, [expense]);

  if (!expense) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !amount.trim()) {
      setError('Judul dan jumlah wajib diisi');
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus berupa angka positif');
      return;
    }

    setLoading(true);
    try {
      await updateExpense(expense.id, {
        title: title.trim(),
        amount: numAmount.toString(),
        category,
        store: store.trim(),
        date: new Date(date).toISOString(),
        description: description.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus pengeluaran');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-on-surface">
            {isEditing ? 'Edit Pengeluaran' : 'Detail Pengeluaran'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-600"
                aria-label="Edit"
              >
                <Pencil size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Tutup">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* View Mode */}
        {!isEditing && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Judul</p>
                <p className="font-bold text-on-surface">{expense.title}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Jumlah</p>
                <p className="font-display text-2xl font-bold text-primary">{formatRupiah(expense.amount)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Kategori</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary rounded-full font-mono text-xs font-bold">{expense.category}</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Tanggal</p>
                  <p className="font-sans text-sm text-on-surface mt-1">{new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              {expense.store && (
                <div>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Toko</p>
                  <p className="font-sans text-sm text-on-surface">{expense.store}</p>
                </div>
              )}
              {expense.description && (
                <div>
                  <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">Rincian Item</p>
                  <pre className="font-sans text-sm text-gray-600 whitespace-pre-wrap mt-1">{expense.description}</pre>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-5 border border-red-300 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 active:scale-[0.98] transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Delete Confirm */}
            {showDeleteConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="font-sans text-sm text-red-700 font-medium">Yakin hapus transaksi ini?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Ya, Hapus
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Judul *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans" />
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Jumlah (Rp) *</label>
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono" />
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full font-mono text-sm font-bold transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Toko / Sumber</label>
              <input type="text" value={store} onChange={(e) => setStore(e.target.value)} className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans" />
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono" />
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5 block">Rincian / Catatan</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-3 bg-white border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans resize-y" />
            </div>

            {error && <p className="text-red-500 font-mono text-xs bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="py-3.5 px-5 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all">
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
