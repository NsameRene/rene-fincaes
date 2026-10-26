import React from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';

export const FinancialOverviewCard: React.FC = () => {
  const { 
    totalBalance, 
    monthlyIncome, 
    monthlyExpenditure, 
    monthlyNetFlow, 
    prevMonthExpenditure, 
    hideBalance, 
    toggleHideBalance, 
    settings,
    overallBudgetAmount,
    remainingMonthlyBudget 
  } = useFinance();

  // Month-over-month calculation
  const momPct = prevMonthExpenditure > 0
    ? Math.round(((monthlyExpenditure - prevMonthExpenditure) / prevMonthExpenditure) * 100)
    : null;

  return (
    <div className="bg-[#17233B] text-white rounded-xl p-5 border border-[#222C3E] shadow-xs">
      {/* Top row: Label + Eye toggle + Offline badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[13px] text-[#8E98A8]">Total balance</span>
          <button
            onClick={toggleHideBalance}
            className="text-[#8E98A8] hover:text-white transition-colors p-0.5"
            aria-label="Toggle amount visibility"
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <span className="text-[11px] text-[#8E98A8] font-normal">Offline · SQLite</span>
      </div>

      {/* Main Total Balance */}
      <div className="mt-2 mb-4">
        <div className="text-[32px] font-semibold tracking-tight text-white tabular-nums leading-tight">
          {hideBalance ? '••••••••' : formatCurrency(totalBalance, settings.default_currency)}
        </div>
      </div>

      {/* Monthly Cash Flow: Income & Expenditure side-by-side */}
      <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-[#222C3E]">
        <div>
          <div className="flex items-center space-x-1.5 text-[12px] text-[#8E98A8] mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#2EBD85]" />
            <span>Monthly income</span>
          </div>
          <span className="text-[15px] font-medium text-white tabular-nums block truncate">
            {hideBalance ? '••••••' : formatCurrency(monthlyIncome, settings.default_currency)}
          </span>
        </div>

        <div>
          <div className="flex items-center space-x-1.5 text-[12px] text-[#8E98A8] mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#F25A5A]" />
            <span>Monthly expenses</span>
          </div>
          <span className="text-[15px] font-medium text-white tabular-nums block truncate">
            {hideBalance ? '••••••' : formatCurrency(monthlyExpenditure, settings.default_currency)}
          </span>
        </div>
      </div>

      {/* Net Cash Flow & MoM comparison footer */}
      <div className="mt-3.5 pt-3 border-t border-[#222C3E] flex items-center justify-between text-[12px]">
        <div className="flex items-center space-x-1.5">
          <span className="text-[#8E98A8]">Net flow:</span>
          <span
            className={`font-medium tabular-nums ${
              monthlyNetFlow >= 0 ? 'text-[#2EBD85]' : 'text-[#F25A5A]'
            }`}
          >
            {hideBalance ? '••••' : formatCurrency(monthlyNetFlow, settings.default_currency)}
          </span>
        </div>

        {momPct !== null && (
          <div className="flex items-center space-x-1 text-[11px]">
            {momPct > 0 ? (
              <span className="text-[#F25A5A] flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +{momPct}% vs last mo.
              </span>
            ) : (
              <span className="text-[#2EBD85] flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" /> {momPct}% vs last mo.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Remaining Budget Notification */}
      {overallBudgetAmount !== null && (
        <div className="mt-3 pt-2.5 border-t border-[#222C3E] flex items-center justify-between text-[12px]">
          <span className="text-[#8E98A8]">Monthly budget left</span>
          <span className="font-medium tabular-nums text-white">
            {hideBalance ? '••••' : formatCurrency(remainingMonthlyBudget || 0, settings.default_currency)}
          </span>
        </div>
      )}
    </div>
  );
};
