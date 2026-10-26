import React, { useState } from 'react';
import { X, Trash2, Edit3, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Calendar, Clock, CreditCard, Tag, User, Repeat, Check } from 'lucide-react';
import { Transaction } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<Props> = ({ transaction, onClose }) => {
  const { categories, accounts, deleteTransaction, editTransaction, settings } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit fields
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [payerOrPayee, setPayerOrPayee] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  React.useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setDate(transaction.date);
      setTime(transaction.time || '');
      setPayerOrPayee(transaction.payer_or_payee || '');
      setNotes(transaction.notes || '');
      setIsRecurring(!!transaction.is_recurring);
      setIsEditing(false);
      setConfirmDelete(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const category = categories.find(c => c.id === transaction.category_id);
  const account = accounts.find(a => a.id === transaction.account_id);
  const toAccount = transaction.to_account_id ? accounts.find(a => a.id === transaction.to_account_id) : null;

  const handleDelete = async () => {
    await deleteTransaction(transaction.id);
    onClose();
  };

  const handleSaveEdit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    await editTransaction(transaction.id, {
      amount: parsedAmount,
      description: description.trim(),
      date,
      time: time || undefined,
      payer_or_payee: payerOrPayee.trim() || undefined,
      notes: notes.trim() || undefined,
      is_recurring: isRecurring,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                transaction.type === 'expense'
                  ? 'bg-[#D64545]'
                  : transaction.type === 'income'
                  ? 'bg-[#16845B]'
                  : 'bg-[#2457E6]'
              }`}
            >
              {transaction.type === 'expense' ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : transaction.type === 'income' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowLeftRight className="w-4 h-4" />
              )}
            </span>
            <div>
              <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] capitalize">
                {transaction.type}
              </span>
              <h2 className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9] leading-tight">
                {transaction.description}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount display or edit */}
        {isEditing ? (
          <div className="space-y-2.5 bg-[#F7F8FA] dark:bg-[#0E131F] p-3 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E]">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Amount ({settings.default_currency})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[14px] font-medium tabular-nums focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="bg-[#F7F8FA] dark:bg-[#0E131F] p-4 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] text-center">
            <span
              className={`text-[26px] font-semibold tabular-nums ${
                transaction.type === 'expense'
                  ? 'text-[#D64545]'
                  : transaction.type === 'income'
                  ? 'text-[#16845B]'
                  : 'text-[#202633] dark:text-[#F3F5F9]'
              }`}
            >
              {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : '↔ '}
              {formatCurrency(transaction.amount, account?.currency || settings.default_currency)}
            </span>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{transaction.date}</span>
              {transaction.time && (
                <>
                  <span>·</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{transaction.time}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transaction Meta Details */}
        {!isEditing && (
          <div className="space-y-1.5 text-[12px]">
            {transaction.type !== 'transfer' && category && (
              <div className="flex items-center justify-between py-1.5 border-b border-[#E6E9EF] dark:border-[#222C3E]">
                <span className="text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#737B89]" />
                  <span>Category</span>
                </span>
                <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">{category.name}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-[#E6E9EF] dark:border-[#222C3E]">
              <span className="text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-[#737B89]" />
                <span>{transaction.type === 'transfer' ? 'From account' : 'Account'}</span>
              </span>
              <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">
                {account?.name || 'Account'}
              </span>
            </div>

            {transaction.type === 'transfer' && toAccount && (
              <div className="flex items-center justify-between py-1.5 border-b border-[#E6E9EF] dark:border-[#222C3E]">
                <span className="text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#737B89]" />
                  <span>To account</span>
                </span>
                <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">{toAccount.name}</span>
              </div>
            )}

            {transaction.payer_or_payee && (
              <div className="flex items-center justify-between py-1.5 border-b border-[#E6E9EF] dark:border-[#222C3E]">
                <span className="text-[#737B89] dark:text-[#8E98A8] flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-[#737B89]" />
                  <span>{transaction.type === 'income' ? 'Payer' : 'Payee'}</span>
                </span>
                <span className="font-medium text-[#202633] dark:text-[#F3F5F9]">
                  {transaction.payer_or_payee}
                </span>
              </div>
            )}

            {transaction.notes && (
              <div className="py-1.5 border-b border-[#E6E9EF] dark:border-[#222C3E]">
                <span className="text-[#737B89] dark:text-[#8E98A8] block mb-0.5">Notes</span>
                <p className="text-[#202633] dark:text-[#F3F5F9]">{transaction.notes}</p>
              </div>
            )}

            {transaction.is_recurring && (
              <div className="flex items-center space-x-1.5 text-[#2457E6] text-[11px] font-medium pt-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>Recurring regular transaction</span>
              </div>
            )}
          </div>
        )}

        {/* Actions / Delete Confirmation */}
        {confirmDelete ? (
          <div className="p-3 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 space-y-2 text-center">
            <p className="text-[12px] font-medium text-[#D64545]">
              Delete this transaction?
            </p>
            <p className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
              Account balances will automatically recalculate.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] border border-[#E6E9EF] dark:border-[#222C3E]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="py-1.5 rounded-lg bg-[#D64545] text-[12px] font-medium text-white shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="py-2 rounded-lg bg-[#2457E6] text-[12px] font-medium text-white shadow-2xs flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E]">
            <button
              onClick={() => setIsEditing(true)}
              className="py-2 rounded-lg border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] text-[12px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="py-2 rounded-lg border border-[#D64545]/30 text-[#D64545] hover:bg-[#D64545]/10 text-[12px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
