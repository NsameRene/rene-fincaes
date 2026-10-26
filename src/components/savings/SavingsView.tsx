import React, { useState } from 'react';
import { Target, Plus, Calendar, ArrowUpCircle, Edit3, Trash2, Trophy } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../lib/currencies';
import { SavingsGoalModal } from '../modals/SavingsGoalModal';
import { SavingsContributionModal } from '../modals/SavingsContributionModal';

export const SavingsView: React.FC = () => {
  const { savingsGoals, deleteSavingsGoal, accounts, settings } = useFinance();

  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<SavingsGoal | null>(null);

  const accMap = new Map(accounts.map(a => [a.id, a.name]));

  const handleEdit = (g: SavingsGoal) => {
    setSelectedGoal(g);
    setIsGoalModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedGoal(null);
    setIsGoalModalOpen(true);
  };

  const totalSavedAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTargetAcrossGoals = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);

  return (
    <div className="p-4 space-y-4 pb-safe-nav">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#202633] dark:text-[#F3F5F9]">
            Savings
          </h1>
          <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8]">Goals, reserves & milestones</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-3 py-1.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white text-[12px] font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New goal</span>
        </button>
      </div>

      {/* Aggregate Savings Banner */}
      {savingsGoals.length > 0 && (
        <div className="p-4 rounded-xl bg-[#17233B] text-white border border-[#222C3E] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8E98A8] font-normal">
              Total accumulated in goals
            </span>
            <span className="text-[11px] text-[#8E98A8]">
              {savingsGoals.filter(g => g.status === 'completed').length} of {savingsGoals.length} completed
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-[24px] font-semibold tabular-nums">
              {formatCurrency(totalSavedAcrossGoals, settings.default_currency)}
            </span>
            <span className="text-[13px] text-[#8E98A8] tabular-nums">
              / {formatCurrency(totalTargetAcrossGoals, settings.default_currency)}
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#222C3E] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#16845B] rounded-full transition-all duration-500"
              style={{
                width: `${totalTargetAcrossGoals > 0 ? Math.min(100, (totalSavedAcrossGoals / totalTargetAcrossGoals) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Goals List */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#161F30] rounded-xl p-8 text-center border border-[#E6E9EF] dark:border-[#222C3E] space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-[#0E131F] text-[#737B89] dark:text-[#8E98A8] mx-auto flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#202633] dark:text-[#F3F5F9]">No savings goals yet</h3>
            <p className="text-[12px] text-[#737B89] dark:text-[#8E98A8] max-w-xs mx-auto mt-0.5">
              Set targets for emergency reserves, major expenses, or investment goals.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-[#2457E6] text-white font-medium text-[13px] hover:bg-[#1d46b8] transition-colors shadow-2xs"
          >
            Create savings goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savingsGoals.map(g => {
            const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
            const remaining = Math.max(0, g.target_amount - g.current_amount);
            const isDone = g.current_amount >= g.target_amount || g.status === 'completed';

            return (
              <div
                key={g.id}
                className="p-4 bg-white dark:bg-[#161F30] rounded-xl border border-[#E6E9EF] dark:border-[#222C3E] shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                        isDone ? 'bg-[#16845B]' : 'bg-[#2457E6]'
                      }`}
                    >
                      {isDone ? <Trophy className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-medium text-[#202633] dark:text-[#F3F5F9]">{g.name}</h3>
                      {g.account_id && (
                        <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8] block">
                          Linked: {accMap.get(g.account_id) || 'Account'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => handleEdit(g)}
                      className="p-1.5 text-[#737B89] hover:text-[#2457E6] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#0E131F] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSavingsGoal(g.id)}
                      className="p-1.5 text-[#737B89] hover:text-[#D64545] rounded-md hover:bg-[#D64545]/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount info */}
                <div className="flex items-baseline justify-between text-[12px] pt-1">
                  <div>
                    <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] block">Saved</span>
                    <span className="tabular-nums font-medium text-[#16845B] text-[14px]">
                      {formatCurrency(g.current_amount, settings.default_currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#737B89] dark:text-[#8E98A8] block">Target</span>
                    <span className="tabular-nums font-medium text-[#202633] dark:text-[#F3F5F9] text-[14px]">
                      {formatCurrency(g.target_amount, settings.default_currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#737B89] dark:text-[#8E98A8]">
                    <span>{pct}% achieved</span>
                    <span>{remaining > 0 ? `${formatCurrency(remaining, settings.default_currency)} remaining` : 'Goal achieved'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E6E9EF] dark:bg-[#222C3E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-[#16845B]' : 'bg-[#2457E6]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Target date and Deposit button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E] text-[12px]">
                  {g.target_date ? (
                    <div className="flex items-center space-x-1 text-[#737B89] dark:text-[#8E98A8] text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Target: {g.target_date}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Open-ended</span>
                  )}

                  <button
                    onClick={() => setContributionGoal(g)}
                    className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[#202633] dark:text-[#F3F5F9] hover:border-[#2457E6]/40 text-[12px] font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 text-[#16845B]" />
                    <span>Contribute / Withdraw</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SavingsGoalModal
        goal={selectedGoal}
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />

      <SavingsContributionModal
        goal={contributionGoal}
        isOpen={!!contributionGoal}
        onClose={() => setContributionGoal(null)}
      />
    </div>
  );
};
