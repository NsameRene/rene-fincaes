import { Account, Category, AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  default_currency: 'XAF',
  display_name: 'Rene',
  first_day_of_week: 1, // Monday
  pin_enabled: false,
  biometric_enabled: false,
  inactivity_lock_minutes: 1, // default 1 minute inactivity lock
  protect_sensitive_sections: false,
  has_completed_onboarding: false,
  created_at: new Date().toISOString(),
};

export const INITIAL_ACCOUNTS: Omit<Account, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Cash in Hand',
    type: 'cash',
    currency: 'XAF',
    opening_balance: 0,
    current_balance: 0,
    icon: 'Wallet',
    color: '#0284c7', // Sky Blue
    is_active: true,
  },
  {
    name: 'MTN Mobile Money',
    type: 'mtn_momo',
    currency: 'XAF',
    opening_balance: 0,
    current_balance: 0,
    icon: 'Smartphone',
    color: '#eab308', // MTN Yellow
    is_active: true,
  },
  {
    name: 'Orange Money',
    type: 'orange_money',
    currency: 'XAF',
    opening_balance: 0,
    current_balance: 0,
    icon: 'Smartphone',
    color: '#f97316', // Orange
    is_active: true,
  },
  {
    name: 'Bank Account',
    type: 'bank',
    currency: 'XAF',
    opening_balance: 0,
    current_balance: 0,
    icon: 'Building2',
    color: '#1e3a8a', // Deep Blue
    is_active: true,
  },
];

export const INITIAL_INCOME_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', is_default: true },
  { name: 'Business Income', type: 'income', icon: 'Store', color: '#059669', is_default: true },
  { name: 'Teaching / Tutoring', type: 'income', icon: 'GraduationCap', color: '#3b82f6', is_default: true },
  { name: 'Freelance Work', type: 'income', icon: 'Laptop', color: '#6366f1', is_default: true },
  { name: 'Gifts & Grants', type: 'income', icon: 'Gift', color: '#ec4899', is_default: true },
  { name: 'Investment Income', type: 'income', icon: 'TrendingUp', color: '#14b8a6', is_default: true },
  { name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#8b5cf6', is_default: true },
];

export const INITIAL_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#ef4444', is_default: true },
  { name: 'Transport & Fuel', type: 'expense', icon: 'Car', color: '#f59e0b', is_default: true },
  { name: 'Accommodation / Rent', type: 'expense', icon: 'Home', color: '#8b5cf6', is_default: true },
  { name: 'Internet & Airtime', type: 'expense', icon: 'Wifi', color: '#06b6d4', is_default: true },
  { name: 'Education & Books', type: 'expense', icon: 'BookOpen', color: '#3b82f6', is_default: true },
  { name: 'Utilities & Water/Power', type: 'expense', icon: 'Zap', color: '#eab308', is_default: true },
  { name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#f43f5e', is_default: true },
  { name: 'Clothing & Personal', type: 'expense', icon: 'ShoppingBag', color: '#d946ef', is_default: true },
  { name: 'Entertainment & Leisure', type: 'expense', icon: 'Film', color: '#a855f7', is_default: true },
  { name: 'Business Expense', type: 'expense', icon: 'Briefcase', color: '#64748b', is_default: true },
  { name: 'Family Support', type: 'expense', icon: 'Users', color: '#ec4899', is_default: true },
  { name: 'Other Expenses', type: 'expense', icon: 'HelpCircle', color: '#94a3b8', is_default: true },
];
