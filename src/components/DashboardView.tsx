import { useEffect, useState } from 'react';
import { Wallet, Ruler, HardHat, Wrench, PlusCircle, Paintbrush, Banknote, Hammer, Package, Loader2 } from 'lucide-react';
import { getDashboardSummary, type DashboardSummary } from '../lib/api';
import AddExpenseModal from './AddExpenseModal';

const iconMap: Record<string, React.ElementType> = {
  Ruler, HardHat, Wrench, Paintbrush, Banknote, Hammer, Package,
};

function formatRupiah(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1)}M`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getDashboardSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-mono text-sm">Error: {error}</p>
        <p className="text-gray-500 font-mono text-xs mt-2">Pastikan server backend berjalan (npm run dev:server)</p>
      </div>
    );
  }

  if (!data) return null;

  const totalSpent = parseFloat(data.totalSpent);
  const totalBudget = data.budget ? parseFloat(data.budget.totalBudget) : 75_000_000;
  const progress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <section className="bg-surface border border-outline p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute -top-4 -right-4 p-4 opacity-5 text-primary-dark">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">Total Pengeluaran</p>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-4">
            Rp {totalSpent.toLocaleString('id-ID')}
          </h2>
          
          <div className="flex justify-between items-end mb-2">
            <span className="font-mono text-xs text-gray-500">Progres Anggaran ({progress.toFixed(0)}%)</span>
            <span className="font-mono text-sm text-primary font-bold">Sisa: Rp {remaining.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-2 gap-4">
        {data.byCategory.map((cat) => {
          const Icon = iconMap[cat.category] || Package;
          return (
            <div key={cat.category} className="bg-surface border border-outline p-4 rounded-xl flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform shadow-sm">
              <Icon className="text-primary" size={28} />
              <div>
                <p className="font-mono text-xs text-gray-500 mb-1">{cat.category}</p>
                <p className="font-mono text-sm font-bold text-on-surface">{formatRupiah(cat.total)}</p>
              </div>
            </div>
          );
        })}
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white p-4 items-center justify-center rounded-xl flex flex-col h-32 chiseled-btn hover:-translate-y-1 transition-transform shadow-md"
        >
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
          {data.recentExpenses.map((trx) => {
            const Icon = iconMap[trx.category] || Package;
            return (
              <div key={trx.id} className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-primary">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface mb-0.5">{trx.title}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {trx.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-on-surface mb-1">Rp {parseFloat(trx.amount).toLocaleString('id-ID')}</p>
                  <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    {trx.status || 'Berhasil'}
                  </span>
                </div>
              </div>
            );
          })}
          {data.recentExpenses.length === 0 && (
            <p className="text-center text-gray-400 font-mono text-sm py-8">Belum ada transaksi</p>
          )}
        </div>
      </section>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
