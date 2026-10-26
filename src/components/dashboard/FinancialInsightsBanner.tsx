import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const FinancialInsightsBanner: React.FC = () => {
  const { insights, setActiveTab } = useFinance();

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
          Insights
        </h2>
        <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Rule-based audit</span>
      </div>

      <div className="space-y-2">
        {insights.map(item => {
          const isWarning = item.type === 'warning';
          const isPositive = item.type === 'positive';

          return (
            <div
              key={item.id}
              onClick={() => setActiveTab('analytics')}
              className="p-3.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] flex items-start space-x-3 cursor-pointer hover:border-[#2457E6]/40 transition-colors shadow-2xs"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                ) : isPositive ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                ) : (
                  <Info className="w-4 h-4 text-[#2457E6]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] leading-snug">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-[#737B89] dark:text-[#8E98A8] flex-shrink-0 self-center" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
