import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AccountsView } from './components/accounts/AccountsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { SavingsView } from './components/savings/SavingsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { BiometricLockScreen } from './components/security/BiometricLockScreen';
import { SensitiveAccessModal } from './components/security/SensitiveAccessModal';

const MainAppContent: React.FC = () => {
  const { loading, isLocked, settings, activeTab, sensitiveModal, closeSensitiveModal } = useFinance();

  // Splash loading screen
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white shadow-2xl ring-4 ring-blue-500/20 p-2 mb-4 animate-pulse">
          <img
            src="/assets/aistudio/rene_finance_38616079.jpg"
            alt="Rene Finance"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Rene Finance</h1>
        <p className="text-xs text-blue-300 font-medium mt-1">Understand your money. Control your future.</p>
        <div className="mt-6 flex items-center space-x-1.5 text-slate-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Initializing local database...</span>
        </div>
      </div>
    );
  }

  // App Biometric / PIN lock screen
  if (isLocked) {
    return <BiometricLockScreen />;
  }

  // First-launch onboarding
  if (!settings.has_completed_onboarding) {
    return <OnboardingWizard />;
  }

  return (
    <MobileContainer>
      {/* Top Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'accounts' && <AccountsView />}
        {activeTab === 'budgets' && <BudgetsView />}
        {activeTab === 'savings' && <SavingsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Fixed Bottom Navigation with 5 destinations and prominent center '+' FAB */}
      <BottomNav />

      {/* Global Add / Transfer Modal */}
      <AddTransactionModal />

      {/* Sensitive Action Authorization Modal */}
      <SensitiveAccessModal
        isOpen={!!sensitiveModal?.isOpen}
        actionTitle={sensitiveModal?.title}
        onSuccess={() => sensitiveModal?.resolve?.(true)}
        onCancel={closeSensitiveModal}
      />
    </MobileContainer>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
