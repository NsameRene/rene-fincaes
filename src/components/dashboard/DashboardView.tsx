import React, { useState } from 'react';
import { FinancialOverviewCard } from './FinancialOverviewCard';
import { QuickActionsBar } from './QuickActionsBar';
import { SpendingTrendChart } from './SpendingTrendChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { FinancialInsightsBanner } from './FinancialInsightsBanner';
import { RecentTransactionsList } from './RecentTransactionsList';
import { BudgetModal } from '../modals/BudgetModal';
import { SavingsGoalModal } from '../modals/SavingsGoalModal';

export const DashboardView: React.FC = () => {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);

  return (
    <div className="px-4 py-4 space-y-4 pb-safe-nav">
      {/* 1. Main Balance & Month Stats */}
      <FinancialOverviewCard />

      {/* 2. Quick Action Shortcuts */}
      <QuickActionsBar
        onOpenBudgetModal={() => setBudgetModalOpen(true)}
        onOpenSavingsModal={() => setSavingsModalOpen(true)}
      />

      {/* 3. Deterministic Local Insights */}
      <FinancialInsightsBanner />

      {/* 4. 7-Day Spending Trend Curve */}
      <SpendingTrendChart />

      {/* 5. Category Breakdown Donut */}
      <CategoryDonutChart />

      {/* 6. Recent Activity List */}
      <RecentTransactionsList />

      {/* Modals */}
      <BudgetModal
        budget={null}
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
      />

      <SavingsGoalModal
        goal={null}
        isOpen={savingsModalOpen}
        onClose={() => setSavingsModalOpen(false)}
      />
    </div>
  );
};
