import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { PieChart as PieIcon } from 'lucide-react';

export const CategoryDonutChart: React.FC = () => {
  const { transactions, categories, settings } = useFinance();

  const now = new Date();
  const curPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const curExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(curPrefix));
  const totalExpense = curExpenses.reduce((s, t) => s + t.amount, 0);

  // Group by category
  const catMap = new Map(categories.map(c => [c.id, c]));
  const catTotals: Record<string, number> = {};

  for (const t of curExpenses) {
    const cid = t.category_id || 'other';
    catTotals[cid] = (catTotals[cid] || 0) + t.amount;
  }

  const sortedCategories = Object.entries(catTotals)
    .map(([cid, amount]) => {
      const cat = catMap.get(cid);
      return {
        id: cid,
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#94a3b8',
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // SVG donut calculation
  const size = 124;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let strokeDashoffsetAccumulator = 0;

  return (
    <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Category breakdown
          </h2>
          <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">This month</span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] flex items-center justify-center text-[#737B89] dark:text-[#8E98A8]">
          <PieIcon className="w-4 h-4 text-[#2457E6]" />
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="py-7 text-center text-[12px] text-[#737B89] dark:text-[#8E98A8]">
          No expenses recorded this month yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          {/* Donut Ring */}
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-[#E6E9EF] dark:text-[#222C3E]"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {sortedCategories.map(cat => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const offset = strokeDashoffsetAccumulator;
                strokeDashoffsetAccumulator += (cat.percentage / 100) * circumference;

                return (
                  <circle
                    key={cat.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] font-normal">Total</span>
              <span className="text-[13px] font-semibold text-[#202633] dark:text-[#F3F5F9] tabular-nums truncate max-w-[80px]">
                {formatCurrency(totalExpense, settings.default_currency)}
              </span>
            </div>
          </div>

          {/* Category Top List */}
          <div className="flex-1 w-full space-y-2 max-h-36 overflow-y-auto pr-1">
            {sortedCategories.slice(0, 4).map(cat => (
              <div key={cat.id} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center space-x-2 truncate pr-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[#202633] dark:text-[#F3F5F9] truncate font-normal">
                    {cat.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 space-x-1.5">
                  <span className="font-medium text-[#202633] dark:text-[#F3F5F9] tabular-nums">
                    {formatCurrency(cat.amount, settings.default_currency)}
                  </span>
                  <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] tabular-nums">
                    {Math.round(cat.percentage)}%
                  </span>
                </div>
              </div>
            ))}

            {sortedCategories.length > 4 && (
              <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8] text-right pt-0.5">
                +{sortedCategories.length - 4} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
