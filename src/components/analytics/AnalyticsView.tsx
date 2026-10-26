import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';

export const AnalyticsView: React.FC = () => {
  const { transactions, categories, insights, settings } = useFinance();

  const [timeRange, setTimeRange] = useState<'this_month' | 'last_month' | 'last_90' | 'all'>('this_month');

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Determine date prefix or filter based on range
  const { filteredTxs, periodLabel, prevPeriodTxs } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const curMonthPrefix = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(curYear, curMonth - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    if (timeRange === 'this_month') {
      return {
        filteredTxs: transactions.filter(t => t.date.startsWith(curMonthPrefix)),
        periodLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        prevPeriodTxs: transactions.filter(t => t.date.startsWith(prevMonthPrefix)),
      };
    } else if (timeRange === 'last_month') {
      const prevPrevDate = new Date(curYear, curMonth - 2, 1);
      const prevPrevPrefix = `${prevPrevDate.getFullYear()}-${String(prevPrevDate.getMonth() + 1).padStart(2, '0')}`;
      return {
        filteredTxs: transactions.filter(t => t.date.startsWith(prevMonthPrefix)),
        periodLabel: prevMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        prevPeriodTxs: transactions.filter(t => t.date.startsWith(prevPrevPrefix)),
      };
    } else if (timeRange === 'last_90') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      const cutoff = ninetyDaysAgo.toISOString().slice(0, 10);
      return {
        filteredTxs: transactions.filter(t => t.date >= cutoff),
        periodLabel: 'Past 90 days',
        prevPeriodTxs: [],
      };
    } else {
      return {
        filteredTxs: transactions,
        periodLabel: 'All time',
        prevPeriodTxs: [],
      };
    }
  }, [transactions, timeRange]);

  // Calculations
  const incomeTotal = useMemo(() => {
    return filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [filteredTxs]);

  const expenseTotal = useMemo(() => {
    return filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [filteredTxs]);

  const netCashFlow = incomeTotal - expenseTotal;

  // Average daily spending & highest spending day
  const { avgDailySpending, highestSpendDay } = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const expenses = filteredTxs.filter(t => t.type === 'expense');

    for (const t of expenses) {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
    }

    const daysCount = Object.keys(dailyMap).length || 1;
    const avg = expenseTotal / daysCount;

    let maxDay = { date: 'None', amount: 0 };
    for (const [d, amt] of Object.entries(dailyMap)) {
      if (amt > maxDay.amount) {
        maxDay = { date: d, amount: amt };
      }
    }

    return {
      avgDailySpending: avg,
      highestSpendDay: maxDay,
    };
  }, [filteredTxs, expenseTotal]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const catTotals: Record<string, number> = {};
    const expenses = filteredTxs.filter(t => t.type === 'expense');

    for (const t of expenses) {
      const cid = t.category_id || 'other';
      catTotals[cid] = (catTotals[cid] || 0) + t.amount;
    }

    return Object.entries(catTotals)
      .map(([cid, amount]) => {
        const cat = catMap.get(cid);
        return {
          id: cid,
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#94a3b8',
          amount,
          percentage: expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs, catMap, expenseTotal]);

  return (
    <div className="p-4 space-y-4 pb-safe-nav">
      {/* Header & Time range selector */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Analytics
          </h1>
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
            Offline audit
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#E6E9EF]/60 dark:bg-[#0E131F] rounded-lg text-[12px]">
          {[
            { id: 'this_month', label: 'This month' },
            { id: 'last_month', label: 'Last month' },
            { id: 'last_90', label: '90 days' },
            { id: 'all', label: 'All time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id as any)}
              className={`py-1.5 rounded-md text-center font-medium transition-all ${
                timeRange === tab.id
                  ? 'bg-white dark:bg-[#161F30] text-[#202633] dark:text-[#F3F5F9] shadow-2xs'
                  : 'text-[#737B89] dark:text-[#8E98A8] hover:text-[#202633] dark:hover:text-[#F3F5F9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards: Income vs Expenditure on neutral surfaces */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] p-3.5 rounded-xl shadow-2xs">
          <div className="flex items-center space-x-1.5 text-[#16845B] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Income</span>
          </div>
          <span className="text-[18px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] block">
            {formatCurrency(incomeTotal, settings.default_currency)}
          </span>
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5 block">
            Recorded receipts
          </span>
        </div>

        <div className="bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] p-3.5 rounded-xl shadow-2xs">
          <div className="flex items-center space-x-1.5 text-[#D64545] mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Expenses</span>
          </div>
          <span className="text-[18px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] block">
            {formatCurrency(expenseTotal, settings.default_currency)}
          </span>
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5 block">
            Recorded spend
          </span>
        </div>
      </div>

      {/* Net Cash Flow Summary Card */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-[#737B89] dark:text-[#8E98A8]">
            Net cash flow ({periodLabel})
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
              netCashFlow >= 0
                ? 'bg-[#16845B]/10 text-[#16845B]'
                : 'bg-[#D64545]/10 text-[#D64545]'
            }`}
          >
            {netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>

        <div className="text-[24px] font-semibold tabular-nums text-[#202633] dark:text-[#F3F5F9]">
          {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, settings.default_currency)}
        </div>

        {/* Visual Bar Comparison */}
        {(incomeTotal > 0 || expenseTotal > 0) && (
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full bg-[#E6E9EF] dark:bg-[#222C3E] rounded-full overflow-hidden flex">
              <div
                className="bg-[#16845B] transition-all duration-300"
                style={{
                  width: `${(incomeTotal / Math.max(incomeTotal + expenseTotal, 1)) * 100}%`,
                }}
              />
              <div
                className="bg-[#D64545] transition-all duration-300"
                style={{
                  width: `${(expenseTotal / Math.max(incomeTotal + expenseTotal, 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              <span className="text-[#16845B]">
                Income ({Math.round((incomeTotal / Math.max(incomeTotal + expenseTotal, 1)) * 100)}%)
              </span>
              <span className="text-[#D64545]">
                Expenses ({Math.round((expenseTotal / Math.max(incomeTotal + expenseTotal, 1)) * 100)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics: Daily Average & Peak Spending Day */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#161F30] rounded-xl p-3.5 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs">
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block">Daily average</span>
          <span className="text-[16px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] mt-1 block">
            {formatCurrency(Math.round(avgDailySpending), settings.default_currency)}
          </span>
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5 block">Active spend days</span>
        </div>

        <div className="bg-white dark:bg-[#161F30] rounded-xl p-3.5 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs">
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block">Peak spend day</span>
          <span className="text-[16px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] mt-1 block truncate">
            {highestSpendDay.amount > 0 ? formatCurrency(highestSpendDay.amount, settings.default_currency) : 'N/A'}
          </span>
          <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5 block truncate">
            {highestSpendDay.date !== 'None' ? highestSpendDay.date : 'No records'}
          </span>
        </div>
      </div>

      {/* Top Expenditure Categories Breakdown with Hairline Bars */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Expenses by category
          </h2>
          <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">{categoryBreakdown.length} categories</span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="text-center py-6 text-[12px] text-[#737B89] dark:text-[#8E98A8]">
            No expenses found for {periodLabel}.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {categoryBreakdown.map(cat => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#202633] dark:text-[#F3F5F9] truncate font-normal">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <span className="font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9]">
                      {formatCurrency(cat.amount, settings.default_currency)}
                    </span>
                    <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] tabular-nums w-8 text-right">
                      {Math.round(cat.percentage)}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#E6E9EF] dark:bg-[#222C3E] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rule-Based Financial Insights */}
      <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            System audit & insights
          </h2>
          <span className="text-[11px] text-[#16845B] font-medium">Deterministic</span>
        </div>

        {insights.length === 0 ? (
          <div className="text-[12px] text-[#737B89] dark:text-[#8E98A8] py-3 text-center">
            As you log more transactions, Rene Finance will automatically detect spending shifts, budget limits, and category trends.
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map(i => (
              <div
                key={i.id}
                className="p-3 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] bg-[#F7F8FA] dark:bg-[#0E131F] text-[12px]"
              >
                <div className="font-medium text-[#202633] dark:text-[#F3F5F9]">{i.title}</div>
                <div className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5">{i.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
