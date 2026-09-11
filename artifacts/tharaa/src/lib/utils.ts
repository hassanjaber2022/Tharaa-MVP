import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, maximumFractionDigits: number = 3) {
  return new Intl.NumberFormat('ar-KW', {
    style: 'currency',
    currency: 'KWD',
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount);
}
