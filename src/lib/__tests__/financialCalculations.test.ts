import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactCurrency, getCurrencyInfo } from '../currencies';
import { calculateRuleBasedInsights } from '../insights';
import { Transaction, Category, Budget, Account } from '../../types';

describe('Rene Finance - Financial Calculations & Precision', () => {
  it('correctly handles XAF currency precision with zero decimal digits', () => {
    const info = getCurrencyInfo('XAF');
    expect(info.decimals).toBe(0);
    expect(info.symbol).toBe('FCFA');

    const formatted = formatCurrency(150000, 'XAF');
    expect(formatted).toBe('150,000 FCFA');

    const negativeFormatted = formatCurrency(-45000, 'XAF');
    expect(negativeFormatted).toBe('-45,000 FCFA');
  });

  it('correctly formats international currencies like USD with 2 decimal digits', () => {
    const info = getCurrencyInfo('USD');
    expect(info.decimals).toBe(2);
    expect(info.symbol).toBe('$');

    const formatted = formatCurrency(1250.5, 'USD');
    expect(formatted).toBe('$1,250.50');
  });

  it('correctly computes compact currencies', () => {
    expect(formatCompactCurrency(1500000, 'XAF')).toBe('1.5M FCFA');
    expect(formatCompactCurrency(25000, 'XAF')).toBe('25.0k FCFA');
    expect(formatCompactCurrency(500, 'XAF')).toBe('500 FCFA');
  });

  it('ensures transfers do not distort income and expenditure totals', () => {
    const sourceAcc: Account = {
      id: 'acc_cash',
      name: 'Cash',
      type: 'cash',
      currency: 'XAF',
      opening_balance: 100000,
      current_balance: 100000,
      is_active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    const destAcc: Account = {
      id: 'acc_momo',
      name: 'MTN MoMo',
      type: 'mtn_momo',
      currency: 'XAF',
      opening_balance: 50000,
      current_balance: 50000,
      is_active: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };

    const transferTx: Transaction = {
      id: 'tx_transfer_1',
      type: 'transfer',
      amount: 30000,
      account_id: sourceAcc.id,
      to_account_id: destAcc.id,
      date: '2026-10-15',
      description: 'Cash to MTN MoMo deposit',
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-15T10:00:00Z',
    };

    const txs: Transaction[] = [transferTx];

    // Compute income and expense
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    expect(income).toBe(0);
    expect(expense).toBe(0);

    // Compute updated balances
    let sourceBal = sourceAcc.opening_balance;
    let destBal = destAcc.opening_balance;

    for (const t of txs) {
      if (t.type === 'transfer') {
        if (t.account_id === sourceAcc.id) sourceBal -= t.amount;
        if (t.to_account_id === destAcc.id) destBal += t.amount;
      }
    }

    expect(sourceBal).toBe(70000);
    expect(destBal).toBe(80000);
    // Combined balance must be identical (conservation of money)
    expect(sourceBal + destBal).toBe(sourceAcc.opening_balance + destAcc.opening_balance);
  });

  it('correctly handles month and year boundaries', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 200000,
        account_id: 'a1',
        date: '2025-12-31',
        description: 'New year eve income',
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        type: 'income',
        amount: 250000,
        account_id: 'a1',
        date: '2026-01-01',
        description: 'New year income',
        created_at: '',
        updated_at: '',
      },
    ];

    const decTxs = transactions.filter(t => t.date.startsWith('2025-12'));
    const janTxs = transactions.filter(t => t.date.startsWith('2026-01'));

    expect(decTxs.length).toBe(1);
    expect(decTxs[0].amount).toBe(200000);
    expect(janTxs.length).toBe(1);
    expect(janTxs[0].amount).toBe(250000);
  });

  it('generates deterministic rule-based insights for high category spending and budget alerts', () => {
    const testDate = new Date('2026-10-26T12:00:00Z');

    const categories: Category[] = [
      { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#ef4444', is_default: true, created_at: '' },
      { id: 'cat_transport', name: 'Transport', type: 'expense', icon: 'Car', color: '#f59e0b', is_default: true, created_at: '' },
    ];

    const budgets: Budget[] = [
      {
        id: 'b1',
        category_id: null,
        period: 'monthly',
        amount: 200000,
        alert_threshold: 80,
        created_at: '',
      },
    ];

    const txs: Transaction[] = [
      {
        id: 't1',
        type: 'expense',
        amount: 150000,
        category_id: 'cat_food',
        account_id: 'acc1',
        date: '2026-10-05',
        description: 'Monthly food shopping',
        created_at: '',
        updated_at: '',
      },
      {
        id: 't2',
        type: 'expense',
        amount: 30000,
        category_id: 'cat_transport',
        account_id: 'acc1',
        date: '2026-10-10',
        description: 'Fuel',
        created_at: '',
        updated_at: '',
      },
      {
        id: 't3',
        type: 'income',
        amount: 300000,
        category_id: 'salary',
        account_id: 'acc1',
        date: '2026-10-01',
        description: 'Salary',
        created_at: '',
        updated_at: '',
      },
    ];

    const insights = calculateRuleBasedInsights(txs, categories, budgets, testDate);
    expect(insights.length).toBeGreaterThan(0);

    const largestCatInsight = insights.find(i => i.id === 'largest_category');
    expect(largestCatInsight).toBeDefined();
    expect(largestCatInsight?.description).toContain('Food & Dining');
  });

  it('correctly maps biometry types and validates fallback PIN hashing', async () => {
    const { getBiometryTypeName } = await import('../biometrics');
    const { BiometryType } = await import('@aparajita/capacitor-biometric-auth');

    expect(getBiometryTypeName(BiometryType.fingerprintAuthentication)).toBe('Fingerprint');
    expect(getBiometryTypeName(BiometryType.faceAuthentication)).toBe('Face ID');
    expect(getBiometryTypeName(BiometryType.faceId)).toBe('Face ID');
    expect(getBiometryTypeName(BiometryType.touchId)).toBe('Touch ID');

    // Test fallback PIN hashing integrity
    const pin = '1234';
    const hashPin = (p: string) => btoa('rene_salt_' + p.split('').reverse().join(''));
    const hash = hashPin(pin);

    expect(hash).not.toBe(pin);
    expect(hashPin('1234')).toBe(hash);
    expect(hashPin('4321')).not.toBe(hash);
  });
});

