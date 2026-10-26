import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Calendar, Clock, Tag, CreditCard, User, AlignLeft, Repeat } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';

export const AddTransactionModal: React.FC = () => {
  const { 
    isAddTransactionOpen, 
    closeAddTransaction, 
    addModalInitialType, 
    accounts, 
    categories, 
    addTransaction, 
    transferMoney,
    settings 
  } = useFinance();

  const [txType, setTxType] = useState<TransactionType>(addModalInitialType || 'expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [description, setDescription] = useState('');
  const [payerOrPayee, setPayerOrPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync initial type when opening
  React.useEffect(() => {
    if (isAddTransactionOpen) {
      setTxType(addModalInitialType);
      setAmount('');
      setDescription('');
      setPayerOrPayee('');
      setNotes('');
      setError(null);
      setIsRecurring(false);

      // Select default category
      const filteredCats = categories.filter(c => c.type === (addModalInitialType === 'income' ? 'income' : 'expense'));
      if (filteredCats.length > 0) {
        setCategoryId(filteredCats[0].id);
      }
      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
      if (accounts.length > 1 && !toAccountId) {
        setToAccountId(accounts[1].id);
      }
    }
  }, [isAddTransactionOpen, addModalInitialType, categories, accounts]);

  if (!isAddTransactionOpen) return null;

  const filteredCategories = categories.filter(c => c.type === (txType === 'income' ? 'income' : 'expense'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    try {
      setSubmitting(true);
      if (txType === 'transfer') {
        if (!toAccountId) {
          setError('Please select destination account');
          return;
        }
        if (accountId === toAccountId) {
          setError('Source and destination accounts must be different');
          return;
        }

        await transferMoney({
          sourceAccountId: accountId,
          destinationAccountId: toAccountId,
          amount: parsedAmount,
          date,
          time,
          description: description.trim() || 'Account Transfer',
          notes: notes.trim() || undefined,
        });
      } else {
        if (!categoryId) {
          setError('Please select a category');
          return;
        }

        const selectedCat = categories.find(c => c.id === categoryId);
        await addTransaction({
          type: txType,
          amount: parsedAmount,
          category_id: categoryId,
          account_id: accountId,
          date,
          time,
          description: description.trim() || (selectedCat?.name || (txType === 'income' ? 'Income' : 'Expense')),
          payer_or_payee: payerOrPayee.trim() || undefined,
          notes: notes.trim() || undefined,
          is_recurring: isRecurring,
        });
      }

      closeAddTransaction();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#161F30] rounded-t-xl sm:rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            {txType === 'expense' ? 'Record expense' : txType === 'income' ? 'Record income' : 'Transfer funds'}
          </h2>
          <button
            onClick={closeAddTransaction}
            className="p-1.5 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9] hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-[#202633] dark:text-[#F3F5F9]">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#E6E9EF]/60 dark:bg-[#0E131F] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setTxType('expense');
                const cat = categories.find(c => c.type === 'expense');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
                txType === 'expense'
                  ? 'bg-white dark:bg-[#161F30] text-[#D64545] shadow-2xs font-semibold'
                  : 'text-[#737B89] dark:text-[#8E98A8]'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTxType('income');
                const cat = categories.find(c => c.type === 'income');
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
                txType === 'income'
                  ? 'bg-white dark:bg-[#161F30] text-[#16845B] shadow-2xs font-semibold'
                  : 'text-[#737B89] dark:text-[#8E98A8]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => setTxType('transfer')}
              className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
                txType === 'transfer'
                  ? 'bg-white dark:bg-[#161F30] text-[#2457E6] shadow-2xs font-semibold'
                  : 'text-[#737B89] dark:text-[#8E98A8]'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="text-center py-2 bg-[#F7F8FA] dark:bg-[#0E131F] rounded-lg border border-[#E6E9EF] dark:border-[#222C3E]">
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Amount ({settings.default_currency})</label>
            <div className="flex items-center justify-center mt-0.5">
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full text-center text-[28px] font-semibold tabular-nums text-[#202633] dark:text-[#F3F5F9] bg-transparent focus:outline-none placeholder:text-[#737B89]/40"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] text-[12px] text-center font-medium">
              {error}
            </div>
          )}

          {/* Transfer Accounts */}
          {txType === 'transfer' ? (
            <div className="grid grid-cols-2 gap-2 bg-[#F7F8FA] dark:bg-[#0E131F] p-3 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E]">
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">From account</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.current_balance.toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block mb-1">To account</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} disabled={a.id === accountId}>
                      {a.name} ({a.current_balance.toLocaleString()} {a.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              {/* Category Picker */}
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#737B89]" />
                  <span>Category</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 border border-[#E6E9EF] dark:border-[#222C3E] rounded-lg">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2 rounded-md text-left border transition-all text-[12px] flex flex-col justify-between ${
                        categoryId === cat.id
                          ? 'bg-[#2457E6]/10 border-[#2457E6] text-[#2457E6] font-medium'
                          : 'bg-white dark:bg-[#161F30] border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Picker */}
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#737B89]" />
                  <span>{txType === 'income' ? 'Deposited to account' : 'Paid with account'}</span>
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Balance: {a.current_balance.toLocaleString()} {a.currency}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Description / Title */}
          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={txType === 'expense' ? 'e.g. Grocery purchase' : txType === 'income' ? 'e.g. Client payment' : 'e.g. Transfer to savings'}
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none focus:border-[#2457E6]"
            />
          </div>

          {/* Recipient / Payer */}
          {txType !== 'transfer' && (
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1">
                <User className="w-3.5 h-3.5 text-[#737B89]" />
                <span>{txType === 'income' ? 'Source / Payer' : 'Merchant / Recipient'} (Optional)</span>
              </label>
              <input
                type="text"
                value={payerOrPayee}
                onChange={e => setPayerOrPayee(e.target.value)}
                placeholder={txType === 'income' ? 'e.g. Company or Client' : 'e.g. Supermarket or Service'}
                className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none focus:border-[#2457E6]"
              />
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#737B89]" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#737B89]" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1 mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-[#737B89]" />
              <span>Notes (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none"
            />
          </div>

          {/* Recurring Indicator */}
          {txType !== 'transfer' && (
            <label className="flex items-center space-x-2 text-[12px] text-[#737B89] dark:text-[#8E98A8] cursor-pointer pt-0.5">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="rounded border-[#E6E9EF] text-[#2457E6] focus:ring-[#2457E6]"
              />
              <span className="flex items-center space-x-1">
                <Repeat className="w-3.5 h-3.5 text-[#737B89]" />
                <span>Recurring regular {txType}</span>
              </span>
            </label>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg font-medium text-white text-[13px] bg-[#2457E6] hover:bg-[#1d46b8] transition-colors shadow-2xs"
            >
              {submitting ? 'Saving...' : txType === 'expense' ? 'Record expense' : txType === 'income' ? 'Record income' : 'Complete transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
