import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';

interface Props {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsContributionModal: React.FC<Props> = ({ goal, isOpen, onClose }) => {
  const { contributeToGoal, settings } = useFinance();

  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (type === 'withdrawal' && parsedAmount > goal.current_amount) {
      setError('Cannot withdraw more than current saved amount');
      return;
    }

    try {
      await contributeToGoal({
        goalId: goal.id,
        amount: parsedAmount,
        type,
        date,
        notes: notes.trim() || undefined,
      });

      if (type === 'deposit' && (goal.current_amount + parsedAmount) >= goal.target_amount) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore confetti error
        }
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update goal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6E9EF] dark:border-[#222C3E] pb-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
              {type === 'deposit' ? 'Contribute to goal' : 'Withdraw from goal'}
            </h2>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">{goal.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="bg-[#F7F8FA] dark:bg-[#0E131F] p-3 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-between text-[12px]">
          <div>
            <span className="text-[#737B89] dark:text-[#8E98A8] block text-[10px]">Currently saved</span>
            <span className="font-medium tabular-nums text-[#16845B] text-[14px]">
              {formatCurrency(goal.current_amount, settings.default_currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#737B89] dark:text-[#8E98A8] block text-[10px]">Target</span>
            <span className="font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] text-[14px]">
              {formatCurrency(goal.target_amount, settings.default_currency)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] text-[12px] text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-[#202633] dark:text-[#F3F5F9]">
          {/* Deposit vs Withdraw tabs */}
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#E6E9EF]/60 dark:bg-[#0E131F] rounded-lg">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
                type === 'deposit'
                  ? 'bg-white dark:bg-[#161F30] text-[#16845B] shadow-2xs font-semibold'
                  : 'text-[#737B89] dark:text-[#8E98A8]'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
                type === 'withdrawal'
                  ? 'bg-white dark:bg-[#161F30] text-[#D64545] shadow-2xs font-semibold'
                  : 'text-[#737B89] dark:text-[#8E98A8]'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Amount ({settings.default_currency})</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[18px] font-medium tabular-nums text-center focus:outline-none focus:border-[#2457E6]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Monthly allocation"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white text-[12px] shadow-2xs transition-colors"
          >
            {type === 'deposit' ? 'Confirm deposit' : 'Confirm withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};
