import React, { useState } from 'react';
import { X, Target, Calendar } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface Props {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SavingsGoalModal: React.FC<Props> = ({ goal, isOpen, onClose }) => {
  const { addSavingsGoal, editSavingsGoal, accounts, settings } = useFinance();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount.toString());
      setInitialSaved(goal.current_amount.toString());
      setTargetDate(goal.target_date || '');
      setAccountId(goal.account_id || '');
      setNotes(goal.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setInitialSaved('0');
      setTargetDate('');
      setAccountId(accounts[0]?.id || '');
      setNotes('');
    }
    setError(null);
  }, [goal, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a goal name');
      return;
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    const currentNum = parseFloat(initialSaved) || 0;

    try {
      if (goal) {
        await editSavingsGoal(goal.id, {
          name: name.trim(),
          target_amount: targetNum,
          current_amount: currentNum,
          target_date: targetDate || undefined,
          account_id: accountId || undefined,
          notes: notes.trim() || undefined,
          status: currentNum >= targetNum ? 'completed' : 'active',
        });
      } else {
        await addSavingsGoal({
          name: name.trim(),
          target_amount: targetNum,
          current_amount: currentNum,
          target_date: targetDate || undefined,
          account_id: accountId || undefined,
          notes: notes.trim() || undefined,
          status: currentNum >= targetNum ? 'completed' : 'active',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save savings goal');
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
            <Target className="w-4 h-4 text-[#2457E6]" />
            <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
              {goal ? 'Edit savings goal' : 'Create savings goal'}
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
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Goal name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Emergency reserve or equipment"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none focus:border-[#2457E6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Target ({settings.default_currency})</label>
              <input
                type="number"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="1000.00"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[13px] tabular-nums font-medium focus:outline-none focus:border-[#2457E6]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Current saved</label>
              <input
                type="number"
                value={initialSaved}
                onChange={e => setInitialSaved(e.target.value)}
                placeholder="0.00"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[13px] tabular-nums font-medium focus:outline-none focus:border-[#2457E6]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#737B89]" />
              <span>Target date (Optional)</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Linked account (Optional)</label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            >
              <option value="">None (General tracking)</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.current_balance.toLocaleString()} {a.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Milestone notes or purpose"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white text-[12px] shadow-2xs transition-colors"
          >
            {goal ? 'Update goal' : 'Save goal'}
          </button>
        </form>
      </div>
    </div>
  );
};
