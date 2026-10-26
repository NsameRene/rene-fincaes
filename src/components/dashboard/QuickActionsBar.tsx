import React from 'react';
import { PlusCircle, MinusCircle, ArrowLeftRight, ListFilter, PieChart, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface Props {
  onOpenBudgetModal: () => void;
  onOpenSavingsModal: () => void;
}

export const QuickActionsBar: React.FC<Props> = ({ onOpenBudgetModal, onOpenSavingsModal }) => {
  const { openAddTransaction, setActiveTab } = useFinance();

  const actions = [
    {
      label: 'Add expense',
      icon: MinusCircle,
      onClick: () => openAddTransaction('expense'),
    },
    {
      label: 'Add income',
      icon: PlusCircle,
      onClick: () => openAddTransaction('income'),
    },
    {
      label: 'Transfer',
      icon: ArrowLeftRight,
      onClick: () => openAddTransaction('transfer'),
    },
    {
      label: 'History',
      icon: ListFilter,
      onClick: () => setActiveTab('transactions'),
    },
    {
      label: 'Budget',
      icon: PieChart,
      onClick: onOpenBudgetModal,
    },
    {
      label: 'Goal',
      icon: Target,
      onClick: onOpenSavingsModal,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
          Quick actions
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={act.onClick}
              className="p-3 rounded-xl bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-left flex flex-col justify-between hover:border-[#2457E6]/50 dark:hover:border-[#2457E6]/60 transition-all active:scale-[0.98] shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] flex items-center justify-center text-[#202633] dark:text-[#F3F5F9] group-hover:text-[#2457E6] transition-colors mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-medium text-[#202633] dark:text-[#F3F5F9]">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
