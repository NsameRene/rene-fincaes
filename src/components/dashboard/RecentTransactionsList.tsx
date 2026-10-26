import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, ChevronRight, Inbox } from 'lucide-react';
import { Transaction } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

export const RecentTransactionsList: React.FC = () => {
  const { transactions, categories, accounts, setActiveTab, openAddTransaction, settings } = useFinance();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const catMap = new Map(categories.map(c => [c.id, c]));
  const accMap = new Map(accounts.map(a => [a.id, a]));

  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
          Recent transactions
        </h2>
        {transactions.length > 0 && (
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-[12px] font-medium text-[#2457E6] hover:underline flex items-center"
          >
            <span>View all ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="bg-white dark:bg-[#161F30] rounded-xl p-6 text-center border border-dashed border-[#E6E9EF] dark:border-[#222C3E] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-[#0E131F] text-[#737B89] dark:text-[#8E98A8] mx-auto flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9]">No transactions yet</h3>
            <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] max-w-xs mx-auto mt-0.5">
              Record your first transaction to begin tracking offline.
            </p>
          </div>
          <button
            onClick={() => openAddTransaction('expense')}
            className="px-4 py-2 rounded-lg bg-[#2457E6] text-white font-medium text-[13px] hover:bg-[#1d46b8] transition-colors shadow-2xs"
          >
            Add transaction
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] divide-y divide-[#E6E9EF] dark:divide-[#222C3E] overflow-hidden shadow-2xs">
          {recent.map(tx => {
            const cat = catMap.get(tx.category_id || '');
            const acc = accMap.get(tx.account_id);
            const toAcc = tx.to_account_id ? accMap.get(tx.to_account_id) : null;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 flex items-center justify-between hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F]/50 cursor-pointer transition-colors"
              >
                {/* Left icon & description */}
                <div className="flex items-center space-x-3 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-center flex-shrink-0">
                    {tx.type === 'expense' ? (
                      <ArrowDownRight className="w-4 h-4 text-[#D64545]" />
                    ) : tx.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-[#16845B]" />
                    ) : (
                      <ArrowLeftRight className="w-4 h-4 text-[#2457E6]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] truncate">
                      {tx.description}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5">
                      <span>{tx.date}</span>
                      <span>·</span>
                      <span className="truncate">
                        {tx.type === 'transfer'
                          ? `${acc?.name || 'Account'} → ${toAcc?.name || 'Account'}`
                          : cat?.name || acc?.name || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Amount */}
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-[14px] font-medium tabular-nums block ${
                      tx.type === 'expense'
                        ? 'text-[#D64545]'
                        : tx.type === 'income'
                        ? 'text-[#16845B]'
                        : 'text-[#202633] dark:text-[#F3F5F9]'
                    }`}
                  >
                    {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                    {formatCurrency(tx.amount, acc?.currency || settings.default_currency)}
                  </span>
                  <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                    {acc?.name || ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
