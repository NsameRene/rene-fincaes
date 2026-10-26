import React from 'react';
import { Eye, EyeOff, ShieldCheck, Wallet, PieChart, Target, LayoutDashboard } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const Header: React.FC = () => {
  const { settings, hideBalance, toggleHideBalance, activeTab, setActiveTab } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#131B2A] border-b border-[#E6E9EF] dark:border-[#1E2738] pt-safe px-5 pb-2.5 transition-colors duration-150">
      <div className="flex items-center justify-between">
        {/* Logo and Greeting */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-[#E6E9EF] dark:border-[#243147] flex-shrink-0 flex items-center justify-center">
            <img 
              src="/assets/aistudio/rene_finance_38616079.jpg" 
              alt="Rene Finance" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="leading-tight">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-[15px] text-[#202633] dark:text-[#F1F5F9] tracking-tight">
                Rene Finance
              </span>
              <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] font-medium bg-[#F1F3F7] dark:bg-[#1A2334] px-1.5 py-0.2 rounded">
                {settings.default_currency}
              </span>
            </div>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              {settings.display_name ? `Account · ${settings.display_name}` : 'Personal portfolio'}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={toggleHideBalance}
            title={hideBalance ? 'Show balance' : 'Hide balance'}
            className="p-1.5 text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white rounded-md hover:bg-[#F3F5F8] dark:hover:bg-[#1E293B] transition-colors"
            aria-label="Toggle balance visibility"
          >
            {hideBalance ? <EyeOff className="w-4 h-4 text-[#B7791F]" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <div 
            title="100% Offline • No remote server" 
            className="flex items-center space-x-1 text-[#16845B] text-[11px] font-medium bg-[#EBF7F2] dark:bg-[#102A21] px-2 py-0.5 rounded-md"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs: Understated segmented control */}
      <div className="flex items-center space-x-1 mt-2.5 pt-1.5 border-t border-[#F0F2F6] dark:border-[#1A2333] overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2.5 py-1 rounded-md text-[12px] transition-colors whitespace-nowrap font-medium ${
            activeTab === 'home'
              ? 'text-[#2457E6] dark:text-[#4B79F5] font-semibold bg-[#EBF0FC] dark:bg-[#1A284A]'
              : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-2.5 py-1 rounded-md text-[12px] flex items-center space-x-1 transition-colors whitespace-nowrap font-medium ${
            activeTab === 'accounts'
              ? 'text-[#2457E6] dark:text-[#4B79F5] font-semibold bg-[#EBF0FC] dark:bg-[#1A284A]'
              : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
          }`}
        >
          <Wallet className="w-3 h-3" />
          <span>Accounts</span>
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-2.5 py-1 rounded-md text-[12px] flex items-center space-x-1 transition-colors whitespace-nowrap font-medium ${
            activeTab === 'budgets'
              ? 'text-[#2457E6] dark:text-[#4B79F5] font-semibold bg-[#EBF0FC] dark:bg-[#1A284A]'
              : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
          }`}
        >
          <PieChart className="w-3 h-3" />
          <span>Budgets</span>
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`px-2.5 py-1 rounded-md text-[12px] flex items-center space-x-1 transition-colors whitespace-nowrap font-medium ${
            activeTab === 'savings'
              ? 'text-[#2457E6] dark:text-[#4B79F5] font-semibold bg-[#EBF0FC] dark:bg-[#1A284A]'
              : 'text-[#737B89] hover:text-[#202633] dark:text-[#8E98A8] dark:hover:text-white'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>Savings</span>
        </button>
      </div>
    </header>
  );
};
