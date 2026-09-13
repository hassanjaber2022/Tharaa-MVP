import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { getActiveCurrency } from './theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, maximumFractionDigits: number = 0): string {
  const currency = getActiveCurrency();
  const safeAmount = Math.round(amount || 0);

  if (currency === 'SAR') {
    return `${safeAmount.toLocaleString('ar-SA')} ر.س`;
  }
  if (currency === 'AED') {
    return `${safeAmount.toLocaleString('ar-AE')} د.إ`;
  }
  return `${safeAmount.toLocaleString('ar-KW')} د.ك`;
}
