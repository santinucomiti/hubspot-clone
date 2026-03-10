import { format, isPast, isToday, parseISO } from 'date-fns';

/**
 * Format amount in cents to a localized currency string.
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = 'EUR',
): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a user-entered currency string (e.g. "12,500" or "12500.00") to cents.
 */
export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return '-';
  }
}

/**
 * Check if a close date is overdue (past due and not today).
 */
export function isOverdue(closeDate: string | null): boolean {
  if (!closeDate) return false;
  try {
    const date = parseISO(closeDate);
    return isPast(date) && !isToday(date);
  } catch {
    return false;
  }
}

/**
 * Get a deal's display status based on its stage flags.
 */
export function getDealStatus(stage?: {
  isWon: boolean;
  isLost: boolean;
}): 'WON' | 'LOST' | 'ACTIVE' {
  if (!stage) return 'ACTIVE';
  if (stage.isWon) return 'WON';
  if (stage.isLost) return 'LOST';
  return 'ACTIVE';
}
