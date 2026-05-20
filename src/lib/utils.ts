import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 1250000 → "Rp 1.250.000"
 */
export function formatRupiah(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
}
