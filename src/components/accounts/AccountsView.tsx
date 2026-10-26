import React, { useState } from 'react';
import { 
  Wallet, 
  Smartphone, 
  Building2, 
  PiggyBank, 
  Plus, 
  ArrowLeftRight, 
  Edit3, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { Account, AccountType } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { AccountModal } from '../modals/AccountModal';

export const AccountsView: React.FC = () => {
  const { accounts, deleteAccount, openAddTransaction, hideBalance } = useFinance();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash': return Wallet;
      case 'mtn_momo':
      case 'orange_money': return Smartphone;
      case 'bank': return Building2;
      case 'savings': return PiggyBank;
      default: return Wallet;
    }
  };

  const handleEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (acc: Account) => {
    try {
      setDeleteError(null);
      await deleteAccount(acc.id);
      setAccountToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Cannot delete account with existing transactions');
    }
  };

  // Group accounts by currency to ensure we never combine differing currencies improperly
  const currencyGroups: Record<string, { total: number; accounts: Account[] }> = {};
  for (const acc of accounts) {
    if (!currencyGroups[acc.currency]) {
      currencyGroups[acc.currency] = { total: 0, accounts: [] };
    }
    currencyGroups[acc.currency].accounts.push(acc);
    currencyGroups[acc.currency].total += acc.current_balance;
  }

  return (
    <div className="p-4 space-y-4 pb-safe-nav">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Accounts
          </h1>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Cash, mobile money & bank balances</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openAddTransaction('transfer')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] text-[12px] font-medium flex items-center space-x-1.5 hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] transition-colors shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#2457E6]" />
            <span>Transfer</span>
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white text-[12px] font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] text-[12px] flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161F30] rounded-xl p-5 max-w-xs w-full shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] space-y-3 text-center">
            <h3 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">Delete account?</h3>
            <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">
              Are you sure you want to delete <strong>{accountToDelete.name}</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setAccountToDelete(null)}
                className="py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9] border border-[#E6E9EF] dark:border-[#222C3E]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(accountToDelete)}
                className="py-2 rounded-lg bg-[#D64545] text-white text-[12px] font-medium shadow-2xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Balances Summary */}
      <div className="space-y-2">
        {Object.entries(currencyGroups).map(([curr, grp]) => (
          <div
            key={curr}
            className="p-4 rounded-xl bg-[#17233B] text-white border border-[#222C3E] flex items-center justify-between shadow-2xs"
          >
            <div>
              <span className="text-[11px] text-[#8E98A8] font-normal">
                Total liquid {curr} assets
              </span>
              <div className="text-[24px] font-semibold tabular-nums mt-0.5">
                {hideBalance ? '••••••••' : formatCurrency(grp.total, curr)}
              </div>
            </div>
            <span className="text-[11px] text-[#8E98A8]">
              {grp.accounts.length} {grp.accounts.length === 1 ? 'account' : 'accounts'}
            </span>
          </div>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-2">
        <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9] px-0.5">
          Accounts list
        </h2>

        <div className="bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] divide-y divide-[#E6E9EF] dark:divide-[#222C3E] overflow-hidden shadow-2xs">
          {accounts.map(acc => {
            const Icon = getAccountIcon(acc.type);
            const isMomo = acc.type === 'mtn_momo';
            const isOrange = acc.type === 'orange_money';

            return (
              <div
                key={acc.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F]/50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: acc.color || '#2457E6' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-[13px] font-medium text-[#202633] dark:text-[#F3F5F9] truncate">
                        {acc.name}
                      </h3>
                      {isMomo && (
                        <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8]">
                          (MoMo)
                        </span>
                      )}
                      {isOrange && (
                        <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8]">
                          (Orange)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#737B89] dark:text-[#8E98A8] mt-0.5">
                      Opening: {formatCurrency(acc.opening_balance, acc.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[14px] font-medium tabular-nums text-[#202633] dark:text-[#F3F5F9] block">
                      {hideBalance ? '••••••' : formatCurrency(acc.current_balance, acc.currency)}
                    </span>
                    <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                      {acc.currency}
                    </span>
                  </div>

                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="p-1.5 text-[#737B89] hover:text-[#2457E6] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] transition-colors"
                      title="Edit account"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="p-1.5 text-[#737B89] hover:text-[#D64545] rounded-md hover:bg-[#D64545]/10 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Modal */}
      <AccountModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
