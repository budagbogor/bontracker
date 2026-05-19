import { useEffect, useState } from 'react';
import { Search, Paintbrush, HardHat, Wrench, ChevronRight, TrendingUp, Plus, Package, Loader2 } from 'lucide-react';
import { getExpenses, type Expense } from '../lib/api';
import AddExpenseModal from './AddExpenseModal';

const iconMap: Record<string, React.ElementType> = {
  Material: Paintbrush,
  Tukang: HardHat,
  Alat: Wrench,
};

function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
  const groups: Record<string, Expense[]> = {};
  for (const exp of expenses) {
    const dateKey = new Date(exp.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(exp);
  }
  return groups;
}

export default function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    getExpenses()
      .then(setExpenses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesFilter = filter === 'Semua' || exp.category === filter;
    const matchesSearch = search === '' || 
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      (exp.store && exp.store.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const grouped = groupByDate(filteredExpenses);
  const totalThisMonth = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const maxExpense = expenses.length > 0 
    ? expenses.reduce((max, exp) => parseFloat(exp.amount) > parseFloat(max.amount) ? exp : max, expenses[0])
    : null;

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

  return (
    <div className="space-y-6">
      {/* Search section */}
      <section className="mb-2">
         <h2 className="font-display text-2xl font-bold text-on-surface mb-4">Riwayat Pengeluaran</h2>
         <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari transaksi atau toko..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans shadow-sm" 
            />
         </div>
         <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 no-scrollbar">
            {['Semua', 'Material', 'Tukang', 'Alat', 'Lainnya'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full font-mono text-sm font-bold whitespace-nowrap transition-colors ${f === filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f}
              </button>
            ))}
         </div>
      </section>

      {/* List grouped */}
      <section className="space-y-6">
        {Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <h3 className="font-mono text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">{dateLabel}</h3>
            <div className="space-y-3">
              {items.map((exp) => {
                const Icon = iconMap[exp.category] || Package;
                const colorClass = exp.category === 'Material' ? 'bg-orange-50 text-primary-dark' 
                  : exp.category === 'Tukang' ? 'bg-blue-50 text-blue-700' 
                  : 'bg-gray-100 text-gray-700';
                return (
                  <div key={exp.id} className="bg-surface border border-outline p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{exp.store || exp.title}</p>
                        <p className="font-mono text-xs text-gray-500">
                          {exp.category} • {new Date(exp.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="font-mono text-sm font-bold text-primary">Rp {parseFloat(exp.amount).toLocaleString('id-ID')}</p>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <p className="text-center text-gray-400 font-mono text-sm py-8">Tidak ada transaksi ditemukan</p>
        )}

        {/* Bento Summary Visual */}
        <div className="grid grid-cols-2 gap-4 mt-8 pb-10">
           <div className="bg-primary p-4 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden">
              <TrendingUp className="text-white opacity-20 absolute -right-4 -bottom-4" size={100} />
              <p className="font-mono text-sm text-white/80 font-bold">Total Bulan Ini</p>
              <p className="font-display text-2xl text-white font-bold z-10">
                Rp {(totalThisMonth / 1_000_000).toFixed(1)}M
              </p>
           </div>
           <div className="bg-gray-100 p-4 rounded-2xl flex flex-col justify-between aspect-square border border-outline">
              <p className="font-mono text-sm text-gray-600 font-bold">Transaksi Terbesar</p>
              <div>
                <p className="font-display text-2xl text-on-surface font-bold">
                  {maxExpense ? `Rp ${(parseFloat(maxExpense.amount) / 1_000_000).toFixed(1)}M` : '-'}
                </p>
                <p className="font-mono text-xs text-gray-500">{maxExpense?.title || '-'}</p>
              </div>
           </div>
        </div>
      </section>

      {/* FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
         <Plus size={32} />
      </button>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
