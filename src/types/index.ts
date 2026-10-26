export type AccountType = 
  | 'cash'
  | 'mtn_momo'
  | 'orange_money'
  | 'bank'
  | 'savings'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number;
  current_balance: number;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category_id?: string;
  account_id: string;
  to_account_id?: string; // used for transfer
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description: string;
  payer_or_payee?: string;
  notes?: string;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  category_id: string | null; // null for total monthly spending
  period: 'monthly' | 'weekly';
  amount: number;
  alert_threshold: number; // e.g., 75, 90, 100
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  account_id?: string;
  notes?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
  notes?: string;
  created_at: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  default_currency: string;
  display_name: string;
  first_day_of_week: 0 | 1; // 0 = Sunday, 1 = Monday
  pin_enabled: boolean;
  pin_hash?: string;
  biometric_enabled: boolean;
  inactivity_lock_minutes: number; // 0 = immediate on minimize, 1 = 1m, 2 = 2m, 5 = 5m, -1 = off
  protect_sensitive_sections: boolean; // require biometrics/PIN for settings & export
  has_completed_onboarding: boolean;
  last_backup_at?: string;
  created_at: string;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  change_pct?: number;
  category_name?: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

export interface DatabaseBackup {
  version: number;
  app: 'rene_finance';
  exported_at: string;
  settings: AppSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savings_goals: SavingsGoal[];
  savings_contributions: SavingsContribution[];
}
