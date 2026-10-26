import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Download, 
  SlidersHorizontal,
  X,
  Plus
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

export const TransactionsView: React.FC = () => {
  const { transactions, categories, accounts, openAddTransaction, exportCSV, settings } = useFinance();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const accMap = useMemo(() => new Map(accounts.map(a => [a.id, a])), [accounts]);

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category_id === selectedCategory);
    }

    if (selectedAccount !== 'all') {
      result = result.filter(t => t.account_id === selectedAccount || t.to_account_id === selectedAccount);
    }

    if (startDate) {
      result = result.filter(t => t.date >= startDate);
    }

    if (endDate) {
      result = result.filter(t => t.date <= endDate);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(q) ||
        (t.payer_or_payee && t.payer_or_payee.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const c = b.date.localeCompare(a.date);
        return c !== 0 ? c : (b.time || '').localeCompare(a.time || '');
      } else if (sortBy === 'oldest') {
        const c = a.date.localeCompare(b.date);
        return c !== 0 ? c : (a.time || '').localeCompare(b.time || '');
      } else if (sortBy === 'highest') {
        return b.amount - a.amount;
      } else if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, typeFilter, selectedCategory, selectedAccount, startDate, endDate, searchQuery, sortBy]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    for (const tx of filteredTransactions) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    return groups;
  }, [filteredTransactions]);

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedAccount !== 'all' ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0);

  const clearAllFilters = () => {
    setTypeFilter('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleExportFiltered = () => {
    exportCSV({
      type: typeFilter,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      account_id: selectedAccount !== 'all' ? selectedAccount : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      searchQuery: searchQuery || undefined,
      sortBy,
    });
  };

  return (
    <div className="p-4 space-y-3.5 pb-safe-nav">
      {/* Title & Top Action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Activity
          </h1>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportFiltered}
            title="Export to CSV"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] text-[12px] font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => openAddTransaction('expense')}
            className="px-3 py-1.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white font-medium text-[12px] flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Input & Filter Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#737B89] dark:text-[#8E98A8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[13px] text-[#202633] dark:text-[#F3F5F9] placeholder:text-[#737B89] dark:placeholder:text-[#8E98A8] focus:outline-none focus:border-[#2457E6] shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterDrawer(prev => !prev)}
          className={`h-9 px-3 rounded-lg border flex items-center justify-center transition-colors text-[12px] font-medium ${
            activeFilterCount > 0
              ? 'bg-[#2457E6] border-[#2457E6] text-white shadow-2xs'
              : 'bg-white dark:bg-[#161F30] border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9]'
          }`}
          aria-label="Filter options"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 text-[10px] bg-white text-[#2457E6] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Segmented Type Controls */}
      <div className="flex items-center p-0.5 bg-[#E6E9EF]/60 dark:bg-[#0E131F] rounded-lg">
        {[
          { id: 'all', label: 'All' },
          { id: 'expense', label: 'Expenses' },
          { id: 'income', label: 'Income' },
          { id: 'transfer', label: 'Transfers' },
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setTypeFilter(chip.id as any)}
            className={`flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all text-center ${
              typeFilter === chip.id
                ? 'bg-white dark:bg-[#161F30] text-[#202633] dark:text-[#F3F5F9] shadow-2xs'
                : 'text-[#737B89] dark:text-[#8E98A8] hover:text-[#202633] dark:hover:text-[#F3F5F9]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      {showFilterDrawer && (
        <div className="p-3.5 bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] shadow-xs space-y-3 text-[12px]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E9EF] dark:border-[#222C3E]">
            <span className="font-semibold text-[#202633] dark:text-[#F3F5F9]">Refine results</span>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-[#2457E6] text-[11px] font-medium hover:underline">
                Reset filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px]"
              >
                <option value="all">All categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">Account</label>
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px]"
              >
                <option value="all">All accounts</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">Sort order</label>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              {(['newest', 'oldest', 'highest', 'lowest'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`py-1.5 rounded-md border capitalize font-medium transition-colors ${
                    sortBy === s
                      ? 'bg-[#2457E6] border-[#2457E6] text-white'
                      : 'border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8] hover:text-[#202633]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-[#161F30] rounded-xl p-8 text-center border border-[#E6E9EF] dark:border-[#222C3E] space-y-2 mt-4 shadow-2xs">
          <p className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9]">No matching transactions</p>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">
            {activeFilterCount > 0
              ? 'Try clearing active filters to see all transactions.'
              : 'Add your first transaction using the button above.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-2 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px] font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 mt-2">
          {Object.entries(groupedByDate).map(([dateStr, txGroup]) => {
            const dateObj = new Date(dateStr);
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;
            const dateDisplay = isToday
              ? 'Today'
              : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const groupTotal = txGroup.reduce((sum, t) => {
              if (t.type === 'income') return sum + t.amount;
              if (t.type === 'expense') return sum - t.amount;
              return sum;
            }, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date header */}
                <div className="flex items-center justify-between px-1 text-[12px] text-[#737B89] dark:text-[#8E98A8]">
                  <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">{dateDisplay}</span>
                  <span className={`tabular-nums ${groupTotal >= 0 ? 'text-[#16845B]' : 'text-[#737B89] dark:text-[#8E98A8]'}`}>
                    {groupTotal !== 0 && (groupTotal > 0 ? `+${formatCurrency(groupTotal, settings.default_currency)}` : formatCurrency(groupTotal, settings.default_currency))}
                  </span>
                </div>

                {/* Items in date group */}
                <div className="bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] divide-y divide-[#E6E9EF] dark:divide-[#222C3E] overflow-hidden shadow-2xs">
                  {txGroup.map(tx => {
                    const cat = catMap.get(tx.category_id || '');
                    const acc = accMap.get(tx.account_id);
                    const toAcc = tx.to_account_id ? accMap.get(tx.to_account_id) : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="p-3.5 flex items-center justify-between hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F]/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
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
                              {tx.time && <span>{tx.time} ·</span>}
                              <span className="truncate">
                                {tx.type === 'transfer'
                                  ? `${acc?.name || 'Account'} → ${toAcc?.name || 'Account'}`
                                  : cat?.name || 'General'}
                              </span>
                              {tx.payer_or_payee && (
                                <span className="truncate text-[#737B89] dark:text-[#8E98A8]">
                                  ({tx.payer_or_payee})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

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
