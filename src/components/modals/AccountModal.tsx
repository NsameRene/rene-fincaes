import React, { useState } from 'react';
import { X, Wallet, Smartphone, Building2, PiggyBank, Plus } from 'lucide-react';
import { Account, AccountType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';

interface Props {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<Props> = ({ account, isOpen, onClose }) => {
  const { addAccount, editAccount, settings } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [currency, setCurrency] = useState(settings.default_currency);
  const [openingBalance, setOpeningBalance] = useState('');
  const [color, setColor] = useState('#2457E6');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setCurrency(account.currency);
      setOpeningBalance(account.opening_balance.toString());
      setColor(account.color || '#2457E6');
    } else {
      setName('');
      setType('cash');
      setCurrency(settings.default_currency);
      setOpeningBalance('0');
      setColor('#2457E6');
    }
    setError(null);
  }, [account, isOpen, settings.default_currency]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an account name');
      return;
    }

    const balanceNum = parseFloat(openingBalance) || 0;

    try {
      if (account) {
        await editAccount(account.id, {
          name: name.trim(),
          type,
          currency,
          color,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          currency,
          opening_balance: balanceNum,
          current_balance: balanceNum,
          color,
          is_active: true,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save account');
    }
  };

  const accountTypes: { id: AccountType; label: string; icon: any; defaultColor: string }[] = [
    { id: 'cash', label: 'Cash in Hand', icon: Wallet, defaultColor: '#2457E6' },
    { id: 'mtn_momo', label: 'MTN MoMo', icon: Smartphone, defaultColor: '#B7791F' },
    { id: 'orange_money', label: 'Orange Money', icon: Smartphone, defaultColor: '#EA580C' },
    { id: 'bank', label: 'Bank Account', icon: Building2, defaultColor: '#17233B' },
    { id: 'savings', label: 'Savings Vault', icon: PiggyBank, defaultColor: '#16845B' },
    { id: 'other', label: 'Other Account', icon: Plus, defaultColor: '#4F46E5' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6E9EF] dark:border-[#222C3E] pb-3">
          <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            {account ? 'Edit account' : 'Add new account'}
          </h2>
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
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Account name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Primary Checking or Cash"
              className="w-full px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none focus:border-[#2457E6]"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Account type</label>
            <div className="grid grid-cols-2 gap-2">
              {accountTypes.map(t => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id);
                      setColor(t.defaultColor);
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-2 text-[12px] transition-colors ${
                      type === t.id
                        ? 'bg-[#2457E6]/10 border-[#2457E6] text-[#2457E6] font-medium'
                        : 'bg-[#F7F8FA] dark:bg-[#0E131F] border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {!account && (
              <div>
                <label className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mb-1 block">Opening balance</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] tabular-nums focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] font-medium text-white text-[12px] shadow-2xs transition-colors"
          >
            {account ? 'Update account' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};
