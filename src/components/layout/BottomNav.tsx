import React from 'react';
import { Home, ArrowLeftRight, Plus, BarChart3, Settings } from 'lucide-react';
import { useFinance, ActiveTab } from '../../context/FinanceContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddTransaction } = useFinance();

  const isTabActive = (tab: ActiveTab) => {
    if (tab === 'home' && ['home', 'accounts', 'budgets', 'savings'].includes(activeTab)) {
      return activeTab === 'home';
    }
    return activeTab === tab;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-[440px] bg-white dark:bg-[#131B2A] border-t border-[#E6E9EF] dark:border-[#1E2738] px-3 pt-2 pb-safe pointer-events-auto transition-colors duration-150">
        <div className="flex items-center justify-between">
          
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isTabActive('home')
                ? 'text-[#2457E6] dark:text-[#4B79F5]'
                : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className={`text-[11px] mt-1 ${isTabActive('home') ? 'font-semibold' : 'font-normal'}`}>
              Home
            </span>
          </button>

          {/* 2. Activity */}
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'transactions'
                ? 'text-[#2457E6] dark:text-[#4B79F5]'
                : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 stroke-[1.8]" />
            <span className={`text-[11px] mt-1 ${activeTab === 'transactions' ? 'font-semibold' : 'font-normal'}`}>
              Activity
            </span>
          </button>

          {/* 3. Center Add Action: Sleek & Disciplined */}
          <button
            onClick={() => openAddTransaction('expense')}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[#2457E6] dark:text-[#4B79F5] group"
            aria-label="Add transaction"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2457E6] text-white flex items-center justify-center shadow-xs group-hover:bg-[#1C47C4] transition-colors">
              <Plus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11px] mt-1 font-semibold text-[#202633] dark:text-[#F1F5F9]">
              Add
            </span>
          </button>

          {/* 4. Analytics */}
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'analytics'
                ? 'text-[#2457E6] dark:text-[#4B79F5]'
                : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5 stroke-[1.8]" />
            <span className={`text-[11px] mt-1 ${activeTab === 'analytics' ? 'font-semibold' : 'font-normal'}`}>
              Analytics
            </span>
          </button>

          {/* 5. Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'settings'
                ? 'text-[#2457E6] dark:text-[#4B79F5]'
                : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
            <span className={`text-[11px] mt-1 ${activeTab === 'settings' ? 'font-semibold' : 'font-normal'}`}>
              Settings
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};
