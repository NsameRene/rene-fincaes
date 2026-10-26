import { CurrencyInfo } from '../types';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  XAF: {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'FCFA',
    decimals: 0,
    symbolPosition: 'after',
  },
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    decimals: 0,
    symbolPosition: 'after',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    symbolPosition: 'after',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    symbolPosition: 'before',
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimals: 2,
    symbolPosition: 'before',
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    decimals: 2,
    symbolPosition: 'before',
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    decimals: 2,
    symbolPosition: 'before',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    decimals: 2,
    symbolPosition: 'before',
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    decimals: 2,
    symbolPosition: 'before',
  },
};

export const DEFAULT_CURRENCY = 'XAF';

export function getCurrencyInfo(code?: string): CurrencyInfo {
  if (!code || !SUPPORTED_CURRENCIES[code]) {
    return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
  }
  return SUPPORTED_CURRENCIES[code];
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const info = getCurrencyInfo(currencyCode);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Use Intl.NumberFormat for reliable localized number representation
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(absAmount);

  let formatted = '';
  if (info.symbolPosition === 'before') {
    formatted = `${info.symbol}${formattedNumber}`;
  } else {
    formatted = `${formattedNumber} ${info.symbol}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

export function formatCompactCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const info = getCurrencyInfo(currencyCode);
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formatted = '';
  if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(1)}k`;
  } else {
    formatted = abs.toLocaleString('en-US', { maximumFractionDigits: info.decimals });
  }

  const result = info.symbolPosition === 'before' ? `${info.symbol}${formatted}` : `${formatted} ${info.symbol}`;
  return isNegative ? `-${result}` : result;
}
