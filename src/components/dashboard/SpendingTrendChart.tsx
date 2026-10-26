import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { TrendingDown } from 'lucide-react';

export const SpendingTrendChart: React.FC = () => {
  const { transactions, settings } = useFinance();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Group last 7 days of expenses
  const days: { dateStr: string; label: string; amount: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);

    days.push({ dateStr, label, amount: totalExpense });
  }

  const maxAmount = Math.max(...days.map(d => d.amount), 1);
  const totalWeekly = days.reduce((s, d) => s + d.amount, 0);

  // SVG dimensions
  const width = 320;
  const height = 110;
  const paddingX = 20;
  const paddingY = 14;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Build points
  const points = days.map((d, index) => {
    const x = paddingX + (index / (days.length - 1)) * plotWidth;
    const y = height - paddingY - (d.amount / maxAmount) * plotHeight;
    return { x, y, ...d };
  });

  // Build smooth curve path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white dark:bg-[#161F30] rounded-xl p-4 border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Spending trend
          </h2>
          <span className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">
            Past 7 days: <strong className="font-medium text-[#202633] dark:text-[#F3F5F9] tabular-nums">{formatCurrency(totalWeekly, settings.default_currency)}</strong>
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] flex items-center justify-center text-[#737B89] dark:text-[#8E98A8]">
          <TrendingDown className="w-4 h-4 text-[#2457E6]" />
        </div>
      </div>

      {totalWeekly === 0 ? (
        <div className="py-7 text-center text-[12px] text-[#737B89] dark:text-[#8E98A8]">
          No expenses recorded in the past 7 days.
        </div>
      ) : (
        <div className="relative mt-2">
          {/* Hover popup tooltip */}
          {hoverIndex !== null && (
            <div 
              className="absolute -top-7 transform -translate-x-1/2 bg-[#17233B] text-white text-[11px] font-medium py-1 px-2 rounded-md pointer-events-none shadow-md z-20 whitespace-nowrap tabular-nums border border-[#222C3E]"
              style={{ left: `${points[hoverIndex].x}px` }}
            >
              {points[hoverIndex].label}: {formatCurrency(points[hoverIndex].amount, settings.default_currency)}
            </div>
          )}

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2457E6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2457E6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="currentColor"
              className="text-[#E6E9EF] dark:text-[#222C3E] stroke-1"
            />

            {/* Area */}
            <path d={areaD} fill="url(#spendGrad)" />

            {/* Smooth Line */}
            <path d={pathD} fill="none" stroke="#2457E6" strokeWidth="2" strokeLinecap="round" />

            {/* Interactive Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoverIndex === i ? 4.5 : 3}
                  className={`transition-all duration-150 cursor-pointer ${
                    hoverIndex === i
                      ? 'fill-[#2457E6] stroke-white stroke-2'
                      : 'fill-white dark:fill-[#161F30] stroke-[#2457E6] stroke-[1.5]'
                  }`}
                  onMouseEnter={() => setHoverIndex(i)}
                  onTouchStart={() => setHoverIndex(i)}
                />
              </g>
            ))}
          </svg>

          {/* Labels underneath */}
          <div className="flex justify-between px-1 mt-1 text-[11px] text-[#737B89] dark:text-[#8E98A8] font-normal">
            {days.map((d, i) => (
              <span 
                key={i} 
                className={`text-center transition-colors ${hoverIndex === i ? 'text-[#2457E6] font-medium' : ''}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
