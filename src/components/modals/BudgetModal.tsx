import React, { useState } from 'react';
import { X, PieChart } from 'lucide-react';
import { Budget } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface Props {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetModal: React.FC<Props> = ({ budget, isOpen, onClose }) => {
  const { categories, addBudget, editBudget, settings } = useFinance();

  const [categoryId, setCategoryId] = useState<string>('overall');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [threshold, setThreshold] = useState(80);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (budget) {
      setCategoryId(budget.category_id || 'overall');
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
      setThreshold(budget.alert_threshold);
    } else {
      setCategoryId('overall');
      setAmount('');
      setPeriod('monthly');
      setThreshold(80);
    }
    setError(null);
  }, [budget, isOpen]);

  if (!isOpen) return null;

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a budget amount greater than 0');
      return;
    }

    try {
      const catVal = categoryId === 'overall' ? null : categoryId;
      if (budget) {
        await editBudget(budget.id, {
          category_id: catVal,
          period,
          amount: parsedAmount,
          alert_threshold: threshold,
        });
      } else {
        await addBudget({
          category_id: catVal,
          period,
          amount: parsedAmount,
          alert_threshold: threshold,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6E9EF] dark:border-[#222C3E] pb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[#2457E6]" />
            <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
              {budget ? 'Edit budget' : 'Set budget limit'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] text-[12px] text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-[#202633] dark:text-[#F3F5F9]">
          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Scope</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            >
              <option value="overall">Total overall spending (All categories)</option>
              <optgroup label="Specific expense categories">
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">
              Budget amount ({settings.default_currency})
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[14px] font-medium tabular-nums focus:outline-none focus:border-[#2457E6]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Period</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                  period === 'monthly'
                    ? 'bg-[#2457E6] border-[#2457E6] text-white'
                    : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
                  period === 'weekly'
                    ? 'bg-[#2457E6] border-[#2457E6] text-white'
                    : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#737B89] dark:text-[#8E98A8]'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1">
              <span>Warning alert threshold</span>
              <span className="font-medium text-[#2457E6] tabular-nums">{threshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={threshold}
              onChange={e => setThreshold(parseInt(e.target.value))}
              className="w-full accent-[#2457E6]"
            />
            <p className="text-[10px] text-[#737B89] dark:text-[#8E98A8] mt-0.5">
              Warning shown when spending reaches {threshold}% of limit.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white text-[12px] shadow-2xs transition-colors"
          >
            {budget ? 'Update budget' : 'Save budget'}
          </button>
        </form>
      </div>
    </div>
  );
};
