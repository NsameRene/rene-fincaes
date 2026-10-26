import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { 
  Account, 
  Category, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  AppSettings, 
  DatabaseBackup,
  FinancialInsight 
} from '../types';
import { db, TransactionFilters } from '../lib/repository';
import { calculateRuleBasedInsights } from '../lib/insights';
import { checkBiometrics, promptBiometricAuth, BiometricStatus } from '../lib/biometrics';
import { DEFAULT_SETTINGS } from '../lib/defaultData';

export type ActiveTab = 'home' | 'transactions' | 'analytics' | 'settings' | 'accounts' | 'budgets' | 'savings';

interface FinanceContextType {
  loading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Data
  settings: AppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  insights: FinancialInsight[];

  // Computed Financial Overview
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenditure: number;
  monthlyNetFlow: number;
  prevMonthExpenditure: number;
  prevMonthIncome: number;
  remainingMonthlyBudget: number | null;
  overallBudgetAmount: number | null;
  hideBalance: boolean;
  toggleHideBalance: () => void;

  // Modals state
  isAddTransactionOpen: boolean;
  openAddTransaction: (initialType?: 'expense' | 'income' | 'transfer') => void;
  closeAddTransaction: () => void;
  addModalInitialType: 'expense' | 'income' | 'transfer';

  // Transaction Operations
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<Transaction>;
  editTransaction: (id: string, updates: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  transferMoney: (params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    time?: string;
    description: string;
    notes?: string;
  }) => Promise<Transaction>;

  // Account Operations
  addAccount: (acc: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => Promise<Account>;
  editAccount: (id: string, updates: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;

  // Category Operations
  addCategory: (cat: Omit<Category, 'id' | 'created_at'>) => Promise<Category>;
  editCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Budget Operations
  addBudget: (b: Omit<Budget, 'id' | 'created_at'>) => Promise<Budget>;
  editBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;

  // Savings Goals Operations
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'created_at'>) => Promise<SavingsGoal>;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  contributeToGoal: (params: { goalId: string; amount: number; type: 'deposit' | 'withdrawal'; date: string; notes?: string }) => Promise<void>;

  // Settings & Theme
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  completeOnboarding: (data: {
    display_name: string;
    default_currency: string;
    theme: 'light' | 'dark' | 'system';
    openingBalances: Record<string, number>;
    monthlyBudget?: number;
  }) => Promise<void>;

  // Security, PIN & Biometrics
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
  setAppPin: (pin: string) => Promise<void>;
  removeAppPin: () => Promise<void>;
  biometricStatus: BiometricStatus | null;
  triggerBiometricUnlock: () => Promise<boolean>;
  enableBiometrics: (fallbackPin: string) => Promise<{ success: boolean; error?: string }>;
  disableBiometrics: () => Promise<void>;
  requestSensitiveAccess: (title?: string) => Promise<boolean>;
  sensitiveModal: { isOpen: boolean; title?: string; resolve?: (ok: boolean) => void } | null;
  closeSensitiveModal: () => void;

  // Export / Backup / Reset / Demo
  exportCSV: (filters?: TransactionFilters) => Promise<void>;
  exportJSONBackup: () => Promise<void>;
  importJSONBackup: (backup: DatabaseBackup, mode: 'replace' | 'merge') => Promise<void>;
  resetAllData: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isLocked, setIsLocked] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [sensitiveModal, setSensitiveModal] = useState<{ isOpen: boolean; title?: string; resolve?: (ok: boolean) => void } | null>(null);

  const lastActiveTimestamp = useRef<number>(Date.now());
  const backgroundTimestamp = useRef<number | null>(null);

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<'expense' | 'income' | 'transfer'>('expense');

  // Core Data States
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // Apply theme to DOM
  const applyTheme = useCallback((themeSetting: 'light' | 'dark' | 'system') => {
    const isDark =
      themeSetting === 'dark' ||
      (themeSetting === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      await db.init();
      const [curSettings, curAccounts, curCategories, curTransactions, curBudgets, curGoals] = await Promise.all([
        db.getSettings(),
        db.getAccounts(),
        db.getCategories(),
        db.getTransactions({ sortBy: 'newest' }),
        db.getBudgets(),
        db.getSavingsGoals(),
      ]);

      setSettings(curSettings);
      setAccounts(curAccounts);
      setCategories(curCategories);
      setTransactions(curTransactions);
      setBudgets(curBudgets);
      setSavingsGoals(curGoals);

      applyTheme(curSettings.theme);

      // Check device biometric capabilities
      checkBiometrics().then(setBiometricStatus).catch(console.error);

      // If either PIN or Biometrics is enabled, lock app on launch
      if (curSettings.biometric_enabled || (curSettings.pin_enabled && curSettings.pin_hash)) {
        setIsLocked(true);
      }
    } catch (err) {
      console.error('Failed to load Rene Finance data:', err);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Inactivity tracking & App Background auto-lock
  useEffect(() => {
    const handleUserInteraction = () => {
      lastActiveTimestamp.current = Date.now();
    };

    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    // Visibility change (minimized / switched apps)
    const handleVisibilityChange = () => {
      const isSecured = settings.biometric_enabled || (settings.pin_enabled && !!settings.pin_hash);
      if (!isSecured) return;

      if (document.visibilityState === 'hidden') {
        backgroundTimestamp.current = Date.now();
        // If inactivity lock is set to 0 (immediate on minimize / background)
        if (settings.inactivity_lock_minutes === 0) {
          setIsLocked(true);
        }
      } else if (document.visibilityState === 'visible') {
        // App resumed
        if (backgroundTimestamp.current && settings.inactivity_lock_minutes > 0) {
          const elapsedMinutes = (Date.now() - backgroundTimestamp.current) / (60 * 1000);
          if (elapsedMinutes >= settings.inactivity_lock_minutes) {
            setIsLocked(true);
          }
        }
        backgroundTimestamp.current = null;
        lastActiveTimestamp.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic inactivity timer check (checks every 5 seconds)
    const timerInterval = setInterval(() => {
      const isSecured = settings.biometric_enabled || (settings.pin_enabled && !!settings.pin_hash);
      if (!isSecured || settings.inactivity_lock_minutes <= 0) return;

      const idleMinutes = (Date.now() - lastActiveTimestamp.current) / (60 * 1000);
      if (idleMinutes >= settings.inactivity_lock_minutes) {
        setIsLocked(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timerInterval);
    };
  }, [settings.biometric_enabled, settings.pin_enabled, settings.pin_hash, settings.inactivity_lock_minutes]);

  // Handle system color scheme change dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, applyTheme]);

  // Financial Overview Computations
  const totalBalance = useMemo(() => {
    return accounts.filter(a => a.is_active).reduce((sum, a) => sum + a.current_balance, 0);
  }, [accounts]);

  const { monthlyIncome, monthlyExpenditure, monthlyNetFlow, prevMonthExpenditure, prevMonthIncome } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curPrefix = `${curYear}-${curMonth}`;

    const prevMonthDate = new Date(curYear, now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const prevPrefix = `${prevYear}-${prevMonth}`;

    let mIncome = 0;
    let mExpense = 0;
    let pmIncome = 0;
    let pmExpense = 0;

    for (const t of transactions) {
      if (t.date.startsWith(curPrefix)) {
        if (t.type === 'income') mIncome += t.amount;
        else if (t.type === 'expense') mExpense += t.amount;
      } else if (t.date.startsWith(prevPrefix)) {
        if (t.type === 'income') pmIncome += t.amount;
        else if (t.type === 'expense') pmExpense += t.amount;
      }
    }

    return {
      monthlyIncome: mIncome,
      monthlyExpenditure: mExpense,
      monthlyNetFlow: mIncome - mExpense,
      prevMonthExpenditure: pmExpense,
      prevMonthIncome: pmIncome,
    };
  }, [transactions]);

  // Remaining overall monthly budget
  const overallBudget = useMemo(() => {
    return budgets.find(b => b.category_id === null && b.period === 'monthly') || null;
  }, [budgets]);

  const overallBudgetAmount = overallBudget ? overallBudget.amount : null;
  const remainingMonthlyBudget = overallBudget ? Math.max(0, overallBudget.amount - monthlyExpenditure) : null;

  // Insights
  const insights = useMemo(() => {
    return calculateRuleBasedInsights(transactions, categories, budgets, new Date());
  }, [transactions, categories, budgets]);

  // Modal helpers
  const openAddTransaction = useCallback((initialType: 'expense' | 'income' | 'transfer' = 'expense') => {
    setAddModalInitialType(initialType);
    setIsAddTransactionOpen(true);
  }, []);

  const closeAddTransaction = useCallback(() => {
    setIsAddTransactionOpen(false);
  }, []);

  const toggleHideBalance = useCallback(() => {
    setHideBalance(prev => !prev);
  }, []);

  // Transaction Operations
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await db.createTransaction(tx);
    await refreshData();
    return created;
  }, [refreshData]);

  const editTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updated = await db.updateTransaction(id, updates);
    await refreshData();
    return updated;
  }, [refreshData]);

  const deleteTransaction = useCallback(async (id: string) => {
    await db.deleteTransaction(id);
    await refreshData();
  }, [refreshData]);

  const transferMoney = useCallback(async (params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    time?: string;
    description: string;
    notes?: string;
  }) => {
    const tx = await db.executeTransfer(params);
    await refreshData();
    return tx;
  }, [refreshData]);

  // Account Operations
  const addAccount = useCallback(async (acc: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    const created = await db.createAccount(acc);
    await refreshData();
    return created;
  }, [refreshData]);

  const editAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    const updated = await db.updateAccount(id, updates);
    await refreshData();
    return updated;
  }, [refreshData]);

  const deleteAccount = useCallback(async (id: string) => {
    await db.deleteAccount(id);
    await refreshData();
  }, [refreshData]);

  // Category Operations
  const addCategory = useCallback(async (cat: Omit<Category, 'id' | 'created_at'>) => {
    const created = await db.createCategory(cat);
    await refreshData();
    return created;
  }, [refreshData]);

  const editCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const updated = await db.updateCategory(id, updates);
    await refreshData();
    return updated;
  }, [refreshData]);

  const deleteCategory = useCallback(async (id: string) => {
    await db.deleteCategory(id);
    await refreshData();
  }, [refreshData]);

  // Budget Operations
  const addBudget = useCallback(async (b: Omit<Budget, 'id' | 'created_at'>) => {
    const created = await db.createBudget(b);
    await refreshData();
    return created;
  }, [refreshData]);

  const editBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    const updated = await db.updateBudget(id, updates);
    await refreshData();
    return updated;
  }, [refreshData]);

  const deleteBudget = useCallback(async (id: string) => {
    await db.deleteBudget(id);
    await refreshData();
  }, [refreshData]);

  // Savings Goal Operations
  const addSavingsGoal = useCallback(async (g: Omit<SavingsGoal, 'id' | 'created_at'>) => {
    const created = await db.createSavingsGoal(g);
    await refreshData();
    return created;
  }, [refreshData]);

  const editSavingsGoal = useCallback(async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = await db.updateSavingsGoal(id, updates);
    await refreshData();
    return updated;
  }, [refreshData]);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    await db.deleteSavingsGoal(id);
    await refreshData();
  }, [refreshData]);

  const contributeToGoal = useCallback(async (params: {
    goalId: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    notes?: string;
  }) => {
    await db.addSavingsContribution(params);
    await refreshData();
  }, [refreshData]);

  // Settings & Theme
  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await db.updateSettings(updates);
    setSettings(updated);
    if (updates.theme) applyTheme(updates.theme);
  }, [applyTheme]);

  const completeOnboarding = useCallback(async (data: {
    display_name: string;
    default_currency: string;
    theme: 'light' | 'dark' | 'system';
    openingBalances: Record<string, number>;
    monthlyBudget?: number;
  }) => {
    await db.updateSettings({
      display_name: data.display_name,
      default_currency: data.default_currency,
      theme: data.theme,
      has_completed_onboarding: true,
    });

    // Update opening balances of default accounts
    const currentAccounts = await db.getAccounts();
    for (const [key, balance] of Object.entries(data.openingBalances)) {
      const match = currentAccounts.find(a => a.type === key);
      if (match && balance > 0) {
        await db.updateAccount(match.id, {
          opening_balance: balance,
          current_balance: balance,
          currency: data.default_currency,
        });
      }
    }

    // Set overall monthly budget if provided
    if (data.monthlyBudget && data.monthlyBudget > 0) {
      await db.createBudget({
        category_id: null,
        period: 'monthly',
        amount: data.monthlyBudget,
        alert_threshold: 80,
      });
    }

    await db.recalculateAllBalances();
    await refreshData();
  }, [refreshData]);

  // Security / PIN / Biometrics
  const hashPin = (pin: string) => {
    // Simple fast salt hash for local PIN verification
    return btoa('rene_salt_' + pin.split('').reverse().join(''));
  };

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockApp = useCallback((pin: string): boolean => {
    if (!settings.pin_hash) {
      setIsLocked(false);
      lastActiveTimestamp.current = Date.now();
      return true;
    }
    const enteredHash = hashPin(pin);
    if (enteredHash === settings.pin_hash) {
      setIsLocked(false);
      lastActiveTimestamp.current = Date.now();
      return true;
    }
    return false;
  }, [settings.pin_hash]);

  const setAppPin = useCallback(async (pin: string) => {
    const hashed = hashPin(pin);
    await db.updateSettings({
      pin_enabled: true,
      pin_hash: hashed,
    });
    await refreshData();
  }, [refreshData]);

  const removeAppPin = useCallback(async () => {
    await db.updateSettings({
      pin_enabled: false,
      pin_hash: undefined,
      biometric_enabled: false, // Disabling PIN also disables biometrics to avoid lockout
    });
    setIsLocked(false);
    await refreshData();
  }, [refreshData]);

  // Biometric Unlock Trigger
  const triggerBiometricUnlock = useCallback(async (): Promise<boolean> => {
    const result = await promptBiometricAuth({
      reason: 'Confirm your fingerprint or face to unlock Rene Finance',
    });

    if (result.success) {
      setIsLocked(false);
      lastActiveTimestamp.current = Date.now();
      return true;
    }

    return false;
  }, []);

  // Enable Biometrics with guaranteed fallback PIN
  const enableBiometrics = useCallback(async (fallbackPin: string): Promise<{ success: boolean; error?: string }> => {
    const bioStatus = await checkBiometrics();
    if (!bioStatus.isAvailable) {
      return {
        success: false,
        error: bioStatus.reason || 'Biometric hardware is not available or not enrolled on this device',
      };
    }

    const hashedPin = hashPin(fallbackPin);
    await db.updateSettings({
      biometric_enabled: true,
      pin_enabled: true,
      pin_hash: hashedPin,
    });

    await refreshData();
    return { success: true };
  }, [refreshData]);

  const disableBiometrics = useCallback(async () => {
    await db.updateSettings({
      biometric_enabled: false,
    });
    await refreshData();
  }, [refreshData]);

  // Sensitive Section Protection Request
  const requestSensitiveAccess = useCallback(async (title: string = 'Authorize Sensitive Action'): Promise<boolean> => {
    const isSecured = settings.protect_sensitive_sections && (settings.biometric_enabled || (settings.pin_enabled && !!settings.pin_hash));
    if (!isSecured) {
      return true;
    }

    // Try biometric directly if enabled
    if (settings.biometric_enabled) {
      const bioRes = await promptBiometricAuth({
        reason: `${title} - Confirm your identity`,
      });
      if (bioRes.success) {
        lastActiveTimestamp.current = Date.now();
        return true;
      }
    }

    // Open sensitive access modal for fallback PIN
    return new Promise<boolean>((resolve) => {
      setSensitiveModal({
        isOpen: true,
        title,
        resolve: (ok: boolean) => {
          setSensitiveModal(null);
          if (ok) lastActiveTimestamp.current = Date.now();
          resolve(ok);
        },
      });
    });
  }, [settings.protect_sensitive_sections, settings.biometric_enabled, settings.pin_enabled, settings.pin_hash]);

  const closeSensitiveModal = useCallback(() => {
    if (sensitiveModal?.resolve) {
      sensitiveModal.resolve(false);
    }
    setSensitiveModal(null);
  }, [sensitiveModal]);

  // Export CSV
  const exportCSV = useCallback(async (filters?: TransactionFilters) => {
    const txList = await db.getTransactions(filters);
    const catList = await db.getCategories();
    const accList = await db.getAccounts();

    const catMap = new Map(catList.map(c => [c.id, c.name]));
    const accMap = new Map(accList.map(a => [a.id, a.name]));

    const headers = ['ID', 'Type', 'Date', 'Time', 'Amount', 'Category', 'Account', 'To Account', 'Description', 'Payer/Payee', 'Notes'];
    const rows = txList.map(t => [
      `"${t.id}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      t.amount,
      `"${t.category_id ? catMap.get(t.category_id) || '' : ''}"`,
      `"${accMap.get(t.account_id) || ''}"`,
      `"${t.to_account_id ? accMap.get(t.to_account_id) || '' : ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.payer_or_payee || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rene_finance_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Export JSON Backup
  const exportJSONBackup = useCallback(async () => {
    const backup = await db.exportDatabase();
    await db.updateSettings({ last_backup_at: new Date().toISOString() });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rene_finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    await refreshData();
  }, [refreshData]);

  // Import JSON Backup
  const importJSONBackup = useCallback(async (backup: DatabaseBackup, mode: 'replace' | 'merge') => {
    await db.importDatabase(backup, mode);
    await refreshData();
  }, [refreshData]);

  // Reset
  const resetAllData = useCallback(async () => {
    await db.resetAllData();
    await refreshData();
  }, [refreshData]);

  // Demo
  const seedDemoData = useCallback(async () => {
    await db.seedDemoData(settings.default_currency);
    await refreshData();
  }, [settings.default_currency, refreshData]);

  const clearDemoData = useCallback(async () => {
    await db.clearDemoData();
    await refreshData();
  }, [refreshData]);

  return (
    <FinanceContext.Provider
      value={{
        loading,
        activeTab,
        setActiveTab,
        settings,
        accounts,
        categories,
        transactions,
        budgets,
        savingsGoals,
        insights,
        totalBalance,
        monthlyIncome,
        monthlyExpenditure,
        monthlyNetFlow,
        prevMonthExpenditure,
        prevMonthIncome,
        remainingMonthlyBudget,
        overallBudgetAmount,
        hideBalance,
        toggleHideBalance,
        isAddTransactionOpen,
        openAddTransaction,
        closeAddTransaction,
        addModalInitialType,
        addTransaction,
        editTransaction,
        deleteTransaction,
        transferMoney,
        addAccount,
        editAccount,
        deleteAccount,
        addCategory,
        editCategory,
        deleteCategory,
        addBudget,
        editBudget,
        deleteBudget,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        updateSettings,
        completeOnboarding,
        isLocked,
        lockApp,
        unlockApp,
        setAppPin,
        removeAppPin,
        biometricStatus,
        triggerBiometricUnlock,
        enableBiometrics,
        disableBiometrics,
        requestSensitiveAccess,
        sensitiveModal,
        closeSensitiveModal,
        exportCSV,
        exportJSONBackup,
        importJSONBackup,
        resetAllData,
        seedDemoData,
        clearDemoData,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
