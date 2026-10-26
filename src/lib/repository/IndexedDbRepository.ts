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
import { IFinanceRepository, TransactionFilters } from './FinanceRepository';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_ACCOUNTS, 
  INITIAL_INCOME_CATEGORIES, 
  INITIAL_EXPENSE_CATEGORIES 
} from '../defaultData';

const DB_NAME = 'rene_finance_db';
const DB_VERSION = 1;

export class IndexedDbRepository implements IFinanceRepository {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open Rene Finance IndexedDB: ${request.error?.message}`));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Stores definition matching SQLite table schemas
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('accounts')) {
          const store = db.createObjectStore('accounts', { keyPath: 'id' });
          store.createIndex('is_active', 'is_active', { unique: false });
        }
        if (!db.objectStoreNames.contains('categories')) {
          const store = db.createObjectStore('categories', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('account_id', 'account_id', { unique: false });
          store.createIndex('category_id', 'category_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('savings_goals')) {
          db.createObjectStore('savings_goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('savings_contributions')) {
          const store = db.createObjectStore('savings_contributions', { keyPath: 'id' });
          store.createIndex('goal_id', 'goal_id', { unique: false });
        }
      };

      request.onsuccess = async () => {
        this.db = request.result;
        await this.ensureInitialSeed();
        resolve();
      };
    });

    return this.initPromise;
  }

  private async ensureInitialSeed(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings) {
      await this.saveRawSettings(DEFAULT_SETTINGS);
    }

    const categories = await this.getCategories();
    if (categories.length === 0) {
      // Seed default categories
      for (const cat of INITIAL_INCOME_CATEGORIES) {
        await this.createCategory(cat);
      }
      for (const cat of INITIAL_EXPENSE_CATEGORIES) {
        await this.createCategory(cat);
      }
    }

    const accounts = await this.getAccounts();
    if (accounts.length === 0) {
      for (const acc of INITIAL_ACCOUNTS) {
        await this.createAccount(acc);
      }
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readonly');
      const req = store.get('app_settings');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve(req.result.value as AppSettings);
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async saveRawSettings(settings: AppSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readwrite');
      const req = store.put({ key: 'app_settings', value: settings });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated: AppSettings = { ...current, ...updates };
    await this.saveRawSettings(updated);
    return updated;
  }

  // --- Accounts ---
  async getAccounts(): Promise<Account[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('accounts', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getAccount(id: string): Promise<Account | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('accounts', 'readonly');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async createAccount(acc: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
    await this.init();
    const now = new Date().toISOString();
    const newAccount: Account = {
      ...acc,
      id: 'acc_' + crypto.randomUUID(),
      current_balance: acc.opening_balance,
      created_at: now,
      updated_at: now,
    };
    return new Promise((resolve, reject) => {
      const store = this.getStore('accounts', 'readwrite');
      const req = store.add(newAccount);
      req.onsuccess = () => resolve(newAccount);
      req.onerror = () => reject(req.error);
    });
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    await this.init();
    const existing = await this.getAccount(id);
    if (!existing) throw new Error(`Account ${id} not found`);

    const updated: Account = {
      ...existing,
      ...updates,
      id, // protect id
      updated_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('accounts', 'readwrite');
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.init();
    // Safety check: verify no transactions reference this account
    const txs = await this.getTransactions();
    const hasTx = txs.some(t => t.account_id === id || t.to_account_id === id);
    if (hasTx) {
      throw new Error('Cannot delete account with existing transactions. Delete or reassign its transactions first.');
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore('accounts', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('categories', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async createCategory(cat: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    await this.init();
    const newCat: Category = {
      ...cat,
      id: 'cat_' + crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const store = this.getStore('categories', 'readwrite');
      const req = store.add(newCat);
      req.onsuccess = () => resolve(newCat);
      req.onerror = () => reject(req.error);
    });
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await this.init();
    const all = await this.getCategories();
    const existing = all.find(c => c.id === id);
    if (!existing) throw new Error(`Category ${id} not found`);

    const updated: Category = {
      ...existing,
      ...updates,
      id,
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('categories', 'readwrite');
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('categories', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Transactions ---
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    await this.init();
    const all = await new Promise<Transaction[]>((resolve, reject) => {
      const store = this.getStore('transactions', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    let results = all;

    if (filters) {
      if (filters.type && filters.type !== 'all') {
        results = results.filter(t => t.type === filters.type);
      }
      if (filters.category_id) {
        results = results.filter(t => t.category_id === filters.category_id);
      }
      if (filters.account_id) {
        results = results.filter(t => t.account_id === filters.account_id || t.to_account_id === filters.account_id);
      }
      if (filters.startDate) {
        results = results.filter(t => t.date >= filters.startDate!);
      }
      if (filters.endDate) {
        results = results.filter(t => t.date <= filters.endDate!);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(t => 
          t.description.toLowerCase().includes(q) ||
          (t.payer_or_payee && t.payer_or_payee.toLowerCase().includes(q)) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
      }

      // Sort
      const sortBy = filters.sortBy || 'newest';
      results.sort((a, b) => {
        if (sortBy === 'newest') {
          const comp = b.date.localeCompare(a.date);
          return comp !== 0 ? comp : (b.time || '').localeCompare(a.time || '');
        } else if (sortBy === 'oldest') {
          const comp = a.date.localeCompare(b.date);
          return comp !== 0 ? comp : (a.time || '').localeCompare(b.time || '');
        } else if (sortBy === 'highest') {
          return b.amount - a.amount;
        } else if (sortBy === 'lowest') {
          return a.amount - b.amount;
        }
        return 0;
      });
    } else {
      results.sort((a, b) => {
        const comp = b.date.localeCompare(a.date);
        return comp !== 0 ? comp : (b.time || '').localeCompare(a.time || '');
      });
    }

    return results;
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('transactions', 'readonly');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async createTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    await this.init();
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    // Save transaction
    await new Promise<void>((resolve, reject) => {
      const store = this.getStore('transactions', 'readwrite');
      const req = store.add(newTx);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Atomically recalculate and update affected balances
    await this.recalculateAccountBalance(newTx.account_id);
    if (newTx.to_account_id) {
      await this.recalculateAccountBalance(newTx.to_account_id);
    }

    return newTx;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    await this.init();
    const existing = await this.getTransaction(id);
    if (!existing) throw new Error(`Transaction ${id} not found`);

    const oldAccountId = existing.account_id;
    const oldToAccountId = existing.to_account_id;

    const updatedTx: Transaction = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const store = this.getStore('transactions', 'readwrite');
      const req = store.put(updatedTx);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Recalculate affected balances
    await this.recalculateAccountBalance(oldAccountId);
    if (oldToAccountId) await this.recalculateAccountBalance(oldToAccountId);
    if (updatedTx.account_id !== oldAccountId) {
      await this.recalculateAccountBalance(updatedTx.account_id);
    }
    if (updatedTx.to_account_id && updatedTx.to_account_id !== oldToAccountId) {
      await this.recalculateAccountBalance(updatedTx.to_account_id);
    }

    return updatedTx;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.init();
    const existing = await this.getTransaction(id);
    if (!existing) return;

    await new Promise<void>((resolve, reject) => {
      const store = this.getStore('transactions', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Recalculate balances
    await this.recalculateAccountBalance(existing.account_id);
    if (existing.to_account_id) {
      await this.recalculateAccountBalance(existing.to_account_id);
    }
  }

  // --- Transfers ---
  async executeTransfer(params: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    date: string;
    time?: string;
    description: string;
    notes?: string;
  }): Promise<Transaction> {
    await this.init();

    if (params.sourceAccountId === params.destinationAccountId) {
      throw new Error('Source and destination accounts must be different');
    }
    if (params.amount <= 0) {
      throw new Error('Transfer amount must be greater than zero');
    }

    const sourceAcc = await this.getAccount(params.sourceAccountId);
    const destAcc = await this.getAccount(params.destinationAccountId);

    if (!sourceAcc || !destAcc) {
      throw new Error('Source or destination account does not exist');
    }

    return this.createTransaction({
      type: 'transfer',
      amount: params.amount,
      account_id: params.sourceAccountId,
      to_account_id: params.destinationAccountId,
      date: params.date,
      time: params.time || new Date().toTimeString().slice(0, 5),
      description: params.description || `Transfer to ${destAcc.name}`,
      notes: params.notes,
    });
  }

  // --- Budgets ---
  async getBudgets(): Promise<Budget[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('budgets', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async createBudget(budget: Omit<Budget, 'id' | 'created_at'>): Promise<Budget> {
    await this.init();
    const newBudget: Budget = {
      ...budget,
      id: 'bdg_' + crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const store = this.getStore('budgets', 'readwrite');
      const req = store.add(newBudget);
      req.onsuccess = () => resolve(newBudget);
      req.onerror = () => reject(req.error);
    });
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    await this.init();
    const all = await this.getBudgets();
    const existing = all.find(b => b.id === id);
    if (!existing) throw new Error(`Budget ${id} not found`);

    const updated: Budget = { ...existing, ...updates, id };
    return new Promise((resolve, reject) => {
      const store = this.getStore('budgets', 'readwrite');
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteBudget(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('budgets', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Savings Goals ---
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('savings_goals', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>): Promise<SavingsGoal> {
    await this.init();
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'svg_' + crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const store = this.getStore('savings_goals', 'readwrite');
      const req = store.add(newGoal);
      req.onsuccess = () => resolve(newGoal);
      req.onerror = () => reject(req.error);
    });
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    await this.init();
    const all = await this.getSavingsGoals();
    const existing = all.find(g => g.id === id);
    if (!existing) throw new Error(`Savings goal ${id} not found`);

    const updated: SavingsGoal = { ...existing, ...updates, id };
    return new Promise((resolve, reject) => {
      const store = this.getStore('savings_goals', 'readwrite');
      const req = store.put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('savings_goals', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Savings Contributions ---
  async getSavingsContributions(goalId: string): Promise<SavingsContribution[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('savings_contributions', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => {
        const all: SavingsContribution[] = req.result || [];
        resolve(all.filter(c => c.goal_id === goalId));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async addSavingsContribution(params: {
    goalId: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    notes?: string;
  }): Promise<SavingsContribution> {
    await this.init();
    const goals = await this.getSavingsGoals();
    const goal = goals.find(g => g.id === params.goalId);
    if (!goal) throw new Error('Goal not found');

    const contribution: SavingsContribution = {
      id: 'sct_' + crypto.randomUUID(),
      goal_id: params.goalId,
      amount: params.amount,
      type: params.type,
      date: params.date,
      notes: params.notes,
      created_at: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const store = this.getStore('savings_contributions', 'readwrite');
      const req = store.add(contribution);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Update goal current_amount
    const newAmount = params.type === 'deposit' 
      ? goal.current_amount + params.amount 
      : Math.max(0, goal.current_amount - params.amount);
    
    const isCompleted = newAmount >= goal.target_amount;
    await this.updateSavingsGoal(goal.id, {
      current_amount: newAmount,
      status: isCompleted ? 'completed' : goal.status,
    });

    return contribution;
  }

  // --- Balance Recalculation Engine ---
  private async recalculateAccountBalance(accountId: string): Promise<void> {
    const acc = await this.getAccount(accountId);
    if (!acc) return;

    const allTxs = await this.getTransactions();
    let balance = acc.opening_balance;

    for (const tx of allTxs) {
      if (tx.type === 'income' && tx.account_id === accountId) {
        balance += tx.amount;
      } else if (tx.type === 'expense' && tx.account_id === accountId) {
        balance -= tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.account_id === accountId) {
          // Source: money moved out
          balance -= tx.amount;
        }
        if (tx.to_account_id === accountId) {
          // Destination: money moved in
          balance += tx.amount;
        }
      }
    }

    await this.updateAccount(accountId, { current_balance: balance });
  }

  async recalculateAllBalances(): Promise<void> {
    const accounts = await this.getAccounts();
    for (const acc of accounts) {
      await this.recalculateAccountBalance(acc.id);
    }
  }

  // --- Backup & Restore ---
  async exportDatabase(): Promise<DatabaseBackup> {
    await this.init();
    const settings = await this.getSettings();
    const accounts = await this.getAccounts();
    const categories = await this.getCategories();
    const transactions = await this.getTransactions();
    const budgets = await this.getBudgets();
    const savings_goals = await this.getSavingsGoals();

    const allContribs: SavingsContribution[] = await new Promise((resolve, reject) => {
      const store = this.getStore('savings_contributions', 'readonly');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    return {
      version: 1,
      app: 'rene_finance',
      exported_at: new Date().toISOString(),
      settings,
      accounts,
      categories,
      transactions,
      budgets,
      savings_goals,
      savings_contributions: allContribs,
    };
  }

  async importDatabase(backup: DatabaseBackup, mode: 'replace' | 'merge'): Promise<void> {
    await this.init();
    if (!backup || backup.app !== 'rene_finance' || !backup.version) {
      throw new Error('Invalid backup file: Not a recognized Rene Finance backup');
    }

    if (mode === 'replace') {
      await this.resetAllData();
      if (backup.settings) await this.saveRawSettings(backup.settings);
      
      for (const a of backup.accounts || []) {
        const store = this.getStore('accounts', 'readwrite');
        store.put(a);
      }
      for (const c of backup.categories || []) {
        const store = this.getStore('categories', 'readwrite');
        store.put(c);
      }
      for (const t of backup.transactions || []) {
        const store = this.getStore('transactions', 'readwrite');
        store.put(t);
      }
      for (const b of backup.budgets || []) {
        const store = this.getStore('budgets', 'readwrite');
        store.put(b);
      }
      for (const g of backup.savings_goals || []) {
        const store = this.getStore('savings_goals', 'readwrite');
        store.put(g);
      }
      for (const sc of backup.savings_contributions || []) {
        const store = this.getStore('savings_contributions', 'readwrite');
        store.put(sc);
      }
    } else {
      // Merge mode
      for (const a of backup.accounts || []) {
        const store = this.getStore('accounts', 'readwrite');
        store.put(a);
      }
      for (const c of backup.categories || []) {
        const store = this.getStore('categories', 'readwrite');
        store.put(c);
      }
      for (const t of backup.transactions || []) {
        const store = this.getStore('transactions', 'readwrite');
        store.put(t);
      }
      for (const b of backup.budgets || []) {
        const store = this.getStore('budgets', 'readwrite');
        store.put(b);
      }
      for (const g of backup.savings_goals || []) {
        const store = this.getStore('savings_goals', 'readwrite');
        store.put(g);
      }
      for (const sc of backup.savings_contributions || []) {
        const store = this.getStore('savings_contributions', 'readwrite');
        store.put(sc);
      }
    }

    await this.recalculateAllBalances();
  }

  async resetAllData(): Promise<void> {
    await this.init();
    const stores = ['accounts', 'categories', 'transactions', 'budgets', 'savings_goals', 'savings_contributions'];
    for (const name of stores) {
      await new Promise<void>((resolve, reject) => {
        const store = this.getStore(name, 'readwrite');
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    // Restore clean default categories and accounts
    for (const cat of INITIAL_INCOME_CATEGORIES) {
      await this.createCategory(cat);
    }
    for (const cat of INITIAL_EXPENSE_CATEGORIES) {
      await this.createCategory(cat);
    }
    for (const acc of INITIAL_ACCOUNTS) {
      await this.createAccount(acc);
    }
  }

  // --- Demo Data ---
  async seedDemoData(currency: string = 'XAF'): Promise<void> {
    await this.init();
    const accounts = await this.getAccounts();
    const categories = await this.getCategories();

    const cashAcc = accounts.find(a => a.type === 'cash') || accounts[0];
    const momoAcc = accounts.find(a => a.type === 'mtn_momo') || accounts[1] || accounts[0];
    const bankAcc = accounts.find(a => a.type === 'bank') || accounts[2] || accounts[0];

    const salaryCat = categories.find(c => c.name.toLowerCase().includes('salary'))?.id;
    const freelanceCat = categories.find(c => c.name.toLowerCase().includes('freelance'))?.id;
    const foodCat = categories.find(c => c.name.toLowerCase().includes('food'))?.id;
    const transportCat = categories.find(c => c.name.toLowerCase().includes('transport'))?.id;
    const rentCat = categories.find(c => c.name.toLowerCase().includes('rent') || c.name.toLowerCase().includes('accommodation'))?.id;
    const internetCat = categories.find(c => c.name.toLowerCase().includes('internet') || c.name.toLowerCase().includes('airtime'))?.id;
    const utilitiesCat = categories.find(c => c.name.toLowerCase().includes('utilities'))?.id;

    // Set realistic opening balances
    if (cashAcc) await this.updateAccount(cashAcc.id, { opening_balance: currency === 'XAF' ? 45000 : 250 });
    if (momoAcc) await this.updateAccount(momoAcc.id, { opening_balance: currency === 'XAF' ? 120000 : 400 });
    if (bankAcc) await this.updateAccount(bankAcc.id, { opening_balance: currency === 'XAF' ? 580000 : 1850 });

    const scale = currency === 'XAF' ? 1 : 0.0016; // approx scale for USD

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const prevMonthNum = today.getMonth() === 0 ? 12 : today.getMonth();
    const prevY = today.getMonth() === 0 ? y - 1 : y;
    const pm = String(prevMonthNum).padStart(2, '0');

    // Sample demo transactions
    const demoTxs: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] = [
      // Previous Month
      {
        type: 'income',
        amount: Math.round(450000 * scale),
        category_id: salaryCat,
        account_id: bankAcc?.id || cashAcc.id,
        date: `${prevY}-${pm}-25`,
        time: '09:00',
        description: 'Monthly Salary Payment',
        payer_or_payee: 'Employer Ltd',
        notes: 'Direct bank deposit',
      },
      {
        type: 'expense',
        amount: Math.round(120000 * scale),
        category_id: rentCat,
        account_id: bankAcc?.id || cashAcc.id,
        date: `${prevY}-${pm}-28`,
        time: '14:20',
        description: 'Apartment Monthly Rent',
        payer_or_payee: 'Landlord',
      },
      // Current Month
      {
        type: 'income',
        amount: Math.round(450000 * scale),
        category_id: salaryCat,
        account_id: bankAcc?.id || cashAcc.id,
        date: `${y}-${m}-01`,
        time: '09:00',
        description: 'Monthly Salary Payment',
        payer_or_payee: 'Employer Ltd',
        notes: 'Monthly regular compensation',
      },
      {
        type: 'income',
        amount: Math.round(85000 * scale),
        category_id: freelanceCat,
        account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-05`,
        time: '16:45',
        description: 'Mobile App Consulting Project',
        payer_or_payee: 'Tech Client',
      },
      {
        type: 'expense',
        amount: Math.round(120000 * scale),
        category_id: rentCat,
        account_id: bankAcc?.id || cashAcc.id,
        date: `${y}-${m}-02`,
        time: '11:00',
        description: 'Apartment Monthly Rent',
        payer_or_payee: 'Landlord',
      },
      {
        type: 'expense',
        amount: Math.round(28500 * scale),
        category_id: foodCat,
        account_id: cashAcc.id,
        date: `${y}-${m}-04`,
        time: '12:30',
        description: 'Weekly Grocery Market run',
        payer_or_payee: 'Central Supermarket',
      },
      {
        type: 'expense',
        amount: Math.round(15000 * scale),
        category_id: transportCat,
        account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-07`,
        time: '08:15',
        description: 'Taxi & Transport Fare',
        payer_or_payee: 'City Cabs',
      },
      {
        type: 'expense',
        amount: Math.round(14900 * scale),
        category_id: internetCat,
        account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-09`,
        time: '10:00',
        description: 'Monthly High-Speed Fiber Internet',
        payer_or_payee: 'Telecom Provider',
      },
      {
        type: 'expense',
        amount: Math.round(22000 * scale),
        category_id: utilitiesCat,
        account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-12`,
        time: '15:10',
        description: 'Electricity & Water Prepaid Bill',
        payer_or_payee: 'Utility Board',
      },
      {
        type: 'expense',
        amount: Math.round(18000 * scale),
        category_id: foodCat,
        account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-15`,
        time: '19:40',
        description: 'Dinner with colleagues',
        payer_or_payee: 'Le Bistro',
      },
      // Transfer: Bank to Mobile Money
      {
        type: 'transfer',
        amount: Math.round(50000 * scale),
        account_id: bankAcc?.id || cashAcc.id,
        to_account_id: momoAcc?.id || cashAcc.id,
        date: `${y}-${m}-06`,
        time: '14:00',
        description: 'Withdrawal to MTN Mobile Money',
        notes: 'Replenishing mobile wallet for daily expenses',
      },
    ];

    for (const tx of demoTxs) {
      await this.createTransaction(tx);
    }

    // Create demo overall and category budget
    await this.createBudget({
      category_id: null,
      period: 'monthly',
      amount: Math.round(350000 * scale),
      alert_threshold: 80,
    });

    if (foodCat) {
      await this.createBudget({
        category_id: foodCat,
        period: 'monthly',
        amount: Math.round(60000 * scale),
        alert_threshold: 75,
      });
    }

    // Create demo savings goal
    await this.createSavingsGoal({
      name: 'Emergency Fund',
      target_amount: Math.round(500000 * scale),
      current_amount: Math.round(280000 * scale),
      target_date: `${y}-12-31`,
      account_id: bankAcc?.id,
      notes: '6 months of living expenses reserve',
      status: 'active',
    });

    await this.createSavingsGoal({
      name: 'New Laptop',
      target_amount: Math.round(350000 * scale),
      current_amount: Math.round(150000 * scale),
      target_date: `${y + 1}-03-31`,
      notes: 'M3 MacBook for development work',
      status: 'active',
    });

    await this.recalculateAllBalances();
  }

  async clearDemoData(): Promise<void> {
    await this.resetAllData();
  }
}
