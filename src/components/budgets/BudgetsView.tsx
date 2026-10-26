import React, { useState, useMemo } from 'react';
import { PieChart, Plus, AlertTriangle, CheckCircle2, TrendingUp, Edit3, Trash2 } from 'lucide-react';
import { Budget } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { BudgetModal } from '../modals/BudgetModal';

export const BudgetsView: React.FC = () => {
  const { budgets, transactions, categories, deleteBudget, settings } = useFinance();

  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Current month calculation
  const now = new Date();
  const curPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const curExpenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(curPrefix));
  }, [transactions, curPrefix]);

  const totalMonthlySpent = useMemo(() => {
    return curExpenses.reduce((s, t) => s + t.amount, 0);
  }, [curExpenses]);

  // Map category spent
  const catSpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of curExpenses) {
      if (t.category_id) {
        map[t.category_id] = (map[t.category_id] || 0) + t.amount;
      }
    }
    return map;
  }, [curExpenses]);

  const handleEdit = (b: Budget) => {
    setSelectedBudget(b);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 space-y-4 pb-safe-nav">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Budgets
          </h1>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · Day {dayOfMonth} of {daysInMonth}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white text-[12px] font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New budget</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white dark:bg-[#161F30] rounded-xl p-8 text-center border border-[#E6E9EF] dark:border-[#222C3E] space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-[#0E131F] text-[#737B89] dark:text-[#8E98A8] mx-auto flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9]">No budgets configured</h3>
            <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] max-w-xs mx-auto mt-0.5">
              Set an overall monthly spending limit or category targets to monitor your outflow.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-[#2457E6] text-white font-medium text-[13px] hover:bg-[#1d46b8] transition-colors shadow-2xs"
          >
            Create budget
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map(b => {
            const isOverall = b.category_id === null;
            const category = b.category_id ? catMap.get(b.category_id) : null;
            const spent = isOverall ? totalMonthlySpent : (catSpentMap[b.category_id!] || 0);
            const remaining = Math.max(0, b.amount - spent);
            const pct = Math.min(100, Math.round((spent / b.amount) * 100));

            // Projected end-of-month spending
            const projected = dayOfMonth > 0 ? (spent / dayOfMonth) * daysInMonth : spent;
            const projectedPct = Math.round((projected / b.amount) * 100);

            // Alert status
            const isExceeded = spent >= b.amount;
            const isWarning = pct >= b.alert_threshold;

            return (
              <div
                key={b.id}
                className="p-4 bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3"
              >
                {/* Header of budget item */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9]">
                        {isOverall ? 'Total monthly spending' : category?.name || 'Category'}
                      </span>
                      <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                        ({b.period})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                      Alert at {b.alert_threshold}% threshold
                    </span>
                  </div>

                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1.5 text-[#737B89] hover:text-[#2457E6] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="p-1.5 text-[#737B89] hover:text-[#D64545] rounded-md hover:bg-[#D64545]/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-3 gap-2 text-center bg-[#F7F8FA] dark:bg-[#0E131F] p-2.5 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E]">
                  <div>
                    <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] block">Budget</span>
                    <span className="text-[13px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9]">
                      {formatCurrency(b.amount, settings.default_currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] block">Spent</span>
                    <span
                      className={`text-[13px] font-medium tabular-nums ${
                        isExceeded ? 'text-[#D64545]' : 'text-[#202633] dark:text-[#F3F5F9]'
                      }`}
                    >
                      {formatCurrency(spent, settings.default_currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] block">Remaining</span>
                    <span
                      className={`text-[13px] font-medium tabular-nums ${
                        remaining > 0 ? 'text-[#16845B]' : 'text-[#D64545]'
                      }`}
                    >
                      {formatCurrency(remaining, settings.default_currency)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span
                      className={
                        isExceeded
                          ? 'text-[#D64545] font-medium flex items-center'
                          : isWarning
                          ? 'text-[#B7791F] font-medium flex items-center'
                          : 'text-[#737B89] dark:text-[#8E98A8] flex items-center'
                      }
                    >
                      {isExceeded ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#D64545]" />
                          Exceeded by {formatCurrency(spent - b.amount, settings.default_currency)}
                        </>
                      ) : isWarning ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#B7791F]" />
                          Approaching limit
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#16845B]" />
                          On track
                        </>
                      )}
                    </span>
                    <span className="tabular-nums font-medium text-[#202633] dark:text-[#F3F5F9]">
                      {pct}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[#E6E9EF] dark:bg-[#222C3E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-[#D64545]'
                          : isWarning
                          ? 'bg-[#B7791F]'
                          : 'bg-[#2457E6]'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  {/* Projected pacing indicator */}
                  <div className="flex items-center justify-between text-[11px] text-[#737B89] dark:text-[#8E98A8] pt-0.5">
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Projected: {formatCurrency(Math.round(projected), settings.default_currency)} ({projectedPct}%)
                    </span>
                    <span>Pacing: Day {dayOfMonth}/{daysInMonth}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        budget={selectedBudget}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
