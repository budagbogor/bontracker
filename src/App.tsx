/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Settings, 
  LayoutDashboard,
  ReceiptText,
  Camera,
  BarChart3
} from 'lucide-react';
import { cn } from './lib/utils';
import DashboardView from './components/DashboardView';
import ExpensesView from './components/ExpensesView';
import ReceiptsView from './components/ReceiptsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'expenses': return <ExpensesView />;
      case 'receipts': return <ReceiptsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sans text-on-surface">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-xl font-bold text-primary-dark">RenoTrack</h1>
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className="text-primary-dark p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings size={24} />
        </button>
      </header>

      <main className="px-5 pt-6 pb-6 space-y-6 max-w-xl mx-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-around items-center h-[72px] px-2 pb-safe max-w-xl mx-auto left-0 right-0">
        {[
          { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
          { id: 'expenses', label: 'Riwayat', icon: ReceiptText },
          { id: 'receipts', label: 'Struk OCR', icon: Camera },
          { id: 'analytics', label: 'Analisis', icon: BarChart3 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-20 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary " 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full mb-1 transition-all duration-200",
                isActive ? "bg-primary/10" : ""
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "font-mono text-[10px] tracking-wide",
                isActive ? "font-bold" : "font-medium"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

