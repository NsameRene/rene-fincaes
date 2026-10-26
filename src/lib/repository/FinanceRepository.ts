import { 
  Account, 
  Category, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  SavingsContribution, 
  AppSettings, 
  DatabaseBackup 
} from '../../types';

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'transfer' | 'all';
  category_id?: string;
  account_id?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface IFinanceRepository {
  init(): Promise<void>;
  
  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account>;
  updateAccount(id: string, updates: Partial<Account>): Promise<Account>;
  deleteAccount(id: string): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Transactions
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  createTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  
  // Transfers (Atomic: balances updated atomically)
  executeTransfer(params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    time?: string;
    description: string;
    notes?: string;
  }): Promise<Transaction>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  createBudget(budget: Omit<Budget, 'id' | 'created_at'>): Promise<Budget>;
  updateBudget(id: string, updates: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: string): Promise<void>;

  // Savings Goals
  getSavingsGoals(): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>): Promise<SavingsGoal>;
  updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: string): Promise<void>;
  
  // Savings Contributions
  getSavingsContributions(goalId: string): Promise<SavingsContribution[]>;
  addSavingsContribution(params: {
    goalId: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    notes?: string;
  }): Promise<SavingsContribution>;

  // Integrity & Balances
  recalculateAllBalances(): Promise<void>;

  // Backup & Restore
  exportDatabase(): Promise<DatabaseBackup>;
  importDatabase(backup: DatabaseBackup, mode: 'replace' | 'merge'): Promise<void>;
  resetAllData(): Promise<void>;

  // Demo Data
  seedDemoData(currency?: string): Promise<void>;
  clearDemoData(): Promise<void>;
}
