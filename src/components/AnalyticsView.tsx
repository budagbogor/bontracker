import { useEffect, useState } from 'react';
import { TrendingUp, Wallet, Loader2, Package, Ruler, HardHat, Wrench } from 'lucide-react';
import { getDashboardSummary, type DashboardSummary } from '../lib/api';

const categoryColors: Record<string, string> = {
  Material: 'bg-orange-500',
  Tukang: 'bg-blue-500',
  Alat: 'bg-gray-500',
  Lainnya: 'bg-purple-500',
};

const categoryIcons: Record<string, React.ElementType> = {
  Material: Ruler,
  Tukang: HardHat,
  Alat: Wrench,
};

export default function AnalyticsView() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
      </div>
    );
  }

  if (!data) return null;

  const totalSpent = parseFloat(data.totalSpent);
  const totalBudget = data.budget ? parseFloat(data.budget.totalBudget) : 0;
  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;

  // Calculate category percentages
  const totalCategorySum = data.byCategory.reduce((sum, c) => sum + parseFloat(c.total), 0);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-display text-2xl font-bold text-on-surface">Analisis Pengeluaran</h2>
        <p className="font-sans text-gray-500 mt-1 text-sm">Pantau distribusi biaya dan efisiensi anggaran.</p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {/* Summary Card Total */}
        {totalBudget > 0 && (
          <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-xs text-gray-500 font-bold uppercase">Total Terpakai</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-3xl font-bold text-on-surface">
                    Rp {(totalSpent / 1_000_000).toFixed(1)}M
                  </span>
                  {isOverBudget && (
                    <span className="font-mono text-sm text-red-600 font-bold flex items-center">
                      <TrendingUp size={14} className="mr-1" /> Over
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-gray-500 font-bold uppercase">Anggaran</span>
                <span className="font-sans text-lg font-bold text-gray-700 block mt-1">
                  Rp {(totalBudget / 1_000_000).toFixed(1)}M
                </span>
              </div>
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex justify-between font-mono text-xs font-bold text-on-surface">
                <span>Progress Anggaran</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-primary'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              {isOverBudget ? (
                <p className="font-mono text-xs text-red-600 font-bold mt-2">
                  Over budget: Rp {Math.abs(remaining).toLocaleString('id-ID')}
                </p>
              ) : (
                <p className="font-mono text-xs text-green-600 font-bold mt-2">
                  Sisa: Rp {remaining.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sisa Dana */}
        {totalBudget > 0 && (
          <div className={`p-5 rounded-xl flex flex-col justify-between ${isOverBudget ? 'bg-red-100 border border-red-200' : 'bg-orange-100 border border-orange-200'}`}>
            <Wallet className={isOverBudget ? 'text-red-700 mb-2' : 'text-primary-dark mb-2'} size={32} />
            <div>
              <span className={`font-mono text-xs font-bold uppercase ${isOverBudget ? 'text-red-700' : 'text-primary-dark'}`}>
                {isOverBudget ? 'Kelebihan Pengeluaran' : 'Sisa Dana'}
              </span>
              <span className={`font-display text-2xl font-bold block mt-1 ${isOverBudget ? 'text-red-700' : 'text-primary-dark'}`}>
                Rp {(Math.abs(remaining) / 1_000_000).toFixed(1)}M
              </span>
            </div>
          </div>
        )}

        {/* No budget message */}
        {totalBudget === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl">
            <p className="font-sans text-sm text-yellow-800 font-medium">
              Belum ada anggaran yang diatur. Atur anggaran di menu Pengaturan untuk melihat analisis progress.
            </p>
          </div>
        )}

        {/* Distribusi Kategori */}
        {data.byCategory.length > 0 && (
          <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm">
            <h3 className="font-display text-lg font-bold mb-6">Distribusi Kategori</h3>
            <div className="space-y-4">
              {data.byCategory.map((cat) => {
                const percent = totalCategorySum > 0 ? (parseFloat(cat.total) / totalCategorySum) * 100 : 0;
                const color = categoryColors[cat.category] || 'bg-gray-400';
                const Icon = categoryIcons[cat.category] || Package;
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-gray-500" />
                        <span className="font-mono text-xs font-bold text-gray-700">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-500">
                          Rp {(parseFloat(cat.total) / 1_000_000).toFixed(1)}M
                        </span>
                        <span className="font-mono text-xs font-bold text-gray-700">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-sm overflow-hidden border border-outline/50">
                      <div className={`h-full ${color} rounded-sm`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.byCategory.length === 0 && (
          <div className="bg-surface border border-outline p-8 rounded-xl shadow-sm text-center">
            <p className="font-mono text-sm text-gray-400">Belum ada data pengeluaran untuk dianalisis</p>
          </div>
        )}

        {/* Transaksi Summary */}
        {data.recentExpenses.length > 0 && (
          <div className="bg-surface border border-outline p-5 rounded-xl shadow-sm">
            <h3 className="font-display text-lg font-bold mb-3">Ringkasan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono text-xs text-gray-500 font-bold uppercase">Total Transaksi</p>
                <p className="font-display text-2xl font-bold text-on-surface mt-1">
                  {data.byCategory.reduce((sum, c) => sum + c.count, 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-mono text-xs text-gray-500 font-bold uppercase">Kategori</p>
                <p className="font-display text-2xl font-bold text-on-surface mt-1">
                  {data.byCategory.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
